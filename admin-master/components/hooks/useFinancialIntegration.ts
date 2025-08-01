import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface JobQuote {
  id: string;
  booking_id: string;
  quote_id: string;
  quote_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinancialIntegration {
  id: string;
  booking_id: string;
  route_id?: string;
  quoted_amount: number;
  invoiced_amount: number;
  paid_amount: number;
  revenue_status: string;
  estimated_costs: any;
  actual_costs: any;
  labor_costs: number;
  vehicle_costs: number;
  disposal_costs: number;
  overhead_costs: number;
  total_costs: number;
  gross_profit: number;
  profit_margin_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface AutomatedPaymentRelease {
  id: string;
  booking_id: string;
  invoice_id?: string;
  job_completion_confirmed: boolean;
  quality_check_passed: boolean;
  customer_satisfaction_threshold_met: boolean;
  all_costs_recorded: boolean;
  release_amount: number;
  hold_amount: number;
  release_date?: string;
  scheduled_release_date?: string;
  auto_release_enabled: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useJobQuotes = (bookingId?: string) => {
  return useQuery({
    queryKey: ["job-quotes", bookingId],
    queryFn: async (): Promise<JobQuote[]> => {
      console.log("Fetching job quotes");

      let query = supabase
        .from("job_quotes")
        .select("*")
        .order("created_at", { ascending: false });

      if (bookingId) {
        query = query.eq("booking_id", bookingId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching job quotes:", error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useFinancialIntegrations = (bookingId?: string) => {
  return useQuery({
    queryKey: ["financial-integrations", bookingId],
    queryFn: async (): Promise<FinancialIntegration[]> => {
      console.log("Fetching financial integrations");

      let query = supabase
        .from("financial_integrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (bookingId) {
        query = query.eq("booking_id", bookingId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching financial integrations:", error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useAutomatedPaymentReleases = (status?: string) => {
  return useQuery({
    queryKey: ["automated-payment-releases", status],
    queryFn: async (): Promise<AutomatedPaymentRelease[]> => {
      console.log("Fetching automated payment releases");

      let query = supabase
        .from("automated_payment_releases")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching payment releases:", error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useCreateJobQuote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      data: Omit<JobQuote, "id" | "created_at" | "updated_at">
    ) => {
      console.log("Creating job quote:", data);

      const { data: result, error } = await supabase
        .from("job_quotes")
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error("Error creating job quote:", error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-quotes"] });
      toast({
        title: "Job Quote Created",
        description: "Job quote link has been successfully created",
      });
    },
    onError: (error) => {
      console.error("Error creating job quote:", error);
      toast({
        title: "Error",
        description: "Failed to create job quote link",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateFinancialIntegration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<FinancialIntegration>;
    }) => {
      console.log("Updating financial integration:", id, updates);

      const { data, error } = await supabase
        .from("financial_integrations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating financial integration:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-integrations"] });
      toast({
        title: "Integration Updated",
        description: "Financial integration has been successfully updated",
      });
    },
    onError: (error) => {
      console.error("Error updating financial integration:", error);
      toast({
        title: "Error",
        description: "Failed to update financial integration",
        variant: "destructive",
      });
    },
  });
};

export const useProcessPaymentRelease = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: "approve" | "release" | "hold";
    }) => {
      console.log("Processing payment release:", id, action);

      const updates: Partial<AutomatedPaymentRelease> = {
        status:
          action === "approve"
            ? "approved"
            : action === "release"
            ? "released"
            : "held",
        ...(action === "release" && {
          release_date: new Date().toISOString().split("T")[0],
        }),
      };

      const { data, error } = await supabase
        .from("automated_payment_releases")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error processing payment release:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["automated-payment-releases"],
      });
      toast({
        title: "Payment Release Processed",
        description: `Payment has been ${variables.action}d successfully`,
      });
    },
    onError: (error) => {
      console.error("Error processing payment release:", error);
      toast({
        title: "Error",
        description: "Failed to process payment release",
        variant: "destructive",
      });
    },
  });
};

