import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";

interface AutomatedQuote {
  id: string;
  booking_id: string;
  media_upload_id?: string;
  ai_generated_quote: any;
  confidence_score?: number;
  quote_breakdown?: any;
  override_required?: boolean;
  override_reason?: string;
  status: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useAutomatedQuotes = () => {
  return useQuery({
    queryKey: ["automatedQuotes"],
    queryFn: async (): Promise<AutomatedQuote[]> => {
      console.log("Fetching automated quotes...");

      const { data, error } = await supabase
        .from("automated_quotes")
        .select(
          `
          *,
          bookings (
            id,
            address,
            status
          ),
          media_uploads (
            id,
            waste_location
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching automated quotes:", error);
        throw error;
      }

      console.log("Automated quotes fetched:", data?.length || 0, "quotes");
      return data || [];
    },
  });
};

export const useAutomatedQuoteStats = () => {
  return useQuery({
    queryKey: ["automatedQuoteStats"],
    queryFn: async () => {
      console.log("Fetching automated quote statistics...");

      const { data, error } = await supabase
        .from("automated_quotes")
        .select("status, confidence_score, override_required");

      if (error) {
        console.error("Error fetching quote stats:", error);
        throw error;
      }

      const confidenceScores =
        data
          ?.filter((q) => q.confidence_score)
          .map((q) => q.confidence_score) || [];
      const averageConfidence =
        confidenceScores.length > 0
          ? confidenceScores.reduce((acc, score) => acc + score, 0) /
            confidenceScores.length
          : 0;

      const stats = {
        total: data?.length || 0,
        pending: data?.filter((q) => q.status === "pending").length || 0,
        approved: data?.filter((q) => q.status === "approved").length || 0,
        rejected: data?.filter((q) => q.status === "rejected").length || 0,
        requiresOverride: data?.filter((q) => q.override_required).length || 0,
        averageConfidence,
        highConfidence:
          data?.filter((q) => q.confidence_score && q.confidence_score >= 0.8)
            .length || 0,
        lowConfidence:
          data?.filter((q) => q.confidence_score && q.confidence_score < 0.6)
            .length || 0,
      };

      console.log("Automated quote stats calculated:", stats);
      return stats;
    },
  });
};

