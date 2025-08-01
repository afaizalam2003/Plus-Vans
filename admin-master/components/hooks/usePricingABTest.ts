import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const usePricingABTests = () => {
  return useQuery({
    queryKey: ["pricing-ab-tests"],
    queryFn: async () => {
      console.log("Fetching pricing A/B tests...");
      const { data, error } = await supabase
        .from("pricing_ab_tests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching pricing A/B tests:", error);
        throw error;
      }

      console.log("Pricing A/B tests fetched:", data);
      return data;
    },
  });
};

export const useABTestAssignments = (testId?: string) => {
  return useQuery({
    queryKey: ["ab-test-assignments", testId],
    queryFn: async () => {
      console.log("Fetching A/B test assignments...");
      let query = supabase
        .from("ab_test_assignments")
        .select("*")
        .order("assignment_timestamp", { ascending: false });

      if (testId) {
        query = query.eq("test_id", testId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching A/B test assignments:", error);
        throw error;
      }

      console.log("A/B test assignments fetched:", data);
      return data;
    },
    enabled: !!testId,
  });
};

export const useCreateABTest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (testData: any) => {
      console.log("Creating A/B test:", testData);

      const { data, error } = await supabase
        .from("pricing_ab_tests")
        .insert(testData)
        .select()
        .single();

      if (error) {
        console.error("Error creating A/B test:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-ab-tests"] });
      toast({
        title: "A/B test created",
        description: "New pricing A/B test has been configured",
      });
    },
    onError: (error) => {
      console.error("Error creating A/B test:", error);
      toast({
        title: "Error",
        description: "Failed to create A/B test",
        variant: "destructive",
      });
    },
  });
};

export const useCalculateABTestSignificance = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (testId: string) => {
      console.log("Calculating A/B test significance:", testId);

      const { data, error } = await supabase.rpc(
        "calculate_ab_test_significance",
        {
          test_id: testId,
        }
      );

      if (error) {
        console.error("Error calculating A/B test significance:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-ab-tests"] });
      toast({
        title: "Statistical analysis complete",
        description: "A/B test significance has been calculated",
      });
    },
    onError: (error) => {
      console.error("Error calculating A/B test significance:", error);
      toast({
        title: "Error",
        description: "Failed to calculate statistical significance",
        variant: "destructive",
      });
    },
  });
};

