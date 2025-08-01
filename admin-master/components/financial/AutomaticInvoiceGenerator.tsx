'use client';

import React from 'react';
import { format } from 'date-fns';
// Simple UUID generator function
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  tax_rate?: number;
}

export interface InvoiceData {
  id: string;
  invoice_number: string;
  booking_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  service_address: string;
  service_postcode?: string;
  line_items: InvoiceLineItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  created_at: string;
  due_date: string;
  payment_terms: string;
  notes?: string;
  company_details: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    vat_number?: string;
    company_number?: string;
  };
}

export interface BookingForInvoice {
  id: string;
  customer_details?: Array<{
    full_name?: string;
    email?: string;
    contact_number?: string;
    address?: string;
  }>;
  address: string;
  postcode?: string;
  quote?: {
    breakdown?: {
      price_components?: {
        base_rate?: number;
        hazard_surcharge?: number;
        access_fee?: number;
        dismantling_fee?: number;
        total: number;
      };
    };
  };
  price?: number;
  created_at: string;
  status: string;
}

export class AutomaticInvoiceGenerator {
  private static defaultCompanyDetails = {
    name: 'Plus Vans Clearance Services',
    address: '123 Business Road, London, SW1A 1AA',
    phone: '+44 (0) 20 1234 5678',
    email: 'accounts@plusvans.co.uk',
    website: 'www.plusvans.co.uk',
    vat_number: 'GB123456789',
    company_number: '12345678'
  };

  private static generateInvoiceNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}${day}-${random}`;
  }

  private static calculateDueDate(createdAt: string, paymentTerms: number = 30): string {
    const created = new Date(createdAt);
    const dueDate = new Date(created);
    dueDate.setDate(dueDate.getDate() + paymentTerms);
    return dueDate.toISOString();
  }

  private static generateLineItemsFromBooking(booking: BookingForInvoice): InvoiceLineItem[] {
    const lineItems: InvoiceLineItem[] = [];

    if (booking.quote?.breakdown?.price_components) {
      const components = booking.quote.breakdown.price_components;
      
      if (components.base_rate && components.base_rate > 0) {
        lineItems.push({
          id: generateUUID(),
          description: 'Clearance Service - Base Rate',
          quantity: 1,
          unit_price: components.base_rate,
          total: components.base_rate,
          tax_rate: 20 // 20% VAT
        });
      }

      if (components.hazard_surcharge && components.hazard_surcharge > 0) {
        lineItems.push({
          id: generateUUID(),
          description: 'Hazardous Material Handling Surcharge',
          quantity: 1,
          unit_price: components.hazard_surcharge,
          total: components.hazard_surcharge,
          tax_rate: 20
        });
      }

      if (components.access_fee && components.access_fee > 0) {
        lineItems.push({
          id: generateUUID(),
          description: 'Difficult Access Fee',
          quantity: 1,
          unit_price: components.access_fee,
          total: components.access_fee,
          tax_rate: 20
        });
      }

      if (components.dismantling_fee && components.dismantling_fee > 0) {
        lineItems.push({
          id: generateUUID(),
          description: 'Dismantling and Preparation Fee',
          quantity: 1,
          unit_price: components.dismantling_fee,
          total: components.dismantling_fee,
          tax_rate: 20
        });
      }
    } else {
      // Fallback to simple price if no breakdown available
      const totalPrice = booking.price || 0;
      lineItems.push({
        id: generateUUID(),
        description: 'Clearance Service',
        quantity: 1,
        unit_price: totalPrice,
        total: totalPrice,
        tax_rate: 20
      });
    }

    return lineItems;
  }

  static generateInvoiceFromBooking(
    booking: BookingForInvoice, 
    companyDetails?: Partial<typeof this.defaultCompanyDetails>
  ): InvoiceData {
    const company = { ...this.defaultCompanyDetails, ...companyDetails };
    const lineItems = this.generateLineItemsFromBooking(booking);
    
    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const tax_amount = lineItems.reduce((sum, item) => 
      sum + (item.total * (item.tax_rate || 0) / 100), 0);
    const discount_amount = 0; // Could be configurable
    const total_amount = subtotal + tax_amount - discount_amount;

    const invoiceData: InvoiceData = {
      id: generateUUID(),
      invoice_number: this.generateInvoiceNumber(),
      booking_id: booking.id,
      customer_name: booking.customer_details?.[0]?.full_name || 'Valued Customer',
      customer_email: booking.customer_details?.[0]?.email || '',
      customer_phone: booking.customer_details?.[0]?.contact_number || '',
      customer_address: booking.customer_details?.[0]?.address || '',
      service_address: booking.address,
      service_postcode: booking.postcode,
      line_items: lineItems,
      subtotal,
      tax_amount,
      discount_amount,
      total_amount,
      currency: 'GBP',
      status: 'draft',
      created_at: new Date().toISOString(),
      due_date: this.calculateDueDate(booking.created_at),
      payment_terms: 'Net 30 days',
      notes: `Invoice for clearance service at ${booking.address}`,
      company_details: company
    };

    return invoiceData;
  }

  static generateInvoiceHTML(invoice: InvoiceData): string {
    const formatCurrency = (amount: number) => `£${amount.toFixed(2)}`;
    const formatDate = (dateString: string) => format(new Date(dateString), 'PPP');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice ${invoice.invoice_number}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
            line-height: 1.6;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
        }
        .company-details {
            flex: 1;
        }
        .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .invoice-details {
            flex: 1;
            text-align: right;
        }
        .invoice-title {
            font-size: 36px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .billing-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        .bill-to, .service-address {
            flex: 1;
            margin-right: 20px;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 10px;
            letter-spacing: 1px;
        }
        .line-items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }
        .line-items-table th,
        .line-items-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        .line-items-table th {
            background: #f8fafc;
            font-weight: 600;
            color: #374151;
        }
        .line-items-table tr:hover {
            background: #f9fafb;
        }
        .totals-section {
            float: right;
            width: 300px;
            margin-top: 20px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .total-row.final {
            font-size: 18px;
            font-weight: bold;
            color: #059669;
            border-bottom: 3px solid #059669;
            border-top: 2px solid #e5e7eb;
            margin-top: 10px;
            padding-top: 15px;
        }
        .payment-terms {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
        }
        .payment-terms h4 {
            color: #92400e;
            margin-top: 0;
        }
        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            margin-left: 10px;
        }
        .status-draft {
            background: #fef3c7;
            color: #92400e;
        }
        .status-sent {
            background: #dbeafe;
            color: #1e40af;
        }
        .status-paid {
            background: #d1fae5;
            color: #065f46;
        }
        .status-overdue {
            background: #fee2e2;
            color: #dc2626;
        }
        @media print {
            body { margin: 0; padding: 15px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-details">
            <div class="company-name">${invoice.company_details.name}</div>
            <div>
                ${invoice.company_details.address}<br>
                ${invoice.company_details.phone}<br>
                ${invoice.company_details.email}<br>
                ${invoice.company_details.website || ''}
            </div>
            ${invoice.company_details.vat_number ? `<div style="margin-top: 10px; font-size: 12px; color: #666;">VAT: ${invoice.company_details.vat_number}</div>` : ''}
        </div>
        <div class="invoice-details">
            <div class="invoice-title">INVOICE
                <span class="status-badge status-${invoice.status}">${invoice.status}</span>
            </div>
            <div style="font-size: 16px; margin-bottom: 20px;">
                <strong>Invoice #:</strong> ${invoice.invoice_number}<br>
                <strong>Date:</strong> ${formatDate(invoice.created_at)}<br>
                <strong>Due:</strong> ${formatDate(invoice.due_date)}<br>
                <strong>Booking:</strong> ${invoice.booking_id.slice(0, 8)}...
            </div>
        </div>
    </div>

    <div class="billing-section">
        <div class="bill-to">
            <div class="section-title">Bill To:</div>
            <div style="font-size: 16px;">
                <strong>${invoice.customer_name}</strong><br>
                ${invoice.customer_email}<br>
                ${invoice.customer_phone ? `${invoice.customer_phone}<br>` : ''}
                ${invoice.customer_address ? `${invoice.customer_address}` : ''}
            </div>
        </div>
        <div class="service-address">
            <div class="section-title">Service Address:</div>
            <div style="font-size: 16px;">
                ${invoice.service_address}<br>
                ${invoice.service_postcode || ''}
            </div>
        </div>
    </div>

    <table class="line-items-table">
        <thead>
            <tr>
                <th>Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">VAT Rate</th>
                <th style="text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            ${invoice.line_items.map(item => `
            <tr>
                <td>${item.description}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${formatCurrency(item.unit_price)}</td>
                <td style="text-align: right;">${item.tax_rate || 0}%</td>
                <td style="text-align: right;">${formatCurrency(item.total)}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="totals-section">
        <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(invoice.subtotal)}</span>
        </div>
        ${invoice.discount_amount > 0 ? `
        <div class="total-row">
            <span>Discount:</span>
            <span>-${formatCurrency(invoice.discount_amount)}</span>
        </div>
        ` : ''}
        <div class="total-row">
            <span>VAT (20%):</span>
            <span>${formatCurrency(invoice.tax_amount)}</span>
        </div>
        <div class="total-row final">
            <span>Total:</span>
            <span>${formatCurrency(invoice.total_amount)}</span>
        </div>
    </div>

    <div style="clear: both;"></div>

    <div class="payment-terms">
        <h4>Payment Terms & Information</h4>
        <p><strong>Payment Terms:</strong> ${invoice.payment_terms}</p>
        <p><strong>Due Date:</strong> ${formatDate(invoice.due_date)}</p>
        ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
        <p style="font-size: 14px; margin-top: 15px;">
            Please include invoice number <strong>${invoice.invoice_number}</strong> with your payment.
        </p>
    </div>

    <div class="footer">
        <p><strong>Thank you for choosing ${invoice.company_details.name}!</strong></p>
        <p>For any questions regarding this invoice, please contact:<br>
        ${invoice.company_details.email} | ${invoice.company_details.phone}</p>
        ${invoice.company_details.company_number ? `<p style="font-size: 12px; margin-top: 15px;">Company Registration: ${invoice.company_details.company_number}</p>` : ''}
    </div>
</body>
</html>
    `;
  }

  static downloadInvoiceHTML(invoice: InvoiceData): void {
    const content = this.generateInvoiceHTML(invoice);
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoice.invoice_number}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static printInvoice(invoice: InvoiceData): void {
    const content = this.generateInvoiceHTML(invoice);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  }

  // Simulate saving to database (in real implementation, this would call your API)
  static async saveInvoiceToDatabase(invoice: InvoiceData): Promise<boolean> {
    try {
      // This would be your actual API call to save invoice
      console.log('Saving invoice to database:', invoice);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation:
      // const response = await fetch('/api/invoices', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(invoice)
      // });
      // return response.ok;
      
      return true;
    } catch (error) {
      console.error('Error saving invoice:', error);
      return false;
    }
  }

  // Bulk invoice generation for multiple bookings
  static async generateInvoicesFromBookings(
    bookings: BookingForInvoice[], 
    autoSave: boolean = true
  ): Promise<InvoiceData[]> {
    const invoices: InvoiceData[] = [];
    
    for (const booking of bookings) {
      try {
        const invoice = this.generateInvoiceFromBooking(booking);
        invoices.push(invoice);
        
        if (autoSave) {
          await this.saveInvoiceToDatabase(invoice);
        }
      } catch (error) {
        console.error(`Error generating invoice for booking ${booking.id}:`, error);
      }
    }
    
    return invoices;
  }
}

export default AutomaticInvoiceGenerator; 