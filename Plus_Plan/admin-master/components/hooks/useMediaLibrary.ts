import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";

interface MediaLibraryFilters {
  search?: string;
  sortBy?: string;
  filterBy?: string;
}

export const useMediaLibrary = (filters: MediaLibraryFilters = {}) => {
  return useQuery({
    queryKey: ["mediaLibrary", filters],
    queryFn: async () => {
      console.log("Fetching media library with filters:", filters);

      let query = supabase.from("media_uploads").select("*");

      // Apply search filter
      if (filters.search) {
        query = query.ilike("waste_location", `%${filters.search}%`);
      }

      // Apply content filters
      switch (filters.filterBy) {
        case "access_restricted":
          query = query.eq("access_restricted", true);
          break;
        case "dismantling_required":
          query = query.eq("dismantling_required", true);
          break;
        case "recent":
          const sevenDaysAgo = new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString();
          query = query.gte("created_at", sevenDaysAgo);
          break;
      }

      // Apply sorting
      const sortField = filters.sortBy || "created_at";
      const ascending = sortField === "waste_location";
      query = query.order(sortField, { ascending });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching media library:", error);
        throw error;
      }

      console.log("Media library fetched:", data?.length || 0, "items");
      return data || [];
    },
  });
};

