import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface DriverPerformanceMetric {
  id: string;
  staff_id: string;
  metric_date: string;
  collections_completed: number;
  avg_collection_time_minutes: number;
  customer_rating: number;
  punctuality_score: number;
  fuel_efficiency_score: number;
  safety_incidents: number;
  revenue_generated: number;
  efficiency_rank: number;
  total_distance_km: number;
  active_hours: number;
  created_at: string;
  staff?: {
    first_name: string;
    last_name: string;
    role: string;
  };
}

export const useDriverPerformance = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["driver-performance", startDate, endDate],
    queryFn: async (): Promise<DriverPerformanceMetric[]> => {
      console.log("Fetching driver performance metrics");

      let query = supabase
        .from("driver_performance_metrics")
        .select(
          `
          *,
          staff:staff_id (first_name, last_name, role)
        `
        )
        .order("metric_date", { ascending: false });

      if (startDate && endDate) {
        query = query.gte("metric_date", startDate).lte("metric_date", endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching driver performance:", error);
        throw error;
      }

      return (data || []) as DriverPerformanceMetric[];
    },
  });
};

export const useCreateDriverPerformanceMetric = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      metricData: Omit<DriverPerformanceMetric, "id" | "created_at" | "staff">
    ) => {
      console.log("Creating driver performance metric:", metricData);

      const { data, error } = await supabase
        .from("driver_performance_metrics")
        .insert(metricData)
        .select()
        .single();

      if (error) {
        console.error("Error creating driver performance metric:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-performance"] });
      toast({
        title: "Metric Created",
        description: "Driver performance metric has been successfully recorded",
      });
    },
    onError: (error) => {
      console.error("Error creating driver performance metric:", error);
      toast({
        title: "Error",
        description: "Failed to create driver performance metric",
        variant: "destructive",
      });
    },
  });
};

