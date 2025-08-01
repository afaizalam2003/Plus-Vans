import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useScenarioTemplates = () => {
  return useQuery({
    queryKey: ["scenario-templates"],
    queryFn: async () => {
      console.log("Fetching scenario templates...");
      const { data, error } = await supabase
        .from("scenario_templates")
        .select("*")
        .eq("is_active", true)
        .order("usage_frequency", { ascending: false });

      if (error) {
        console.error("Error fetching scenario templates:", error);
        throw error;
      }

      console.log("Scenario templates fetched:", data);
      return data;
    },
  });
};

export const useAIQuotePipeline = (mediaUploadId?: string) => {
  return useQuery({
    queryKey: ["ai-quote-pipeline", mediaUploadId],
    queryFn: async () => {
      console.log("Fetching AI quote pipeline...");
      let query = supabase
        .from("ai_quote_pipeline")
        .select("*")
        .order("created_at", { ascending: false });

      if (mediaUploadId) {
        query = query.eq("media_upload_id", mediaUploadId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching AI quote pipeline:", error);
        throw error;
      }

      console.log("AI quote pipeline fetched:", data);
      return data;
    },
    enabled: !!mediaUploadId,
  });
};

export const useAIConfidenceScoring = (quoteId?: string) => {
  return useQuery({
    queryKey: ["ai-confidence-scoring", quoteId],
    queryFn: async () => {
      console.log("Fetching AI confidence scoring...");
      const { data, error } = await supabase
        .from("ai_confidence_scoring")
        .select("*")
        .eq("quote_id", quoteId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching AI confidence scoring:", error);
        throw error;
      }

      console.log("AI confidence scoring fetched:", data);
      return data;
    },
    enabled: !!quoteId,
  });
};

export const usePricingRuleConflicts = (quoteId?: string) => {
  return useQuery({
    queryKey: ["pricing-rule-conflicts", quoteId],
    queryFn: async () => {
      console.log("Fetching pricing rule conflicts...");
      const { data, error } = await supabase
        .from("pricing_rule_conflicts")
        .select("*")
        .eq("quote_id", quoteId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching pricing rule conflicts:", error);
        throw error;
      }

      console.log("Pricing rule conflicts fetched:", data);
      return data;
    },
    enabled: !!quoteId,
  });
};

export const useCalculateAIEnhancedQuote = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      items_data,
      pickup_postcode,
      media_upload_id,
      access_difficulty = "normal",
    }: {
      items_data: any[];
      pickup_postcode: string;
      media_upload_id?: string;
      access_difficulty?: string;
    }) => {
      console.log("Calculating AI enhanced quote with confidence scoring...");

      const { data, error } = await supabase.rpc(
        "calculate_ai_enhanced_quote_with_confidence",
        {
          items_data: items_data,
          pickup_postcode: pickup_postcode,
          media_upload_id: media_upload_id,
          access_difficulty: access_difficulty,
        }
      );

      if (error) {
        console.error("Error calculating AI enhanced quote:", error);
        throw error;
      }

      console.log("AI enhanced quote calculated:", data);
      return data;
    },
    onError: (error) => {
      console.error("Error calculating AI enhanced quote:", error);
      toast({
        title: "Error",
        description: "Failed to calculate AI enhanced quote",
        variant: "destructive",
      });
    },
  });
};

export const useCreateScenarioTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (templateData: any) => {
      console.log("Creating scenario template:", templateData);

      const { data, error } = await supabase
        .from("scenario_templates")
        .insert(templateData)
        .select()
        .single();

      if (error) {
        console.error("Error creating scenario template:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scenario-templates"] });
      toast({
        title: "Scenario template created",
        description: "New scenario template has been created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating scenario template:", error);
      toast({
        title: "Error",
        description: "Failed to create scenario template",
        variant: "destructive",
      });
    },
  });
};

