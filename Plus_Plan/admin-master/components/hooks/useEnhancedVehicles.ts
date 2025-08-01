import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface VehicleMaintenanceRecord {
  id: string;
  vehicle_id: string;
  maintenance_type: string;
  description?: string;
  cost?: number;
  performed_by?: string;
  garage_location?: string;
  parts_replaced?: any[];
  next_service_due?: string;
  odometer_reading?: number;
  maintenance_date: string;
  scheduled_date?: string;
  completion_status: string;
  warranty_period_months?: number;
  created_at: string;
  updated_at: string;
}

export interface VehicleUtilization {
  id: string;
  vehicle_id: string;
  tracking_date: string;
  total_distance_km?: number;
  active_hours?: number;
  fuel_consumed_liters?: number;
  jobs_completed?: number;
  revenue_generated?: number;
  idle_time_hours?: number;
  efficiency_score?: number;
  emissions_kg_co2?: number;
  created_at: string;
}

export interface FuelConsumptionLog {
  id: string;
  vehicle_id: string;
  fuel_type: string;
  quantity_liters: number;
  cost_per_liter: number;
  total_cost: number;
  odometer_reading?: number;
  fuel_station?: string;
  receipt_reference?: string;
  fuel_date: string;
  filled_by?: string;
  created_at: string;
}

export interface VehicleAnalytics {
  vehicle_id: string;
  registration_number: string;
  make: string;
  model: string;
  status: string;
  total_maintenance_records: number;
  total_maintenance_cost: number;
  avg_efficiency_score: number;
  total_distance_km: number;
  total_jobs_completed: number;
  total_revenue_generated: number;
  total_fuel_cost: number;
  avg_fuel_cost_per_liter: number;
  next_service_due?: string;
  maintenance_status: "current" | "due_soon" | "overdue";
}

export const useVehicleAnalytics = () => {
  return useQuery({
    queryKey: ["vehicle-analytics"],
    queryFn: async () => {
      console.log("Fetching vehicle analytics...");
      const { data, error } = await supabase
        .from("vehicle_analytics_summary")
        .select("*")
        .order("registration_number");

      if (error) {
        console.error("Error fetching vehicle analytics:", error);
        throw error;
      }

      return data as VehicleAnalytics[];
    },
  });
};

export const useVehicleMaintenanceRecords = (vehicleId: string) => {
  return useQuery({
    queryKey: ["vehicle-maintenance", vehicleId],
    queryFn: async () => {
      console.log("Fetching maintenance records for vehicle:", vehicleId);
      const { data, error } = await supabase
        .from("vehicle_maintenance_records")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("maintenance_date", { ascending: false });

      if (error) {
        console.error("Error fetching maintenance records:", error);
        throw error;
      }

      return data as VehicleMaintenanceRecord[];
    },
    enabled: !!vehicleId,
  });
};

export const useVehicleUtilization = (
  vehicleId: string,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ["vehicle-utilization", vehicleId, startDate, endDate],
    queryFn: async () => {
      console.log("Fetching utilization data for vehicle:", vehicleId);
      let query = supabase
        .from("vehicle_utilization")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("tracking_date", { ascending: false });

      if (startDate && endDate) {
        query = query
          .gte("tracking_date", startDate)
          .lte("tracking_date", endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching utilization data:", error);
        throw error;
      }

      return data as VehicleUtilization[];
    },
    enabled: !!vehicleId,
  });
};

export const useFuelConsumptionLogs = (vehicleId: string) => {
  return useQuery({
    queryKey: ["fuel-consumption", vehicleId],
    queryFn: async () => {
      console.log("Fetching fuel consumption logs for vehicle:", vehicleId);
      const { data, error } = await supabase
        .from("fuel_consumption_logs")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("fuel_date", { ascending: false });

      if (error) {
        console.error("Error fetching fuel consumption logs:", error);
        throw error;
      }

      return data as FuelConsumptionLog[];
    },
    enabled: !!vehicleId,
  });
};

export const useCreateMaintenanceRecord = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      record: Omit<VehicleMaintenanceRecord, "id" | "created_at" | "updated_at">
    ) => {
      console.log("Creating maintenance record:", record);

      const { data, error } = await supabase
        .from("vehicle_maintenance_records")
        .insert(record)
        .select()
        .single();

      if (error) {
        console.error("Error creating maintenance record:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["vehicle-maintenance", data.vehicle_id],
      });
      queryClient.invalidateQueries({ queryKey: ["vehicle-analytics"] });
      toast({
        title: "Maintenance record added",
        description: "Maintenance record has been successfully added",
      });
    },
    onError: (error) => {
      console.error("Error creating maintenance record:", error);
      toast({
        title: "Error",
        description: "Failed to add maintenance record",
        variant: "destructive",
      });
    },
  });
};

export const useCreateFuelLog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (log: Omit<FuelConsumptionLog, "id" | "created_at">) => {
      console.log("Creating fuel log:", log);

      const { data, error } = await supabase
        .from("fuel_consumption_logs")
        .insert(log)
        .select()
        .single();

      if (error) {
        console.error("Error creating fuel log:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["fuel-consumption", data.vehicle_id],
      });
      queryClient.invalidateQueries({ queryKey: ["vehicle-analytics"] });
      toast({
        title: "Fuel log added",
        description: "Fuel consumption log has been successfully added",
      });
    },
    onError: (error) => {
      console.error("Error creating fuel log:", error);
      toast({
        title: "Error",
        description: "Failed to add fuel log",
        variant: "destructive",
      });
    },
  });
};

export const useRefreshVehicleAnalytics = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log("Refreshing vehicle analytics...");

      const { error } = await supabase.rpc("refresh_vehicle_analytics");

      if (error) {
        console.error("Error refreshing analytics:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle-analytics"] });
      toast({
        title: "Analytics refreshed",
        description: "Vehicle analytics have been updated with latest data",
      });
    },
    onError: (error) => {
      console.error("Error refreshing analytics:", error);
      toast({
        title: "Error",
        description: "Failed to refresh analytics",
        variant: "destructive",
      });
    },
  });
};

