import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface MediaJobLinkage {
  id: string;
  media_upload_id: string;
  job_assignment_id: string;
  booking_id: string;
  link_type: "before" | "during" | "after" | "completion";
  linked_at: string;
  linked_by?: string;
  verification_status: "pending" | "verified" | "rejected";
  verification_notes?: string;
  auto_linked: boolean;
  confidence_score: number;
  created_at: string;
  media_upload?: {
    id: string;
    image_urls: string[];
    waste_location: string;
    access_restricted: boolean;
    dismantling_required: boolean;
  };
  job_assignment?: {
    id: string;
    assignment_status: string;
    booking?: {
      address: string;
      postcode: string;
    };
  };
}

export interface AutoLinkageStats {
  total_linkages: number;
  auto_linked: number;
  manual_linked: number;
  verified: number;
  pending_verification: number;
  rejected: number;
  avg_confidence: number;
}

export const useMediaJobLinkages = (filters?: {
  jobAssignmentId?: string;
  mediaUploadId?: string;
  verificationType?: string;
}) => {
  return useQuery({
    queryKey: ["media-job-linkages", filters],
    queryFn: async (): Promise<MediaJobLinkage[]> => {
      console.log("Fetching media job linkages with filters:", filters);

      let query = supabase
        .from("media_job_linkage")
        .select(
          `
          *,
          media_upload:media_uploads(id, image_urls, waste_location, access_restricted, dismantling_required),
          job_assignment:job_assignments(id, assignment_status, booking:bookings(address, postcode))
        `
        )
        .order("linked_at", { ascending: false });

      if (filters?.jobAssignmentId) {
        query = query.eq("job_assignment_id", filters.jobAssignmentId);
      }

      if (filters?.mediaUploadId) {
        query = query.eq("media_upload_id", filters.mediaUploadId);
      }

      if (filters?.verificationType && filters.verificationType !== "all") {
        query = query.eq("verification_status", filters.verificationType);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching media job linkages:", error);
        throw error;
      }

      // Type assertion to handle the Supabase return type with proper JSON parsing
      return (data || []).map((item) => ({
        ...item,
        link_type: item.link_type as MediaJobLinkage["link_type"],
        verification_status:
          item.verification_status as MediaJobLinkage["verification_status"],
        auto_linked: item.auto_linked || false,
        confidence_score: item.confidence_score || 0,
        media_upload: item.media_upload
          ? {
              ...item.media_upload,
              image_urls: Array.isArray(item.media_upload.image_urls)
                ? (item.media_upload.image_urls as string[])
                : item.media_upload.image_urls
                ? [item.media_upload.image_urls as string]
                : [],
            }
          : undefined,
      }));
    },
  });
};

export const useCreateMediaJobLinkage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      data: Omit<
        MediaJobLinkage,
        "id" | "created_at" | "auto_linked" | "confidence_score"
      >
    ) => {
      console.log("Creating media job linkage:", data);

      const { data: result, error } = await supabase
        .from("media_job_linkage")
        .insert({
          ...data,
          auto_linked: false,
          confidence_score: 1.0,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating media job linkage:", error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-job-linkages"] });
      toast({
        title: "Media Linked",
        description: "Media has been successfully linked to job assignment",
      });
    },
    onError: (error) => {
      console.error("Error creating media job linkage:", error);
      toast({
        title: "Error",
        description: "Failed to link media to job assignment",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateMediaLinkageVerification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      verification_status,
      verification_notes,
    }: {
      id: string;
      verification_status: MediaJobLinkage["verification_status"];
      verification_notes?: string;
    }) => {
      console.log("Updating media linkage verification:", {
        id,
        verification_status,
        verification_notes,
      });

      const { data, error } = await supabase
        .from("media_job_linkage")
        .update({
          verification_status,
          verification_notes,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating media linkage verification:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["media-job-linkages"] });
      toast({
        title: "Verification Updated",
        description: `Media linkage verification status updated to ${data.verification_status}`,
      });
    },
    onError: (error) => {
      console.error("Error updating media linkage verification:", error);
      toast({
        title: "Error",
        description: "Failed to update media linkage verification",
        variant: "destructive",
      });
    },
  });
};

export const useAutoLinkageStats = () => {
  return useQuery({
    queryKey: ["auto-linkage-stats"],
    queryFn: async (): Promise<AutoLinkageStats> => {
      console.log("Fetching auto-linkage statistics");

      const { data: linkages, error } = await supabase
        .from("media_job_linkage")
        .select("id, auto_linked, confidence_score, verification_status");

      if (error) throw error;

      const stats: AutoLinkageStats = {
        total_linkages: linkages?.length || 0,
        auto_linked: linkages?.filter((l) => l.auto_linked).length || 0,
        manual_linked: linkages?.filter((l) => !l.auto_linked).length || 0,
        verified:
          linkages?.filter((l) => l.verification_status === "verified")
            .length || 0,
        pending_verification:
          linkages?.filter((l) => l.verification_status === "pending").length ||
          0,
        rejected:
          linkages?.filter((l) => l.verification_status === "rejected")
            .length || 0,
        avg_confidence: linkages?.length
          ? linkages.reduce((sum, l) => sum + l.confidence_score, 0) /
            linkages.length
          : 0,
      };

      console.log("Auto-linkage stats:", stats);
      return stats;
    },
  });
};

