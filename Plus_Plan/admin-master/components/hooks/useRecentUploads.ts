import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";

export const useRecentUploads = () => {
  return useQuery({
    queryKey: ["recentUploads"],
    queryFn: async () => {
      console.log("Fetching recent uploads...");

      const { data: uploads, error } = await supabase
        .from("media_uploads")
        .select(
          `
          *,
          bookings (
            address
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching recent uploads:", error);
        throw error;
      }

      // Add booking address to uploads
      const enrichedUploads =
        uploads?.map((upload) => ({
          ...upload,
          bookingAddress: upload.bookings?.address || "Unknown",
        })) || [];

      console.log("Recent uploads fetched:", enrichedUploads.length);
      return enrichedUploads;
    },
  });
};

