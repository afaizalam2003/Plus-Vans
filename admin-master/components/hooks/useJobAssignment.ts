import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface JobAssignment {
  id: string;
  booking_id: string;
  assigned_staff_id?: string;
  assignment_date: string;
  assignment_status: "assigned" | "in_progress" | "completed" | "cancelled";
  estimated_start_time?: string;
  actual_start_time?: string;
  estimated_completion_time?: string;
  actual_completion_time?: string;
  assignment_notes?: string;
  completion_photos: string[];
  quality_check_status: "pending" | "passed" | "failed" | "requires_review";
  quality_check_notes?: string;
  quality_checked_by?: string;
  quality_checked_at?: string;
  created_at: string;
  updated_at: string;
  booking?: {
    address: string;
    postcode: string;
    status: string;
  };
  assigned_staff?: {
    full_name: string;
    email: string;
  };
}

export interface JobAssignmentStats {
  today_total: number;
  today_in_progress: number;
  today_completed: number;
  pending_quality_checks: number;
  failed_quality_checks: number;
}

export const useJobAssignments = (filters?: {
  status?: string;
  staffId?: string;
  dateRange?: { from: Date; to: Date };
}) => {
  return useQuery({
    queryKey: ["job-assignments", filters],
    queryFn: async (): Promise<JobAssignment[]> => {
      console.log("Fetching job assignments with filters:", filters);

      let query = supabase
        .from("job_assignments")
        .select(
          `
          *,
          booking:bookings(address, postcode, status),
          assigned_staff:staff(full_name, email)
        `
        )
        .order("created_at", { ascending: false });

      if (filters?.status && filters.status !== "all") {
        query = query.eq("assignment_status", filters.status);
      }

      if (filters?.staffId) {
        query = query.eq("assigned_staff_id", filters.staffId);
      }

      if (filters?.dateRange) {
        query = query
          .gte("assignment_date", filters.dateRange.from.toISOString())
          .lte("assignment_date", filters.dateRange.to.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching job assignments:", error);
        throw error;
      }

      // Type assertion to handle the Supabase return type with proper JSON parsing
      return (data || []).map((item) => {
        // Handle staff data safely with proper null checking and type assertion
        const staffData = item.assigned_staff as any;
        let staff: { full_name: string; email: string } | undefined = undefined;

        if (
          staffData &&
          typeof staffData === "object" &&
          "full_name" in staffData &&
          "email" in staffData
        ) {
          staff = {
            full_name: staffData.full_name || "",
            email: staffData.email || "",
          };
        }

        return {
          ...item,
          assignment_status:
            item.assignment_status as JobAssignment["assignment_status"],
          quality_check_status: (item.quality_check_status ||
            "pending") as JobAssignment["quality_check_status"],
          completion_photos: Array.isArray(item.completion_photos)
            ? (item.completion_photos as string[])
            : item.completion_photos
            ? [item.completion_photos as string]
            : [],
          assigned_staff: staff,
        };
      });
    },
  });
};

export const useCreateJobAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      data: Omit<JobAssignment, "id" | "created_at" | "updated_at">
    ) => {
      console.log("Creating job assignment:", data);

      const { data: result, error } = await supabase
        .from("job_assignments")
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error("Error creating job assignment:", error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-assignments"] });
      toast({
        title: "Job Assignment Created",
        description: "Job has been successfully assigned to staff member",
      });
    },
    onError: (error) => {
      console.error("Error creating job assignment:", error);
      toast({
        title: "Error",
        description: "Failed to create job assignment",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateJobAssignmentStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: JobAssignment["assignment_status"];
      notes?: string;
    }) => {
      console.log("Updating job assignment status:", { id, status, notes });

      const updateData: any = {
        assignment_status: status,
        updated_at: new Date().toISOString(),
      };

      if (status === "in_progress" && !updateData.actual_start_time) {
        updateData.actual_start_time = new Date().toISOString();
      }

      if (status === "completed" && !updateData.actual_completion_time) {
        updateData.actual_completion_time = new Date().toISOString();
      }

      if (notes) {
        updateData.assignment_notes = notes;
      }

      const { data, error } = await supabase
        .from("job_assignments")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating job assignment status:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["job-assignments"] });
      toast({
        title: "Status Updated",
        description: `Job assignment status updated to ${data.assignment_status}`,
      });
    },
    onError: (error) => {
      console.error("Error updating job assignment status:", error);
      toast({
        title: "Error",
        description: "Failed to update job assignment status",
        variant: "destructive",
      });
    },
  });
};

export const useJobAssignmentStats = () => {
  return useQuery({
    queryKey: ["job-assignment-stats"],
    queryFn: async (): Promise<JobAssignmentStats> => {
      console.log("Fetching job assignment statistics");

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's assignments
      const { data: todayAssignments, error: todayError } = await supabase
        .from("job_assignments")
        .select("id, assignment_status")
        .gte("assignment_date", today.toISOString())
        .lt("assignment_date", tomorrow.toISOString());

      if (todayError) throw todayError;

      // Get overall stats
      const { data: allAssignments, error: allError } = await supabase
        .from("job_assignments")
        .select("id, assignment_status, quality_check_status");

      if (allError) throw allError;

      const stats: JobAssignmentStats = {
        today_total: todayAssignments?.length || 0,
        today_in_progress:
          todayAssignments?.filter((a) => a.assignment_status === "in_progress")
            .length || 0,
        today_completed:
          todayAssignments?.filter((a) => a.assignment_status === "completed")
            .length || 0,
        pending_quality_checks:
          allAssignments?.filter((a) => a.quality_check_status === "pending")
            .length || 0,
        failed_quality_checks:
          allAssignments?.filter((a) => a.quality_check_status === "failed")
            .length || 0,
      };

      console.log("Job assignment stats:", stats);
      return stats;
    },
  });
};

