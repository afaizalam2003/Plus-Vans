import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useVisualRuleBuilder = () => {
  return useQuery({
    queryKey: ["visual-rule-builder"],
    queryFn: async () => {
      console.log("Fetching visual rule builder configurations...");
      const { data, error } = await supabase
        .from("visual_rule_builder")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching visual rule builder:", error);
        throw error;
      }

      console.log("Visual rule builder data fetched:", data);
      return data;
    },
  });
};

export const useCreateVisualRule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (ruleData: any) => {
      console.log("Creating visual rule:", ruleData);

      const { data, error } = await supabase
        .from("visual_rule_builder")
        .insert(ruleData)
        .select()
        .single();

      if (error) {
        console.error("Error creating visual rule:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visual-rule-builder"] });
      toast({
        title: "Visual rule created",
        description: "New visual rule configuration has been saved",
      });
    },
    onError: (error) => {
      console.error("Error creating visual rule:", error);
      toast({
        title: "Error",
        description: "Failed to create visual rule",
        variant: "destructive",
      });
    },
  });
};

export const usePublishVisualRule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      ruleId,
      ruleData,
    }: {
      ruleId: string;
      ruleData: any;
    }) => {
      console.log("Publishing visual rule:", { ruleId, ruleData });

      const { data, error } = await supabase
        .from("visual_rule_builder")
        .update({
          ...ruleData,
          is_published: true,
          validation_status: "validated",
          version: ruleData.version + 1,
        })
        .eq("id", ruleId)
        .select()
        .single();

      if (error) {
        console.error("Error publishing visual rule:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visual-rule-builder"] });
      toast({
        title: "Rule published",
        description: "Visual rule has been published successfully",
      });
    },
    onError: (error) => {
      console.error("Error publishing visual rule:", error);
      toast({
        title: "Error",
        description: "Failed to publish visual rule",
        variant: "destructive",
      });
    },
  });
};

