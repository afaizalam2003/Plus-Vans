import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useDepots = () => {
  return useQuery({
    queryKey: ["depots"],
    queryFn: async () => {
      console.log("Fetching depots...");
      const { data, error } = await supabase
        .from("depots")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching depots:", error);
        throw error;
      }

      console.log("Depots fetched:", data);
      return data;
    },
  });
};

export const useTrafficPatterns = () => {
  return useQuery({
    queryKey: ["traffic-patterns"],
    queryFn: async () => {
      console.log("Fetching traffic patterns...");
      const { data, error } = await supabase
        .from("traffic_patterns")
        .select("*")
        .eq("is_active", true)
        .order("zone_type", { ascending: true })
        .order("day_of_week", { ascending: true })
        .order("hour_of_day", { ascending: true });

      if (error) {
        console.error("Error fetching traffic patterns:", error);
        throw error;
      }

      console.log("Traffic patterns fetched:", data);
      return data;
    },
  });
};

export const useLogisticsMetrics = (dateRange?: {
  start: string;
  end: string;
}) => {
  return useQuery({
    queryKey: ["logistics-metrics", dateRange],
    queryFn: async () => {
      console.log("Fetching logistics metrics...");
      let query = supabase
        .from("logistics_metrics")
        .select(
          `
          *,
          depots(name, postcode)
        `
        )
        .order("metric_date", { ascending: false });

      if (dateRange) {
        query = query
          .gte("metric_date", dateRange.start)
          .lte("metric_date", dateRange.end);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching logistics metrics:", error);
        throw error;
      }

      console.log("Logistics metrics fetched:", data);
      return data;
    },
  });
};

export const useCreateDepot = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (depotData: any) => {
      console.log("Creating depot:", depotData);

      const { data, error } = await supabase
        .from("depots")
        .insert(depotData)
        .select()
        .single();

      if (error) {
        console.error("Error creating depot:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["depots"] });
      toast({
        title: "Depot created",
        description: "Depot has been created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating depot:", error);
      toast({
        title: "Error",
        description: "Failed to create depot",
        variant: "destructive",
      });
    },
  });
};

