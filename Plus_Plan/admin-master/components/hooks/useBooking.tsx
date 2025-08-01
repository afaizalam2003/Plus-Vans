import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Booking {
  id: string;
  user_id: string | null;
  collection_time: string | null;
  quote: any;
  created_at: string;
  updated_at: string;
  postcode: string;
  address: string;
  geolocation: string | null;
  status: string;
  customer_details?: {
    full_name: string;
    contact_number: string;
    email: string;
    collection_date: string;
  }[];
}

export const useBookings = (filters?: {
  status?: string;
  dateRange?: { from: Date; to: Date };
  search?: string;
}) => {
  return useQuery({
    queryKey: ["bookings", filters],
    queryFn: async () => {
      console.log("Fetching bookings with filters:", filters);

      let query = supabase
        .from("bookings")
        .select(
          `
          *,
          customer_details (
            full_name,
            contact_number,
            email,
            collection_date
          )
        `
        )
        .order("created_at", { ascending: false });

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters?.dateRange) {
        query = query
          .gte("created_at", filters.dateRange.from.toISOString())
          .lte("created_at", filters.dateRange.to.toISOString());
      }

      if (filters?.search) {
        query = query.or(`
          address.ilike.%${filters.search}%,
          postcode.ilike.%${filters.search}%
        `);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching bookings:", error);
        throw error;
      }

      console.log("Fetched bookings:", data);
      return data as Booking[];
    },
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      console.log("Updating booking status:", { id, status });

      const { data, error } = await supabase
        .from("bookings")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating booking status:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({
        title: "Status Updated",
        description: `Booking status updated to ${data.status}`,
      });
    },
    onError: (error) => {
      console.error("Error in status update mutation:", error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    },
  });
};

export const useBookingStats = () => {
  return useQuery({
    queryKey: ["booking-stats"],
    queryFn: async () => {
      console.log("Fetching booking statistics");

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's bookings
      const { data: todayBookings, error: todayError } = await supabase
        .from("bookings")
        .select("id")
        .gte("created_at", today.toISOString())
        .lt("created_at", tomorrow.toISOString());

      if (todayError) throw todayError;

      // Get pending bookings
      const { data: pendingBookings, error: pendingError } = await supabase
        .from("bookings")
        .select("id")
        .eq("status", "pending");

      if (pendingError) throw pendingError;

      // Get completed bookings
      const { data: completedBookings, error: completedError } = await supabase
        .from("bookings")
        .select("id")
        .eq("status", "completed");

      if (completedError) throw completedError;

      const stats = {
        today: todayBookings?.length || 0,
        pending: pendingBookings?.length || 0,
        completed: completedBookings?.length || 0,
      };

      console.log("Booking stats:", stats);
      return stats;
    },
  });
};

