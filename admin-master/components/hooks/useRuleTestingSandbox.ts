import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useRuleTestingSandbox = () => {
  return useQuery({
    queryKey: ["rule-testing-sandbox"],
    queryFn: async () => {
      console.log("Fetching rule testing sandbox data...");
      const { data, error } = await supabase
        .from("rule_testing_sandbox")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching rule testing sandbox:", error);
        throw error;
      }

      console.log("Rule testing sandbox data fetched:", data);
      return data;
    },
  });
};

export const useExecuteRuleTest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      testId,
      scenarioData,
    }: {
      testId: string;
      scenarioData: any;
    }) => {
      console.log("Executing rule test:", { testId, scenarioData });

      const { data, error } = await supabase.rpc(
        "execute_rule_testing_sandbox",
        {
          test_id: testId,
          scenario_data: scenarioData,
        }
      );

      if (error) {
        console.error("Error executing rule test:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rule-testing-sandbox"] });
      toast({
        title: "Rule test executed",
        description: "Test results have been calculated successfully",
      });
    },
    onError: (error) => {
      console.error("Error executing rule test:", error);
      toast({
        title: "Error",
        description: "Failed to execute rule test",
        variant: "destructive",
      });
    },
  });
};

export const useCreateRuleTest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (testData: any) => {
      console.log("Creating rule test:", testData);

      const { data, error } = await supabase
        .from("rule_testing_sandbox")
        .insert(testData)
        .select()
        .single();

      if (error) {
        console.error("Error creating rule test:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rule-testing-sandbox"] });
      toast({
        title: "Rule test created",
        description: "New rule test configuration has been saved",
      });
    },
    onError: (error) => {
      console.error("Error creating rule test:", error);
      toast({
        title: "Error",
        description: "Failed to create rule test",
        variant: "destructive",
      });
    },
  });
};

