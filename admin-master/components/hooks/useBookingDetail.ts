import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { Booking } from "@/hooks/useBookings";

export const useBookingDetail = (bookingId: string) => {
  return useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () => {
      console.log("Fetching booking detail for ID:", bookingId);

      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          customer_details (
            full_name,
            contact_number,
            email,
            collection_date
          ),
          media_uploads (
            id,
            image_urls,
            access_restricted,
            dismantling_required,
            waste_location,
            created_at
          ),
          quote_history (
            id,
            breakdown,
            override,
            override_reason,
            created_at
          ),
          stripe_payments (
            id,
            amount,
            currency,
            status,
            stripe_payment_intent_id,
            created_at
          ),
          reviews (
            id,
            rating,
            comment,
            created_at
          )
        `
        )
        .eq("id", bookingId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching booking detail:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Booking not found");
      }

      console.log("Fetched booking detail:", data);
      return data as Booking & {
        media_uploads?: any[];
        quote_history?: any[];
        stripe_payments?: any[];
        reviews?: any[];
      };
    },
  });
};

