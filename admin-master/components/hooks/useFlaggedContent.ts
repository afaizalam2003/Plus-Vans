import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";

export const useFlaggedContent = () => {
  return useQuery({
    queryKey: ["flaggedContent"],
    queryFn: async () => {
      console.log("Fetching flagged content...");

      const { data: flaggedItems, error } = await supabase
        .from("media_uploads")
        .select("*")
        .or("access_restricted.eq.true,dismantling_required.eq.true")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching flagged content:", error);
        throw error;
      }

      console.log("Flagged content fetched:", flaggedItems?.length || 0);
      return flaggedItems || [];
    },
  });
};

