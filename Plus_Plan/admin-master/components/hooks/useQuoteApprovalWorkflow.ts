import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useQuoteApprovalWorkflow = (quoteId?: string) => {
  return useQuery({
    queryKey: ["quote-approval-workflow", quoteId],
    queryFn: async () => {
      console.log("Fetching quote approval workflow...");
      let query = supabase
        .from("quote_approval_workflow")
        .select("*")
        .order("created_at", { ascending: true });

      if (quoteId) {
        query = query.eq("quote_id", quoteId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching quote approval workflow:", error);
        throw error;
      }

      console.log("Quote approval workflow fetched:", data);
      return data;
    },
    enabled: !!quoteId,
  });
};

export const useAdvanceWorkflowStage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      quoteId,
      newStage,
      notes,
    }: {
      quoteId: string;
      newStage: string;
      notes?: string;
    }) => {
      console.log("Advancing workflow stage:", { quoteId, newStage, notes });

      const { data, error } = await supabase
        .from("quote_approval_workflow")
        .insert({
          quote_id: quoteId,
          workflow_stage: newStage,
          notes: notes,
        })
        .select()
        .single();

      if (error) {
        console.error("Error advancing workflow stage:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-approval-workflow"] });
      toast({
        title: "Workflow advanced",
        description: "Quote workflow stage has been updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error advancing workflow:", error);
      toast({
        title: "Error",
        description: "Failed to advance workflow stage",
        variant: "destructive",
      });
    },
  });
};

