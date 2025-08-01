import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// This hook is specifically for component-related pricing rules
// For global pricing calculations, use @/src/hooks/usePricingCalculation

export const usePricingRules = () => {
  return useQuery({
    queryKey: ["pricing-rules"],
    queryFn: async () => {
      console.log("Fetching pricing rules...");
      const { data, error } = await supabase
        .from("enhanced_pricing_rules")
        .select("*")
        .order("priority", { ascending: true });

      if (error) {
        console.error("Error fetching pricing rules:", error);
        throw error;
      }

      console.log("Pricing rules fetched:", data);
      return data;
    },
  });
};

export const useCreatePricingRule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (ruleData: any) => {
      console.log("Creating pricing rule:", ruleData);

      const { data, error } = await supabase
        .from("enhanced_pricing_rules")
        .insert(ruleData)
        .select()
        .single();

      if (error) {
        console.error("Error creating pricing rule:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-rules"] });
      toast({
        title: "Rule created",
        description: "Pricing rule has been created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating rule:", error);
      toast({
        title: "Error",
        description: "Failed to create pricing rule",
        variant: "destructive",
      });
    },
  });
};

export const useUpdatePricingRule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      console.log("Updating pricing rule:", id, updates);

      const { data, error } = await supabase
        .from("enhanced_pricing_rules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating pricing rule:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-rules"] });
      toast({
        title: "Rule updated",
        description: "Pricing rule has been updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating rule:", error);
      toast({
        title: "Error",
        description: "Failed to update pricing rule",
        variant: "destructive",
      });
    },
  });
};

export const useDeletePricingRule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting pricing rule:", id);

      const { error } = await supabase
        .from("enhanced_pricing_rules")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting pricing rule:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-rules"] });
      toast({
        title: "Rule deleted",
        description: "Pricing rule has been deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting rule:", error);
      toast({
        title: "Error",
        description: "Failed to delete pricing rule",
        variant: "destructive",
      });
    },
  });
};

