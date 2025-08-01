import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";

export const useMediaStats = () => {
  return useQuery({
    queryKey: ["mediaStats"],
    queryFn: async () => {
      console.log("Fetching media statistics...");

      // Get all media uploads
      const { data: uploads, error: uploadsError } = await supabase
        .from("media_uploads")
        .select("*");

      if (uploadsError) {
        console.error("Error fetching media uploads:", uploadsError);
        throw uploadsError;
      }

      // Get all vision analysis results
      const { data: analyses, error: analysesError } = await supabase
        .from("vision_analysis_results")
        .select("*");

      if (analysesError) {
        console.error("Error fetching analyses:", analysesError);
        throw analysesError;
      }

      const totalUploads = uploads?.length || 0;
      const totalImages =
        uploads?.reduce(
          (acc, upload) =>
            acc +
            (Array.isArray(upload.image_urls) ? upload.image_urls.length : 0),
          0
        ) || 0;

      const accessRestricted =
        uploads?.filter((u) => u.access_restricted).length || 0;
      const dismantlingRequired =
        uploads?.filter((u) => u.dismantling_required).length || 0;
      const totalAnalyses = analyses?.length || 0;

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentUploads =
        uploads?.filter((u) => new Date(u.created_at) > sevenDaysAgo).length ||
        0;

      const flaggedItems = accessRestricted + dismantlingRequired;
      const processingRate =
        totalUploads > 0 ? Math.round((totalAnalyses / totalUploads) * 100) : 0;

      const avgImagesPerUpload =
        totalUploads > 0 ? totalImages / totalUploads : 0;
      const completionRate =
        totalUploads > 0 ? Math.round((totalAnalyses / totalUploads) * 100) : 0;

      // Get most common waste location
      const locationCounts =
        uploads?.reduce((acc, upload) => {
          const location = upload.waste_location || "Unknown";
          acc[location] = (acc[location] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

      const topWasteLocation =
        Object.entries(locationCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
        "N/A";

      const stats = {
        totalUploads,
        totalImages,
        accessRestricted,
        dismantlingRequired,
        totalAnalyses,
        recentUploads,
        flaggedItems,
        processingRate,
        avgImagesPerUpload,
        completionRate,
        topWasteLocation,
      };

      console.log("Media stats calculated:", stats);
      return stats;
    },
  });
};

