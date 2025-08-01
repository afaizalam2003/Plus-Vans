import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface Staff {
  id: string;
  user_id?: string;
  employee_id?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  role: string;
  license_type?: string;
  license_expires?: string;
  hire_date: string;
  status: string;
  hourly_rate?: number;
  created_at: string;
  updated_at: string;
}

export const useStaff = () => {
  return useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      console.log("Fetching staff...");
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .order("last_name");

      if (error) {
        console.error("Error fetching staff:", error);
        throw error;
      }

      return data as Staff[];
    },
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      staffData: Omit<Staff, "id" | "created_at" | "updated_at">
    ) => {
      console.log("Creating staff member:", staffData);

      const { data, error } = await supabase
        .from("staff")
        .insert(staffData)
        .select()
        .single();

      if (error) {
        console.error("Error creating staff member:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast({
        title: "Staff member added",
        description: "Staff member has been successfully added",
      });
    },
    onError: (error) => {
      console.error("Error creating staff member:", error);
      toast({
        title: "Error",
        description: "Failed to add staff member",
        variant: "destructive",
      });
    },
  });
};

