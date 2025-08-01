import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useCalculateLondonEnhancedPrice = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      items_data,
      pickup_postcode,
      access_difficulty = "normal",
      collection_datetime = null,
    }: {
      items_data: any[];
      pickup_postcode: string;
      access_difficulty?: string;
      collection_datetime?: string | null;
    }) => {
      console.log("Calculating London enhanced price with logistics:", {
        items_data,
        pickup_postcode,
        access_difficulty,
        collection_datetime,
      });

      const { data, error } = await supabase.rpc(
        "calculate_london_enhanced_quote_price",
        {
          items_data: items_data,
          pickup_postcode: pickup_postcode,
          access_difficulty: access_difficulty,
          collection_datetime: collection_datetime,
        }
      );

      if (error) {
        console.error("Error calculating London enhanced price:", error);
        throw error;
      }

      console.log("London enhanced price calculation result:", data);
      return data;
    },
    onError: (error) => {
      console.error("Error calculating London enhanced price:", error);
      toast({
        title: "Error",
        description: "Failed to calculate London enhanced price",
        variant: "destructive",
      });
    },
  });
};

