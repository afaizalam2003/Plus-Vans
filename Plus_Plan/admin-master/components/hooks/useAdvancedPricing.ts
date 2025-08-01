import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface AdvancedPricingResult {
  base_cost: number;
  labor_cost: number;
  disposal_cost: number;
  transport_cost: number;
  surcharges: number;
  discounts: number;
  total_amount: number;
  applied_rules: Array<{
    rule_id: string;
    rule_name: string;
    rule_type: string;
    amount_applied: number;
  }>;
  geographic_multiplier: number;
  seasonal_multiplier: number;
  is_bulk_order: boolean;
  item_count: number;
}

export const useCalculateAdvancedPrice = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (inputData: any): Promise<AdvancedPricingResult> => {
      console.log("Calculating advanced price with input:", inputData);

      const { data, error } = await supabase.rpc("calculate_advanced_price", {
        input_data: inputData,
      });

      if (error) {
        console.error("Error calculating advanced price:", error);
        throw error;
      }

      console.log("Advanced price calculation result:", data);

      return data as unknown as AdvancedPricingResult;
    },
    onError: (error) => {
      console.error("Error calculating advanced price:", error);
      toast({
        title: "Error",
        description: "Failed to calculate advanced price",
        variant: "destructive",
      });
    },
  });
};

