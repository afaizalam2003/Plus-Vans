import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useEnhancedQuotes = () => {
  return useQuery({
    queryKey: ["enhanced-quotes"],
    queryFn: async () => {
      console.log("Fetching enhanced quotes...");
      const { data, error } = await supabase
        .from("enhanced_quotes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching enhanced quotes:", error);
        throw error;
      }

      console.log("Enhanced quotes fetched:", data);
      return data;
    },
  });
};

export const useCreateEnhancedQuote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (quoteData: any) => {
      console.log("Creating enhanced quote:", quoteData);

      // Generate quote number
      const { data: quoteNumber, error: rpcError } = await supabase.rpc(
        "generate_enhanced_quote_number"
      );

      if (rpcError) {
        console.error("Error generating quote number:", rpcError);
        throw rpcError;
      }

      const { data, error } = await supabase
        .from("enhanced_quotes")
        .insert({
          ...quoteData,
          quote_number: quoteNumber,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating enhanced quote:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enhanced-quotes"] });
      toast({
        title: "Enhanced quote created",
        description: "Enhanced quote has been created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating enhanced quote:", error);
      toast({
        title: "Error",
        description: "Failed to create enhanced quote",
        variant: "destructive",
      });
    },
  });
};

export const useCalculateEnhancedPrice = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      items_data,
      pickup_postcode,
      access_difficulty = "normal",
    }: {
      items_data: any[];
      pickup_postcode: string;
      access_difficulty?: string;
    }) => {
      console.log("Calculating enhanced price with items:", items_data);

      const { data, error } = await supabase.rpc(
        "calculate_enhanced_quote_price",
        {
          items_data: items_data,
          pickup_postcode: pickup_postcode,
          access_difficulty: access_difficulty,
        }
      );

      if (error) {
        console.error("Error calculating enhanced price:", error);
        throw error;
      }

      console.log("Enhanced price calculation result:", data);
      return data;
    },
    onError: (error) => {
      console.error("Error calculating enhanced price:", error);
      toast({
        title: "Error",
        description: "Failed to calculate enhanced price",
        variant: "destructive",
      });
    },
  });
};

