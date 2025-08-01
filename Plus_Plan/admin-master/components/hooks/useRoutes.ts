import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface Route {
  id: string;
  route_name: string;
  route_date: string;
  vehicle_id?: string;
  driver_id?: string;
  helper_id?: string;
  status: string;
  start_location?: string;
  end_location?: string;
  estimated_duration_minutes?: number;
  actual_duration_minutes?: number;
  total_distance_km?: number;
  fuel_cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  vehicles?: { registration_number: string; make: string; model: string };
  driver?: { first_name: string; last_name: string };
  helper?: { first_name: string; last_name: string };
  route_stops?: RouteStop[];
}

export interface RouteStop {
  id: string;
  route_id: string;
  booking_id?: string;
  stop_order: number;
  address: string;
  postcode?: string;
  estimated_arrival?: string;
  actual_arrival?: string;
  estimated_duration_minutes?: number;
  actual_duration_minutes?: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useRoutes = (date?: string) => {
  return useQuery({
    queryKey: ["routes", date],
    queryFn: async () => {
      console.log("Fetching routes for date:", date);
      let query = supabase
        .from("routes")
        .select(
          `
          *,
          vehicles (registration_number, make, model),
          driver:staff!routes_driver_id_fkey (first_name, last_name),
          helper:staff!routes_helper_id_fkey (first_name, last_name),
          route_stops (*)
        `
        )
        .order("route_date", { ascending: false });

      if (date) {
        query = query.eq("route_date", date);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching routes:", error);
        throw error;
      }

      return data as Route[];
    },
  });
};

export const useCreateRoute = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      routeData: Omit<Route, "id" | "created_at" | "updated_at">
    ) => {
      console.log("Creating route:", routeData);

      const { data, error } = await supabase
        .from("routes")
        .insert(routeData)
        .select()
        .single();

      if (error) {
        console.error("Error creating route:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast({
        title: "Route created",
        description: "Route has been successfully created",
      });
    },
    onError: (error) => {
      console.error("Error creating route:", error);
      toast({
        title: "Error",
        description: "Failed to create route",
        variant: "destructive",
      });
    },
  });
};

