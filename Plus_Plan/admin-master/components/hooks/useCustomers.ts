import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { Customer } from "@/types/customer";

export const useCustomers = (filters?: {
  status?: string;
  dateRange?: { from: Date; to: Date };
  search?: string;
}) => {
  return useQuery({
    queryKey: ["customers", filters],
    queryFn: async (): Promise<Customer[]> => {
      console.log("Fetching customers with filters:", filters);

      let query = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.search) {
        query = query.or(`
          name.ilike.%${filters.search}%,
          email.ilike.%${filters.search}%,
          phone.ilike.%${filters.search}%
        `);
      }

      if (filters?.dateRange) {
        query = query
          .gte("created_at", filters.dateRange.from.toISOString())
          .lte("created_at", filters.dateRange.to.toISOString());
      }

      const { data: profiles, error } = await query;

      if (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }

      if (!profiles) {
        return [];
      }

      // Fetch bookings for all customers in a separate query
      const { data: bookings, error: bookingsError } = await supabase.from(
        "bookings"
      ).select(`
          id,
          user_id,
          status,
          created_at,
          quote
        `);

      if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError);
        // Continue without bookings data if there's an error
      }

      // Transform data to include customer statistics
      const customersWithStats = profiles.map((customer) => {
        const customerBookings =
          bookings?.filter((b) => b.user_id === customer.id) || [];
        const totalSpent = customerBookings
          .filter((b) => b.status === "completed" && b.quote)
          .reduce((sum, b) => {
            const quote = b.quote as any;
            const finalQuote = quote?.final_quote;
            return sum + (finalQuote ? parseFloat(finalQuote) : 0);
          }, 0);

        const lastBookingDate =
          customerBookings.length > 0
            ? Math.max(
                ...customerBookings.map((b) => new Date(b.created_at).getTime())
              )
            : null;

        return {
          ...customer,
          bookings: customerBookings,
          total_bookings: customerBookings.length,
          total_spent: totalSpent,
          last_booking_date: lastBookingDate
            ? new Date(lastBookingDate).toISOString()
            : null,
        };
      });

      console.log("Fetched customers with stats:", customersWithStats);
      return customersWithStats as Customer[];
    },
  });
};

// Re-export types and other hooks for backward compatibility
export type { Customer, CustomerFilters } from "@/types/customer";
export { useCustomerStats } from "@/hooks/useCustomerStats";
export { useUpdateCustomer } from "@/hooks/useCustomerMutations";

