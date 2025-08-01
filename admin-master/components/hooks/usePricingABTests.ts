import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface ABTest {
  id: string;
  test_name: string;
  description: string;
  strategy_a: Record<string, any>;
  strategy_b: Record<string, any>;
  allocation_percentage: number;
  status: "draft" | "running" | "paused" | "completed";
  start_date?: string | null;
  end_date?: string | null;
  statistical_significance?: number | null;
  results_summary?: Record<string, any> | null;
  confidence_level: number;
  created_at: string;
  updated_at: string;
}

export interface ABTestAssignment {
  id: string;
  test_id: string;
  customer_identifier: string;
  assigned_strategy: "A" | "B";
  converted_at: string | null;
  created_at: string;
}

export const usePricingABTests = () => {
  return useQuery<ABTest[]>({
    queryKey: ["pricing-ab-tests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_ab_tests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching A/B tests:", error);
        throw error;
      }
      return data || [];
    },
  });
};

export const useABTestAssignments = (testId: string) => {
  return useQuery<ABTestAssignment[]>({
    queryKey: ["ab-test-assignments", testId],
    queryFn: async () => {
      if (!testId) return [];

      const { data, error } = await supabase
        .from("ab_test_assignments")
        .select("*")
        .eq("test_id", testId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching test assignments:", error);
        throw error;
      }
      return data || [];
    },
    enabled: !!testId,
  });
};

export const useCreateABTest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      testData: Omit<ABTest, "id" | "created_at" | "updated_at" | "status">
    ) => {
      const { data, error } = await supabase
        .from("pricing_ab_tests")
        .insert([
          {
            ...testData,
            status: "draft",
          },
        ])
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
        title: "A/B Test Created",
        description: "Your A/B test has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create A/B test. Please try again.",
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
      const { data, error } = await supabase.rpc(
        "calculate_ab_test_significance",
        {
          p_test_id: testId,
        }
      );

      if (error) {
        console.error("Error calculating significance:", error);
        throw error;
      }
      return data;
    },
    onSuccess: (_, testId) => {
      queryClient.invalidateQueries({ queryKey: ["pricing-ab-tests"] });
      queryClient.invalidateQueries({
        queryKey: ["ab-test-assignments", testId],
      });
      toast({
        title: "Success",
        description: "Statistical significance calculated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to calculate statistical significance.",
        variant: "destructive",
      });
    },
  });
};

