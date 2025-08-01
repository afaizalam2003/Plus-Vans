import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";

interface AIAnalysisQueueItem {
  id: string;
  media_upload_id: string;
  analysis_type: string;
  priority: number;
  status: string;
  attempts: number;
  max_attempts: number;
  error_message?: string;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  result_data?: any;
  created_at: string;
  updated_at: string;
}

export const useAIAnalysisQueue = () => {
  return useQuery({
    queryKey: ["aiAnalysisQueue"],
    queryFn: async (): Promise<AIAnalysisQueueItem[]> => {
      console.log("Fetching AI analysis queue...");

      const { data, error } = await supabase
        .from("ai_analysis_queue")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching AI analysis queue:", error);
        throw error;
      }

      console.log("AI analysis queue fetched:", data?.length || 0, "items");
      return data || [];
    },
  });
};

export const useAIAnalysisQueueStats = () => {
  return useQuery({
    queryKey: ["aiAnalysisQueueStats"],
    queryFn: async () => {
      console.log("Fetching AI analysis queue statistics...");

      const { data, error } = await supabase
        .from("ai_analysis_queue")
        .select("status, analysis_type, priority");

      if (error) {
        console.error("Error fetching queue stats:", error);
        throw error;
      }

      const stats = {
        total: data?.length || 0,
        queued: data?.filter((item) => item.status === "queued").length || 0,
        processing:
          data?.filter((item) => item.status === "processing").length || 0,
        completed:
          data?.filter((item) => item.status === "completed").length || 0,
        failed: data?.filter((item) => item.status === "failed").length || 0,
        byType:
          data?.reduce((acc, item) => {
            acc[item.analysis_type] = (acc[item.analysis_type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {},
        highPriority: data?.filter((item) => item.priority >= 8).length || 0,
      };

      console.log("Queue stats calculated:", stats);
      return stats;
    },
  });
};

