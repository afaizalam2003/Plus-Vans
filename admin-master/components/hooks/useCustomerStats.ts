import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { CustomerStats } from "@/types/customer";

export const useCustomerStats = () => {
  return useQuery({
    queryKey: ["customer-stats"],
    queryFn: async (): Promise<CustomerStats> => {
      console.log("Fetching customer statistics");

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get total customers
      const { data: totalCustomers, error: totalError } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "customer");

      if (totalError) throw totalError;

      // Get new customers today
      const { data: newToday, error: newTodayError } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "customer")
        .gte("created_at", today.toISOString())
        .lt("created_at", tomorrow.toISOString());

      if (newTodayError) throw newTodayError;

      // Get customers with recent activity (bookings in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentBookings, error: activeError } = await supabase
        .from("bookings")
        .select("user_id")
        .gte("created_at", thirtyDaysAgo.toISOString());

      if (activeError) throw activeError;

      const uniqueActiveCustomers = new Set(
        recentBookings?.map((b) => b.user_id) || []
      );

      const stats = {
        total: totalCustomers?.length || 0,
        newToday: newToday?.length || 0,
        active: uniqueActiveCustomers.size,
      };

      console.log("Customer stats:", stats);
      return stats;
    },
  });
};

