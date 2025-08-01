import { useQuery } from "@tanstack/react-query";
import http from "@/services/http-common";

export interface NormalizedInvoice {
  id: string;
  invoice_number: string;
  customer_email: string;
  billing_address: string;
  total_amount: number;
  currency: string;
  status: "draft" | "pending" | "overdue" | "sent" | "paid";
  issue_date: string;
  due_date: string;
  // Add any other fields you consume downstream
  customer_name?: string | null;
  financial_quotes?: Array<{
    quote_number?: string;
    customer_email?: string;
  }>;
  bookings?: Array<{
    id: string;
    address?: string;
    postcode?: string;
  }>;
}

export const useFinancialInvoices = () => {
  return useQuery<NormalizedInvoice[], Error>({
    queryKey: ["financial-invoices"],
    queryFn: async () => {
      console.log("Fetching financial invoices via API...");
      
      try {
        // Use our FastAPI endpoint instead of direct Supabase calls
        const response = await http.get('/admin/invoices');
        const data = response.data || [];

        // Filter out paid invoices and normalize the data
        const unpaidInvoices = data.filter((inv: any) => inv.status !== 'paid');
        
        const normalized: NormalizedInvoice[] = unpaidInvoices.map((inv: any) => ({
          id: inv.id,
          invoice_number: inv.invoice_number,
          customer_name: inv.customer_name,
          customer_email: inv.customer_email || '',
          billing_address: inv.billing_address || '',
          total_amount: inv.total_amount || 0,
          currency: (inv.currency || 'GBP').toLowerCase(),
          status: (inv.status || 'draft') as NormalizedInvoice["status"],
          issue_date: inv.issue_date || inv.created_at,
          due_date: inv.due_date,
          // Note: financial_quotes and bookings relationships not available in current API
          // but can be added later if needed
          financial_quotes: [],
          bookings: inv.booking_id ? [{ id: inv.booking_id, address: '', postcode: '' }] : []
        }));

        console.log("Fetched & normalized invoices via API:", normalized);
        return normalized;
      } catch (error: any) {
        console.error("Error fetching financial invoices via API:", error);
        if (error.response) {
          console.error("API Error details:", error.response.data);
        }
        throw error;
      }
    },
  });
};
