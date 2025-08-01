import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface CustomerCommunication {
  id: string;
  customer_email: string;
  communication_type: string;
  direction: string;
  subject?: string;
  content?: string;
  status: string;
  booking_id?: string;
  staff_member_id?: string;
  response_required: boolean;
  response_deadline?: string;
  tags: any;
  metadata: any;
  created_at: string;
}

export interface CustomerAddress {
  id: string;
  customer_email: string;
  address: string;
  postcode: string;
  address_type: string;
  longitude?: number;
  latitude?: number;
  access_notes?: string;
  parking_info?: string;
  collection_instructions?: string;
  address_quality_score: number;
  last_used_date?: string;
  usage_frequency: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerBehavioralInsight {
  id: string;
  customer_email: string;
  analysis_date: string;
  booking_frequency_pattern?: string;
  preferred_booking_days: any;
  preferred_booking_times: any;
  seasonal_patterns: any;
  item_preferences: any;
  price_sensitivity_score: number;
  service_usage_patterns: any;
  communication_response_rate: number;
  booking_lead_time_avg: number;
  cancellation_rate: number;
  rescheduling_frequency: number;
  insights_summary?: string;
  created_at: string;
}

export interface CustomerJourneyStage {
  id: string;
  customer_email: string;
  stage_name: string;
  stage_start_date: string;
  stage_end_date?: string;
  stage_duration_days?: number;
  trigger_event?: string;
  stage_metrics: any;
  next_recommended_action?: string;
  automated_actions_taken: any;
  is_current_stage: boolean;
  created_at: string;
}

export interface RetentionCampaign {
  id: string;
  campaign_name: string;
  campaign_type: string;
  target_criteria: any;
  message_template: string;
  discount_offer: any;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  success_metrics: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useCustomerCommunications = (customerEmail?: string) => {
  return useQuery({
    queryKey: ["customer-communications", customerEmail],
    queryFn: async (): Promise<CustomerCommunication[]> => {
      console.log("Fetching customer communications");

      let query = supabase
        .from("customer_communications")
        .select("*")
        .order("created_at", { ascending: false });

      if (customerEmail) {
        query = query.eq("customer_email", customerEmail);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching customer communications:", error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useCustomerAddresses = (customerEmail?: string) => {
  return useQuery({
    queryKey: ["customer-addresses", customerEmail],
    queryFn: async (): Promise<CustomerAddress[]> => {
      console.log("Fetching customer addresses");

      let query = supabase
        .from("customer_addresses")
        .select("*")
        .order("last_used_date", { ascending: false });

      if (customerEmail) {
        query = query.eq("customer_email", customerEmail);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching customer addresses:", error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useCustomerBehavioralInsights = (customerEmail?: string) => {
  return useQuery({
    queryKey: ["customer-behavioral-insights", customerEmail],
    queryFn: async (): Promise<CustomerBehavioralInsight[]> => {
      console.log("Fetching customer behavioral insights");

      let query = supabase
        .from("customer_behavioral_insights")
        .select("*")
        .order("analysis_date", { ascending: false });

      if (customerEmail) {
        query = query.eq("customer_email", customerEmail);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching customer behavioral insights:", error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useCustomerJourneyStages = (customerEmail?: string) => {
  return useQuery({
    queryKey: ["customer-journey-stages", customerEmail],
    queryFn: async (): Promise<CustomerJourneyStage[]> => {
      console.log("Fetching customer journey stages");

      let query = supabase
        .from("customer_journey_stages")
        .select("*")
        .order("stage_start_date", { ascending: false });

      if (customerEmail) {
        query = query.eq("customer_email", customerEmail);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching customer journey stages:", error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useRetentionCampaigns = () => {
  return useQuery({
    queryKey: ["retention-campaigns"],
    queryFn: async (): Promise<RetentionCampaign[]> => {
      console.log("Fetching retention campaigns");

      const { data, error } = await supabase
        .from("customer_retention_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching retention campaigns:", error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useCustomerIntelligenceAnalysis = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (customerEmail: string) => {
      console.log("Calculating customer intelligence for:", customerEmail);

      const { data, error } = await supabase.rpc(
        "calculate_customer_intelligence",
        {
          customer_email_param: customerEmail,
        }
      );

      if (error) {
        console.error("Error calculating customer intelligence:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "Customer intelligence analysis has been completed",
      });
    },
    onError: (error) => {
      console.error("Error in customer intelligence analysis:", error);
      toast({
        title: "Error",
        description: "Failed to complete customer intelligence analysis",
        variant: "destructive",
      });
    },
  });
};

export const useCreateCustomerCommunication = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      data: Omit<CustomerCommunication, "id" | "created_at">
    ) => {
      console.log("Creating customer communication:", data);

      const { data: result, error } = await supabase
        .from("customer_communications")
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error("Error creating customer communication:", error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-communications"] });
      toast({
        title: "Communication Logged",
        description: "Customer communication has been successfully logged",
      });
    },
    onError: (error) => {
      console.error("Error creating customer communication:", error);
      toast({
        title: "Error",
        description: "Failed to log customer communication",
        variant: "destructive",
      });
    },
  });
};

export const useCreateRetentionCampaign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      data: Omit<RetentionCampaign, "id" | "created_at" | "updated_at">
    ) => {
      console.log("Creating retention campaign:", data);

      const { data: result, error } = await supabase
        .from("customer_retention_campaigns")
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error("Error creating retention campaign:", error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retention-campaigns"] });
      toast({
        title: "Campaign Created",
        description: "Retention campaign has been successfully created",
      });
    },
    onError: (error) => {
      console.error("Error creating retention campaign:", error);
      toast({
        title: "Error",
        description: "Failed to create retention campaign",
        variant: "destructive",
      });
    },
  });
};

