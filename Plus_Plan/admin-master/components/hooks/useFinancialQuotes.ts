import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";

type FinancialQuote = Database["public"]["Tables"]["financial_quotes"]["Row"];
type FinancialQuoteInsert = Omit<
  Database["public"]["Tables"]["financial_quotes"]["Insert"],
  "quote_number"
> & {
  quote_number?: string;
};
type FinancialQuoteUpdate =
  Database["public"]["Tables"]["financial_quotes"]["Update"];

export const useFinancialQuotes = () => {
  return useQuery({
    queryKey: ["financial-quotes"],
    queryFn: async () => {
      console.log("Fetching financial quotes...");
      const { data, error } = await supabase
        .from("financial_quotes")
        .select(
          `
          *,
          bookings (
            id,
            address,
            postcode,
            status
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching financial quotes:", error);
        throw error;
      }

      console.log("Financial quotes fetched:", data);
      return data;
    },
  });
};

export const useCreateFinancialQuote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (quoteData: FinancialQuoteInsert) => {
      console.log("Creating financial quote:", quoteData);

      // Generate quote number
      const { data: quoteNumber, error: rpcError } = await supabase.rpc(
        "generate_quote_number"
      );

      if (rpcError) {
        console.error("Error generating quote number:", rpcError);
        throw rpcError;
      }

      const { data, error } = await supabase
        .from("financial_quotes")
        .insert({
          ...quoteData,
          quote_number: quoteNumber,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating financial quote:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-quotes"] });
      toast({
        title: "Quote created",
        description: "Financial quote has been created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating quote:", error);
      toast({
        title: "Error",
        description: "Failed to create financial quote",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateFinancialQuote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: FinancialQuoteUpdate;
    }) => {
      console.log("Updating financial quote:", id, updates);

      const { data, error } = await supabase
        .from("financial_quotes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating financial quote:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-quotes"] });
      toast({
        title: "Quote updated",
        description: "Financial quote has been updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating quote:", error);
      toast({
        title: "Error",
        description: "Failed to update financial quote",
        variant: "destructive",
      });
    },
  });
};

