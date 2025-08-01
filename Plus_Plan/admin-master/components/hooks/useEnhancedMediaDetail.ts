import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { toast } from "sonner";

export const useEnhancedMediaDetail = (mediaUploadId: string) => {
  const queryClient = useQueryClient();

  const updateMediaMutation = useMutation({
    mutationFn: async (updates: Partial<any>) => {
      const { data, error } = await supabase
        .from("media_uploads")
        .update(updates)
        .eq("id", mediaUploadId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["mediaUpload", mediaUploadId],
      });
      queryClient.invalidateQueries({ queryKey: ["classifiedContent"] });
      toast.success("Media upload updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update media upload");
      console.error("Error updating media:", error);
    },
  });

  const checkMandatoryTagsCompleted = (tags: Record<string, any>) => {
    // This would typically check against the photo tag template
    // For now, we'll do a simple check for some basic required fields
    const requiredFields = ["item_type", "condition"];
    return requiredFields.every((field) => tags[field] && tags[field] !== "");
  };

  const handleTagsUpdate = (tags: Record<string, any>) => {
    updateMediaMutation.mutate({
      photo_tags: tags,
      mandatory_tags_completed: checkMandatoryTagsCompleted(tags),
    });
  };

  const handleMetadataUpdate = (metadata: Record<string, any>) => {
    const updates: any = { metadata_capture: metadata };

    // Update individual fields from metadata
    if (metadata.geo_coordinates) {
      updates.geo_coordinates = metadata.geo_coordinates;
    }
    if (metadata.capture_timestamp) {
      updates.capture_timestamp = metadata.capture_timestamp;
    }
    if (metadata.quality_score) {
      updates.quality_score = metadata.quality_score;
    }
    if (metadata.validation_status) {
      updates.validation_status = metadata.validation_status;
    }
    if (metadata.device_info) {
      updates.device_info = metadata.device_info;
    }
    if (metadata.upload_source) {
      updates.upload_source = metadata.upload_source;
    }

    updateMediaMutation.mutate(updates);
  };

  return {
    handleTagsUpdate,
    handleMetadataUpdate,
    updateMediaMutation,
  };
};

