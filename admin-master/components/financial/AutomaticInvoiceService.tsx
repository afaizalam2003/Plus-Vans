import { AutomaticInvoiceGenerator, type InvoiceData, type BookingForInvoice } from './AutomaticInvoiceGenerator';
import http from '@/services/http-common';

interface BookingInvoiceMapping {
  booking_id: string;
  invoice_id: string;
  invoice_number: string;
  created_at: string;
}

export class AutomaticInvoiceService {
  /**
   * Automatically generate invoice for a booking
   * This should be called whenever a new booking is created
   */
  static async generateInvoiceForBooking(booking: BookingForInvoice): Promise<InvoiceData | null> {
    try {
      console.log(`Auto-generating invoice for booking ${booking.id}`);
      
      // Check if invoice already exists for this booking
      const existingInvoice = await this.getInvoiceByBookingId(booking.id);
      if (existingInvoice) {
        console.log(`Invoice already exists for booking ${booking.id}`);
        return existingInvoice;
      }

      // Generate the invoice
      const invoice = AutomaticInvoiceGenerator.generateInvoiceFromBooking(booking);
      
      // Save to database via API
      const saved = await this.saveInvoiceToDatabase(invoice, booking.id);
      if (saved) {
        console.log(`Invoice ${invoice.invoice_number} auto-generated for booking ${booking.id}`);
        return invoice;
      } else {
        console.error(`Failed to save invoice for booking ${booking.id}`);
        return null;
      }
    } catch (error) {
      console.error(`Error auto-generating invoice for booking ${booking.id}:`, error);
      return null;
    }
  }

  /**
   * Generate invoices for all existing bookings (migration)
   */
  static async generateInvoicesForAllBookings(): Promise<{ success: number; failed: number; skipped: number }> {
    try {
      console.log('Starting automatic invoice generation for all existing bookings...');
      
      // Use the admin API endpoint to get bookings
      const response = await http.get('/admin/bookings');
      const bookings = response.data;

      if (!bookings || bookings.length === 0) {
        console.log('No bookings found');
        return { success: 0, failed: 0, skipped: 0 };
      }

      console.log(`Found ${bookings.length} bookings to process`);

      let success = 0;
      let failed = 0;
      let skipped = 0;

      for (const booking of bookings) {
        try {
          // Check if invoice already exists
          const existingInvoice = await this.getInvoiceByBookingId(booking.id);
          if (existingInvoice) {
            skipped++;
            continue;
          }

          // Generate invoice
          const invoice = await this.generateInvoiceForBooking(booking as BookingForInvoice);
          if (invoice) {
            success++;
          } else {
            failed++;
          }
        } catch (error) {
          console.error(`Failed to generate invoice for booking ${booking.id}:`, error);
          failed++;
        }
      }

      console.log(`Invoice generation complete: ${success} success, ${failed} failed, ${skipped} skipped`);
      return { success, failed, skipped };
    } catch (error: any) {
      console.error('Error in generateInvoicesForAllBookings:', error);
      if (error.response?.status === 401) {
        console.error('Authentication failed - please check your login status');
      }
      return { success: 0, failed: 1, skipped: 0 };
    }
  }

  /**
   * Save invoice to database with booking relationship via API
   */
  private static async saveInvoiceToDatabase(invoice: InvoiceData, bookingId: string): Promise<boolean> {
    try {
      console.log('Saving invoice via API...');
      
      // Prepare invoice data for API
      const invoiceData = {
        invoice_number: invoice.invoice_number,
        customer_name: invoice.customer_name,
        customer_email: invoice.customer_email,
        customer_phone: invoice.customer_phone,
        service_address: invoice.service_address,
        subtotal: invoice.subtotal,
        tax_amount: invoice.tax_amount,
        total_amount: invoice.total_amount,
        payment_terms: invoice.payment_terms,
        due_date: invoice.due_date,
        status: 'pending', // New invoices start as pending
        line_items: invoice.line_items,
        created_at: invoice.created_at,
        booking_id: bookingId, // Link to booking
        discount_amount: invoice.discount_amount || 0,
        currency: invoice.currency || 'GBP',
        notes: invoice.notes || '',
        service_postcode: invoice.service_postcode || '',
        company_details: invoice.company_details
      };

      const response = await http.post('/admin/invoices', invoiceData);
      
      if (response.data) {
        console.log('Invoice saved successfully:', response.data.id);
        return true;
      } else {
        console.error('No data returned from invoice creation');
        return false;
      }
    } catch (error: any) {
      console.error('Error saving invoice via API:', error);
      if (error.response) {
        console.error('API Error:', error.response.data);
      }
      return false;
    }
  }

  /**
   * Get invoice by booking ID via API
   */
  private static async getInvoiceByBookingId(bookingId: string): Promise<InvoiceData | null> {
    try {
      const response = await http.get(`/admin/invoices/by-booking/${bookingId}`);
      
      if (response.data && response.data.invoice) {
        const data = response.data.invoice;
        
        // Convert financial_invoices structure back to InvoiceData format
        return {
          id: data.id,
          invoice_number: data.invoice_number,
          booking_id: data.booking_id || bookingId,
          customer_name: data.customer_name || 'Valued Customer',
          customer_email: data.customer_email || '',
          customer_phone: '', // Not stored in financial_invoices
          service_address: data.billing_address || '',
          line_items: [], // Will need to be stored separately if needed
          subtotal: 0, // Will need to be calculated or stored separately
          tax_amount: 0, // Will need to be calculated or stored separately  
          discount_amount: 0, // Not stored in financial_invoices
          total_amount: data.total_amount || 0,
          currency: data.currency || 'GBP',
          status: data.status,
          created_at: data.created_at || data.issue_date,
          due_date: data.due_date,
          payment_terms: 'Net 30', // Default value
          notes: '', // Not stored in financial_invoices
          service_postcode: '', // Not stored in financial_invoices
          company_details: {
            name: 'Plus Vans Ltd',
            address: '123 Business Park, London, UK',
            phone: '+44 20 1234 5678',
            email: 'info@plusvans.co.uk',
            website: 'www.plusvans.co.uk',
            vat_number: 'GB123456789'
          }
        };
      }
      
      return null; // No invoice found
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No invoice found - this is expected for new bookings
        return null;
      }
      console.error('Error getting invoice by booking ID via API:', error);
      return null;
    }
  }

  /**
   * Hook into booking creation process
   * This should be called from the booking creation API/hook
   */
  static async onBookingCreated(booking: BookingForInvoice): Promise<void> {
    try {
      console.log(`New booking created: ${booking.id}, auto-generating invoice...`);
      await this.generateInvoiceForBooking(booking);
    } catch (error) {
      console.error(`Error in onBookingCreated for booking ${booking.id}:`, error);
    }
  }

  /**
   * Update invoice status when payment is received via API
   */
  static async markInvoiceAsPaid(bookingId: string): Promise<boolean> {
    try {
      const response = await http.put(`/admin/invoices/by-booking/${bookingId}`, {
        status: 'paid',
        paid_at: new Date().toISOString()
      });

      if (response.data) {
        console.log(`Invoice for booking ${bookingId} marked as paid`);
        return true;
      } else {
        console.error(`Failed to mark invoice as paid for booking ${bookingId}`);
        return false;
      }
    } catch (error: any) {
      console.error('Error marking invoice as paid via API:', error);
      if (error.response) {
        console.error('API Error:', error.response.data);
      }
      return false;
    }
  }

  /**
   * Get all booking-generated invoices for the financial dashboard via API
   */
  static async getAllBookingInvoices(): Promise<InvoiceData[]> {
    try {
      const response = await http.get('/admin/invoices?booking_invoices_only=true');
      
      if (response.data && Array.isArray(response.data)) {
        // Convert financial_invoices structure to InvoiceData format
        return response.data.map((record: any) => {
          return {
            id: record.id,
            invoice_number: record.invoice_number,
            booking_id: record.booking_id || '',
            customer_name: record.customer_name || 'Valued Customer',
            customer_email: record.customer_email || '',
            customer_phone: '', // Not stored in financial_invoices
            service_address: record.billing_address || '',
            line_items: [], // Will need to be stored separately if needed
            subtotal: 0, // Will need to be calculated or stored separately
            tax_amount: 0, // Will need to be calculated or stored separately
            discount_amount: 0, // Not stored in financial_invoices
            total_amount: record.total_amount || 0,
            currency: record.currency || 'GBP',
            status: record.status,
            created_at: record.created_at || record.issue_date,
            due_date: record.due_date,
            payment_terms: 'Net 30', // Default value
            notes: '', // Not stored in financial_invoices
            service_postcode: '', // Not stored in financial_invoices
            company_details: {
              name: 'Plus Vans Ltd',
              address: '123 Business Park, London, UK',
              phone: '+44 20 1234 5678',
              email: 'info@plusvans.co.uk',
              website: 'www.plusvans.co.uk',
              vat_number: 'GB123456789'
            }
          } as InvoiceData;
        });
      }
      
      return [];
    } catch (error: any) {
      console.error('Error fetching booking invoices via API:', error);
      if (error.response) {
        console.error('API Error:', error.response.data);
      }
      return [];
    }
  }
} 