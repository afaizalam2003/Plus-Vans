import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface ZonePerformanceMetric {
  id: string;
  zone_id: string;
  metric_date: string;
  total_collections: number;
  avg_completion_time_minutes: number;
  success_rate: number;
  customer_satisfaction_score: number;
  traffic_delay_minutes: number;
  parking_difficulty_score: number;
  revenue_per_collection: number;
  cost_per_collection: number;
  profitability_score: number;
  created_at: string;
}

export const useZonePerformance = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["zone-performance", startDate, endDate],
    queryFn: async (): Promise<ZonePerformanceMetric[]> => {
      console.log("Fetching zone performance metrics");

      let query = supabase
        .from("zone_performance_analytics")
        .select("*")
        .order("metric_date", { ascending: false });

      if (startDate && endDate) {
        query = query.gte("metric_date", startDate).lte("metric_date", endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching zone performance:", error);
        throw error;
      }

      return (data || []) as ZonePerformanceMetric[];
    },
  });
};

export const useCreateZonePerformanceMetric = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      metricData: Omit<ZonePerformanceMetric, "id" | "created_at">
    ) => {
      console.log("Creating zone performance metric:", metricData);

      const { data, error } = await supabase
        .from("zone_performance_analytics")
        .insert(metricData)
        .select()
        .single();

      if (error) {
        console.error("Error creating zone performance metric:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zone-performance"] });
      toast({
        title: "Metric Created",
        description: "Zone performance metric has been successfully recorded",
      });
    },
    onError: (error) => {
      console.error("Error creating zone performance metric:", error);
      toast({
        title: "Error",
        description: "Failed to create zone performance metric",
        variant: "destructive",
      });
    },
  });
};

