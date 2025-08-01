import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface RouteOptimizationRequest {
  id: string;
  request_date: string;
  bookings_data: any;
  optimization_params: any;
  result_data?: any;
  processing_time_ms?: number;
  status: string;
  error_message?: string;
  requested_by?: string;
  created_at: string;
  completed_at?: string;
}

export interface OptimizationParams {
  maxStopsPerRoute: number;
  maxRouteDistance: number;
  startLocation: string;
  prioritizeByDistance: boolean;
  considerTrafficPatterns: boolean;
  vehicleCapacityLimits: boolean;
}

export const useRouteOptimization = () => {
  return useQuery({
    queryKey: ["route-optimization"],
    queryFn: async (): Promise<RouteOptimizationRequest[]> => {
      console.log("Fetching route optimization requests");

      const { data, error } = await supabase
        .from("route_optimization_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching optimization requests:", error);
        throw error;
      }

      return (data || []) as RouteOptimizationRequest[];
    },
  });
};

export const useCreateOptimizationRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      bookingsData,
      params,
    }: {
      bookingsData: any[];
      params: OptimizationParams;
    }) => {
      console.log("Creating route optimization request:", {
        bookingsData,
        params,
      });

      // Convert OptimizationParams to a plain object for JSON compatibility
      const optimizationParamsJson = {
        maxStopsPerRoute: params.maxStopsPerRoute,
        maxRouteDistance: params.maxRouteDistance,
        startLocation: params.startLocation,
        prioritizeByDistance: params.prioritizeByDistance,
        considerTrafficPatterns: params.considerTrafficPatterns,
        vehicleCapacityLimits: params.vehicleCapacityLimits,
      };

      const { data, error } = await supabase
        .from("route_optimization_requests")
        .insert({
          request_date: new Date().toISOString().split("T")[0],
          bookings_data: bookingsData,
          optimization_params: optimizationParamsJson,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating optimization request:", error);
        throw error;
      }

      // Simulate optimization processing
      if (data?.id) {
        await processOptimization(data.id, bookingsData, params);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-optimization"] });
      toast({
        title: "Optimization Started",
        description: "Route optimization is being processed",
      });
    },
    onError: (error) => {
      console.error("Error in optimization request:", error);
      toast({
        title: "Error",
        description: "Failed to start route optimization",
        variant: "destructive",
      });
    },
  });
};

// Simulate route optimization algorithm
const processOptimization = async (
  requestId: string,
  bookings: any[],
  params: OptimizationParams
) => {
  const startTime = Date.now();

  try {
    // Group bookings by geographic proximity
    const groupedBookings = groupBookingsByProximity(bookings, params);

    // Create optimized routes
    const optimizedRoutes = createOptimizedRoutes(groupedBookings, params);

    const processingTime = Date.now() - startTime;

    // Update request with results
    await supabase
      .from("route_optimization_requests")
      .update({
        result_data: {
          optimized_routes: optimizedRoutes,
          total_routes_created: optimizedRoutes.length,
          total_stops: bookings.length,
          efficiency_score: calculateEfficiencyScore(optimizedRoutes),
          estimated_time_savings: calculateTimeSavings(optimizedRoutes),
        },
        processing_time_ms: processingTime,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", requestId);
  } catch (error) {
    console.error("Optimization processing error:", error);

    await supabase
      .from("route_optimization_requests")
      .update({
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
        completed_at: new Date().toISOString(),
      })
      .eq("id", requestId);
  }
};

const groupBookingsByProximity = (
  bookings: any[],
  params: OptimizationParams
) => {
  // Simple clustering algorithm based on postcode proximity
  const groups: any[][] = [];
  const processed = new Set();

  bookings.forEach((booking, index) => {
    if (processed.has(index)) return;

    const group = [booking];
    processed.add(index);

    // Find nearby bookings
    bookings.forEach((otherBooking, otherIndex) => {
      if (processed.has(otherIndex) || index === otherIndex) return;

      if (arePostcodesNear(booking.postcode, otherBooking.postcode)) {
        group.push(otherBooking);
        processed.add(otherIndex);
      }
    });

    if (group.length <= params.maxStopsPerRoute) {
      groups.push(group);
    } else {
      // Split large groups
      while (group.length > 0) {
        groups.push(group.splice(0, params.maxStopsPerRoute));
      }
    }
  });

  return groups;
};

const arePostcodesNear = (postcode1: string, postcode2: string): boolean => {
  // Simplified proximity check based on postcode prefix
  const prefix1 = postcode1.split(" ")[0];
  const prefix2 = postcode2.split(" ")[0];
  return prefix1 === prefix2;
};

const createOptimizedRoutes = (groups: any[][], params: OptimizationParams) => {
  return groups.map((group, index) => ({
    route_name: `Optimized Route ${index + 1}`,
    stops: group.map((booking, stopIndex) => ({
      stop_order: stopIndex + 1,
      booking_id: booking.id,
      address: booking.address,
      postcode: booking.postcode,
      estimated_duration_minutes: 30,
      customer_name: booking.customer_details?.[0]?.full_name || "Unknown",
    })),
    estimated_total_duration: group.length * 30 + (group.length - 1) * 15, // 30 min per stop + 15 min travel
    estimated_distance_km: group.length * 5, // Estimated 5km between stops
    optimization_score: Math.random() * 100, // Placeholder score
  }));
};

const calculateEfficiencyScore = (routes: any[]): number => {
  // Simplified efficiency calculation
  const totalStops = routes.reduce((sum, route) => sum + route.stops.length, 0);
  const totalDistance = routes.reduce(
    (sum, route) => sum + route.estimated_distance_km,
    0
  );

  return Math.min(100, (totalStops / totalDistance) * 10);
};

const calculateTimeSavings = (routes: any[]): number => {
  // Estimate time savings compared to individual trips
  const totalStops = routes.reduce((sum, route) => sum + route.stops.length, 0);
  const optimizedTime = routes.reduce(
    (sum, route) => sum + route.estimated_total_duration,
    0
  );
  const individualTime = totalStops * 120; // 2 hours per individual trip

  return Math.max(0, individualTime - optimizedTime);
};

