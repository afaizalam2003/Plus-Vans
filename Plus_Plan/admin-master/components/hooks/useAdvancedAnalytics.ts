import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useAdvancedAnalytics = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["advanced-analytics", startDate, endDate],
    queryFn: async () => {
      console.log("Fetching advanced analytics...");
      let query = supabase
        .from("analytics_dashboard_metrics")
        .select("*")
        .order("metric_date", { ascending: false });

      if (startDate && endDate) {
        query = query.gte("metric_date", startDate).lte("metric_date", endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching advanced analytics:", error);
        throw error;
      }

      console.log("Advanced analytics fetched:", data);
      return data;
    },
  });
};

export const useRulePerformanceTracking = () => {
  return useQuery({
    queryKey: ["rule-performance-tracking"],
    queryFn: async () => {
      console.log("Fetching rule performance tracking...");
      const { data, error } = await supabase
        .from("rule_performance_tracking")
        .select("*")
        .order("execution_date", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching rule performance tracking:", error);
        throw error;
      }

      console.log("Rule performance tracking fetched:", data);
      return data;
    },
  });
};

export const useCalculateAdvancedAnalytics = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      startDate,
      endDate,
      segment,
    }: {
      startDate: string;
      endDate: string;
      segment?: string;
    }) => {
      console.log("Calculating advanced analytics:", {
        startDate,
        endDate,
        segment,
      });

      const { data, error } = await supabase.rpc(
        "calculate_advanced_analytics",
        {
          start_date: startDate,
          end_date: endDate,
          segment: segment,
        }
      );

      if (error) {
        console.error("Error calculating advanced analytics:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advanced-analytics"] });
      toast({
        title: "Analytics calculated",
        description: "Advanced analytics have been updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error calculating advanced analytics:", error);
      toast({
        title: "Error",
        description: "Failed to calculate advanced analytics",
        variant: "destructive",
      });
    },
  });
};

