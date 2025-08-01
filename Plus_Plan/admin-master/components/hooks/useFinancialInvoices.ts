import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";

type FinancialInvoice =
  Database["public"]["Tables"]["financial_invoices"]["Row"];
type FinancialInvoiceInsert =
  Database["public"]["Tables"]["financial_invoices"]["Insert"];
type FinancialInvoiceUpdate =
  Database["public"]["Tables"]["financial_invoices"]["Update"];

export const useFinancialInvoices = () => {
  return useQuery({
    queryKey: ["financial-invoices"],
    queryFn: async () => {
      console.log("Fetching financial invoices...");
      const { data, error } = await supabase
        .from("financial_invoices")
        .select(
          `
          *,
          financial_quotes (
            quote_number,
            customer_email
          ),
          bookings (
            id,
            address,
            postcode
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching financial invoices:", error);
        throw error;
      }

      console.log("Financial invoices fetched:", data);
      return data;
    },
  });
};

export const useCreateFinancialInvoice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (invoiceData: FinancialInvoiceInsert) => {
      console.log("Creating financial invoice:", invoiceData);

      // Generate invoice number
      const { data: invoiceNumber } = await supabase.rpc(
        "generate_invoice_number"
      );

      const { data, error } = await supabase
        .from("financial_invoices")
        .insert({
          ...invoiceData,
          invoice_number: invoiceNumber,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating financial invoice:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-invoices"] });
      toast({
        title: "Invoice created",
        description: "Financial invoice has been created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create financial invoice",
        variant: "destructive",
      });
    },
  });
};

