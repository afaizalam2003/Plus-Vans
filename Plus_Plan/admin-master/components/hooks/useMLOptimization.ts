import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface MLMetrics {
  model_accuracy: number;
  prediction_confidence: number;
  daily_predictions: number;
  improvement_rate: number;
}

interface FeedbackItem {
  id: string;
  feedback_type: string;
  description: string;
  confidence_level: "low" | "medium" | "high";
  impact_type: "positive" | "negative";
  processed: boolean;
  created_at: string;
}

export const useMLMetrics = () => {
  return useQuery({
    queryKey: ["ml-metrics"],
    queryFn: async () => {
      console.log("Fetching ML metrics...");
      // Since we don't have ML tables yet, return mock data
      return {
        model_accuracy: 87.3,
        prediction_confidence: 92.1,
        daily_predictions: 1200,
        improvement_rate: 15.2,
      } as MLMetrics;
    },
  });
};

export const useFeedbackQueue = () => {
  return useQuery({
    queryKey: ["feedback-queue"],
    queryFn: async () => {
      console.log("Fetching feedback queue...");
      // Mock data for feedback queue
      return [
        {
          id: "1",
          feedback_type: "quote_adjustment",
          description: "Customer accepted quote 15% higher than predicted",
          confidence_level: "high",
          impact_type: "positive",
          processed: false,
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          feedback_type: "pricing_error",
          description: "Underpredicted complex access requirements",
          confidence_level: "medium",
          impact_type: "negative",
          processed: false,
          created_at: new Date().toISOString(),
        },
      ] as FeedbackItem[];
    },
  });
};

export const useProcessFeedback = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      feedbackId,
      action,
    }: {
      feedbackId: string;
      action: "apply" | "reject";
    }) => {
      console.log("Processing feedback:", feedbackId, action);

      // Simulate processing feedback
      return { success: true, feedbackId, action };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["feedback-queue"] });
      toast({
        title: "Feedback processed",
        description: `Feedback has been ${
          data.action === "apply" ? "applied" : "rejected"
        } successfully`,
      });
    },
    onError: (error) => {
      console.error("Error processing feedback:", error);
      toast({
        title: "Error",
        description: "Failed to process feedback",
        variant: "destructive",
      });
    },
  });
};

export const useRetrainModel = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (modelType: string) => {
      console.log("Retraining model:", modelType);

      // Simulate model retraining
      await new Promise((resolve) => setTimeout(resolve, 3000));

      return { success: true, modelType };
    },
    onSuccess: (data) => {
      toast({
        title: "Model retrained",
        description: `${data.modelType} model has been successfully retrained`,
      });
    },
    onError: (error) => {
      console.error("Error retraining model:", error);
      toast({
        title: "Training Error",
        description: "Failed to retrain model",
        variant: "destructive",
      });
    },
  });
};

