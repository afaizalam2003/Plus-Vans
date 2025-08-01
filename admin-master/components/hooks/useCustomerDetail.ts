import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface CapacityPlan {
  id: string;
  planning_date: string;
  depot_id: string;
  available_vehicles: number;
  available_staff: number;
  estimated_capacity: number;
  predicted_demand: number;
  capacity_utilization: number;
  recommended_adjustments: any;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useCapacityPlanning = (planningDate?: string) => {
  return useQuery({
    queryKey: ["capacity-planning", planningDate],
    queryFn: async (): Promise<CapacityPlan[]> => {
      console.log("Fetching capacity planning data");

      let query = supabase
        .from("capacity_planning")
        .select("*")
        .order("planning_date", { ascending: false });

      if (planningDate) {
        query = query.eq("planning_date", planningDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching capacity planning:", error);
        throw error;
      }

      return (data || []) as CapacityPlan[];
    },
  });
};

export const useCreateCapacityPlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      planData: Omit<CapacityPlan, "id" | "created_at" | "updated_at">
    ) => {
      console.log("Creating capacity plan:", planData);

      const { data, error } = await supabase
        .from("capacity_planning")
        .insert(planData)
        .select()
        .single();

      if (error) {
        console.error("Error creating capacity plan:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capacity-planning"] });
      toast({
        title: "Plan Created",
        description: "Capacity plan has been successfully created",
      });
    },
    onError: (error) => {
      console.error("Error creating capacity plan:", error);
      toast({
        title: "Error",
        description: "Failed to create capacity plan",
        variant: "destructive",
      });
    },
  });
};

