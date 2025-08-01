import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";

export interface PublicQuote {
  id: string;
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
  address: string;
  postcode: string;
  quote_data: any;
  status: "pending" | "accepted" | "rejected" | "expired";
  expires_at: string;
  payment_link_id?: string;
  feedback: any;
  created_at: string;
  updated_at: string;
}

export interface PublicUpload {
  id: string;
  customer_quote_id: string;
  image_url: string;
  ai_analysis?: any;
  confidence_score?: number;
  waste_items: any[];
  processing_status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
}

export const useCreatePublicQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      customer_email: string;
      customer_name?: string;
      customer_phone?: string;
      address: string;
      postcode: string;
      images: File[];
    }) => {
      console.log("Creating public quote with data:", data);

      // First create the quote
      const { data: quote, error: quoteError } = await supabase
        .from("customer_quotes")
        .insert({
          customer_email: data.customer_email,
          customer_name: data.customer_name,
          customer_phone: data.customer_phone,
          address: data.address,
          postcode: data.postcode,
          quote_data: { status: "pending_analysis" },
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Upload images and create upload records
      const uploadPromises = data.images.map(async (file) => {
        // For demo purposes, we'll create a mock image URL
        // In production, you'd upload to Supabase Storage
        const mockImageUrl = `https://example.com/uploads/${quote.id}/${file.name}`;

        const { data: upload, error: uploadError } = await supabase
          .from("public_uploads")
          .insert({
            customer_quote_id: quote.id,
            image_url: mockImageUrl,
            processing_status: "pending",
          })
          .select()
          .single();

        if (uploadError) throw uploadError;
        return upload;
      });

      const uploads = await Promise.all(uploadPromises);

      return { quote, uploads };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-quotes"] });
    },
  });
};

export const usePublicQuote = (quoteId: string) => {
  return useQuery({
    queryKey: ["public-quote", quoteId],
    queryFn: async () => {
      console.log("Fetching public quote:", quoteId);

      const { data: quote, error: quoteError } = await supabase
        .from("customer_quotes")
        .select(
          `
          *,
          public_uploads (*),
          customer_feedback (*)
        `
        )
        .eq("id", quoteId)
        .single();

      if (quoteError) throw quoteError;
      return quote;
    },
  });
};

export const useSubmitCustomerFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      customer_quote_id: string;
      feedback_type: "accuracy" | "pricing" | "service" | "other";
      rating: number;
      tags: string[];
      comment?: string;
      is_helpful?: boolean;
    }) => {
      console.log("Submitting customer feedback:", data);

      const { data: feedback, error } = await supabase
        .from("customer_feedback")
        .insert({
          customer_quote_id: data.customer_quote_id,
          feedback_type: data.feedback_type,
          rating: data.rating,
          tags: data.tags,
          comment: data.comment,
          is_helpful: data.is_helpful,
        })
        .select()
        .single();

      if (error) throw error;
      return feedback;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["public-quote", variables.customer_quote_id],
      });
    },
  });
};

