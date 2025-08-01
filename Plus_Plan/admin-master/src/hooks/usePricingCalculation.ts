import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

// Define the expected structure of the pricing calculation result
export interface PricingCalculationResult {
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
  geographic_multiplier?: number;
  seasonal_multiplier?: number;
  is_bulk_order?: boolean;
  item_count?: number;
}

export const useCalculatePrice = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (inputData: any): Promise<PricingCalculationResult> => {
      console.log("Calculating price with input:", inputData);

      // Use advanced pricing calculation if enhanced features are needed
      const useAdvanced =
        inputData.item_count > 1 || inputData.enhanced_pricing;

      const functionName = useAdvanced
        ? "calculate_advanced_price"
        : "calculate_dynamic_price";

      const { data, error } = await supabase.rpc(functionName, {
        input_data: inputData,
      });

      if (error) {
        console.error("Error calculating price:", error);
        throw error;
      }

      console.log("Price calculation result:", data);

      // Parse the JSON response and ensure it matches our expected structure
      const result = data as unknown as PricingCalculationResult;
      return result;
    },
    onError: (error) => {
      console.error("Error calculating price:", error);
      toast({
        title: "Error",
        description: "Failed to calculate price",
        variant: "destructive",
      });
    },
  });
};

export const useSavePricingCalculation = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (calculationData: any) => {
      console.log("Saving pricing calculation:", calculationData);

      const { data, error } = await supabase
        .from("pricing_calculations")
        .insert(calculationData)
        .select()
        .single();

      if (error) {
        console.error("Error saving pricing calculation:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Calculation saved",
        description: "Pricing calculation has been saved successfully",
      });
    },
    onError: (error) => {
      console.error("Error saving calculation:", error);
      toast({
        title: "Error",
        description: "Failed to save pricing calculation",
        variant: "destructive",
      });
    },
  });
};
