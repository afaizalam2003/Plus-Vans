'use client';

import React from 'react';
import { format } from 'date-fns';

export interface ReceiptData {
  id: string;
  booking_id?: string;
  invoice_number?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  address: string;
  postcode?: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  transaction_id?: string;
  created_at: string;
  description?: string;
  line_items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  company_details?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
  };
}

export class EnhancedReceiptGenerator {
  private static defaultCompanyDetails = {
    name: 'Plus Vans Clearance Services',
    address: 'London, United Kingdom',
    phone: '+44 (0) 20 XXXX XXXX',
    email: 'info@plusvans.co.uk',
    website: 'www.plusvans.co.uk'
  };

  static generateTextReceipt(data: ReceiptData): string {
    const company = data.company_details || this.defaultCompanyDetails;
    const receiptDate = format(new Date(data.created_at), 'PPP at p');
    
    return `
═══════════════════════════════════════════════════════
                     PAYMENT RECEIPT                    
═══════════════════════════════════════════════════════

Company: ${company.name}
Address: ${company.address}
Phone: ${company.phone}
Email: ${company.email}
${company.website ? `Website: ${company.website}` : ''}

═══════════════════════════════════════════════════════

Receipt ID: ${data.id}
${data.booking_id ? `Booking ID: ${data.booking_id}` : ''}
${data.invoice_number ? `Invoice: ${data.invoice_number}` : ''}
Date: ${receiptDate}

───────────────────────────────────────────────────────

CUSTOMER DETAILS:
Name: ${data.customer_name}
Email: ${data.customer_email}
${data.customer_phone ? `Phone: ${data.customer_phone}` : ''}

SERVICE ADDRESS:
${data.address}
${data.postcode ? data.postcode : ''}

───────────────────────────────────────────────────────

${data.line_items && data.line_items.length > 0 ? 
`SERVICE DETAILS:
${data.line_items.map(item => 
`${item.description}
Quantity: ${item.quantity} × £${item.unit_price.toFixed(2)} = £${item.total.toFixed(2)}`
).join('\n')}

───────────────────────────────────────────────────────` : ''}

${data.description ? `Description: ${data.description}` : ''}

PAYMENT DETAILS:
Amount: £${data.amount.toFixed(2)} ${data.currency.toUpperCase()}
Payment Method: ${data.payment_method}
Status: ${data.payment_status.toUpperCase()}
${data.transaction_id ? `Transaction ID: ${data.transaction_id}` : ''}

═══════════════════════════════════════════════════════

Thank you for choosing ${company.name}!
We appreciate your business.

For any questions regarding this receipt, please contact:
${company.email} | ${company.phone}

═══════════════════════════════════════════════════════
    `;
  }

  static generateHTMLReceipt(data: ReceiptData): string {
    const company = data.company_details || this.defaultCompanyDetails;
    const receiptDate = format(new Date(data.created_at), 'PPP at p');
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Receipt - ${data.id}</title>
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
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .company-details {
            color: #666;
            font-size: 14px;
        }
        .receipt-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
        }
        .customer-section, .service-section, .payment-section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        .detail-label {
            font-weight: 600;
            color: #4b5563;
        }
        .detail-value {
            color: #1f2937;
        }
        .line-items {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .line-items th, .line-items td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        .line-items th {
            background: #f8fafc;
            font-weight: 600;
        }
        .total-amount {
            font-size: 24px;
            font-weight: bold;
            color: #059669;
            text-align: center;
            padding: 20px;
            background: #ecfdf5;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-paid {
            background: #d1fae5;
            color: #065f46;
        }
        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">${company.name}</div>
        <div class="company-details">
            ${company.address}<br>
            ${company.phone} | ${company.email}<br>
            ${company.website || ''}
        </div>
    </div>

    <div class="receipt-info">
        <div>
            <strong>Receipt ID:</strong> ${data.id}<br>
            ${data.booking_id ? `<strong>Booking ID:</strong> ${data.booking_id}<br>` : ''}
            ${data.invoice_number ? `<strong>Invoice:</strong> ${data.invoice_number}<br>` : ''}
        </div>
        <div>
            <strong>Date:</strong> ${receiptDate}
        </div>
    </div>

    <div class="customer-section">
        <div class="section-title">Customer Details</div>
        <div class="detail-row">
            <span class="detail-label">Name:</span>
            <span class="detail-value">${data.customer_name}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${data.customer_email}</span>
        </div>
        ${data.customer_phone ? `
        <div class="detail-row">
            <span class="detail-label">Phone:</span>
            <span class="detail-value">${data.customer_phone}</span>
        </div>
        ` : ''}
    </div>

    <div class="service-section">
        <div class="section-title">Service Address</div>
        <div class="detail-row">
            <span class="detail-label">Address:</span>
            <span class="detail-value">${data.address}</span>
        </div>
        ${data.postcode ? `
        <div class="detail-row">
            <span class="detail-label">Postcode:</span>
            <span class="detail-value">${data.postcode}</span>
        </div>
        ` : ''}
        ${data.description ? `
        <div class="detail-row">
            <span class="detail-label">Description:</span>
            <span class="detail-value">${data.description}</span>
        </div>
        ` : ''}
    </div>

    ${data.line_items && data.line_items.length > 0 ? `
    <div class="service-section">
        <div class="section-title">Service Details</div>
        <table class="line-items">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${data.line_items.map(item => `
                <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>£${item.unit_price.toFixed(2)}</td>
                    <td>£${item.total.toFixed(2)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    <div class="payment-section">
        <div class="section-title">Payment Details</div>
        <div class="detail-row">
            <span class="detail-label">Payment Method:</span>
            <span class="detail-value">${data.payment_method}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value">
                <span class="status-badge ${data.payment_status.toLowerCase() === 'paid' ? 'status-paid' : 'status-pending'}">
                    ${data.payment_status}
                </span>
            </span>
        </div>
        ${data.transaction_id ? `
        <div class="detail-row">
            <span class="detail-label">Transaction ID:</span>
            <span class="detail-value">${data.transaction_id}</span>
        </div>
        ` : ''}
    </div>

    <div class="total-amount">
        Total: £${data.amount.toFixed(2)} ${data.currency.toUpperCase()}
    </div>

    <div class="footer">
        <p><strong>Thank you for choosing ${company.name}!</strong></p>
        <p>We appreciate your business.</p>
        <p>For any questions regarding this receipt, please contact:<br>
        ${company.email} | ${company.phone}</p>
    </div>
</body>
</html>
    `;
  }

  static downloadTextReceipt(data: ReceiptData, filename?: string): void {
    const content = this.generateTextReceipt(data);
    this.downloadFile(content, filename || `receipt-${data.id}.txt`, 'text/plain');
  }

  static downloadHTMLReceipt(data: ReceiptData, filename?: string): void {
    const content = this.generateHTMLReceipt(data);
    this.downloadFile(content, filename || `receipt-${data.id}.html`, 'text/html');
  }

  static printReceipt(data: ReceiptData): void {
    const content = this.generateHTMLReceipt(data);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static generateCSVExport(receipts: ReceiptData[]): string {
    const headers = [
      'Receipt ID',
      'Booking ID',
      'Invoice Number',
      'Customer Name',
      'Customer Email',
      'Address',
      'Amount',
      'Currency',
      'Payment Method',
      'Status',
      'Date',
      'Transaction ID'
    ];

    const rows = receipts.map(receipt => [
      receipt.id,
      receipt.booking_id || '',
      receipt.invoice_number || '',
      receipt.customer_name,
      receipt.customer_email,
      receipt.address,
      receipt.amount.toFixed(2),
      receipt.currency,
      receipt.payment_method,
      receipt.payment_status,
      format(new Date(receipt.created_at), 'yyyy-MM-dd HH:mm:ss'),
      receipt.transaction_id || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  static downloadCSVExport(receipts: ReceiptData[], filename?: string): void {
    const content = this.generateCSVExport(receipts);
    this.downloadFile(
      content, 
      filename || `receipts-export-${format(new Date(), 'yyyy-MM-dd')}.csv`, 
      'text/csv'
    );
  }
}

export default EnhancedReceiptGenerator; 