import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface RevenueAnalytics {
  id: string;
  analysis_date: string;
  period_type: string;
  period_start: string;
  period_end: string;
  total_quoted: number;
  total_invoiced: number;
  total_collected: number;
  outstanding_receivables: number;
  total_labor_costs: number;
  total_vehicle_costs: number;
  total_disposal_costs: number;
  total_overhead_costs: number;
  total_costs: number;
  gross_profit: number;
  net_profit: number;
  profit_margin_percentage: number;
  jobs_completed: number;
  average_job_value: number;
  cost_per_job: number;
  created_at: string;
  updated_at: string;
}

export interface CostAllocationRule {
  id: string;
  rule_name: string;
  rule_type: string;
  applies_to_job_types: any;
  applies_to_zones: any;
  applies_to_vehicle_types: any;
  calculation_method: string;
  base_amount: number;
  percentage_rate: number;
  minimum_charge: number;
  maximum_charge: number;
  is_active: boolean;
  priority: number;
  effective_from: string;
  effective_until?: string;
  created_at: string;
  updated_at: string;
}

export const useRevenueAnalytics = (
  periodType?: string,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ["revenue-analytics", periodType, startDate, endDate],
    queryFn: async (): Promise<RevenueAnalytics[]> => {
      console.log("Fetching revenue analytics");

      let query = supabase
        .from("revenue_analytics")
        .select("*")
        .order("analysis_date", { ascending: false });

      if (periodType) {
        query = query.eq("period_type", periodType);
      }

      if (startDate && endDate) {
        query = query.gte("period_start", startDate).lte("period_end", endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching revenue analytics:", error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useCostAllocationRules = () => {
  return useQuery({
    queryKey: ["cost-allocation-rules"],
    queryFn: async (): Promise<CostAllocationRule[]> => {
      console.log("Fetching cost allocation rules");

      const { data, error } = await supabase
        .from("cost_allocation_rules")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: true });

      if (error) {
        console.error("Error fetching cost allocation rules:", error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useCreateCostAllocationRule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      data: Omit<CostAllocationRule, "id" | "created_at" | "updated_at">
    ) => {
      console.log("Creating cost allocation rule:", data);

      const { data: result, error } = await supabase
        .from("cost_allocation_rules")
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error("Error creating cost allocation rule:", error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cost-allocation-rules"] });
      toast({
        title: "Rule Created",
        description: "Cost allocation rule has been successfully created",
      });
    },
    onError: (error) => {
      console.error("Error creating cost allocation rule:", error);
      toast({
        title: "Error",
        description: "Failed to create cost allocation rule",
        variant: "destructive",
      });
    },
  });
};

export const useGenerateRevenueAnalytics = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      periodType,
      periodStart,
      periodEnd,
    }: {
      periodType: string;
      periodStart: string;
      periodEnd: string;
    }) => {
      console.log("Generating revenue analytics:", {
        periodType,
        periodStart,
        periodEnd,
      });

      // Calculate analytics from financial_integrations and related tables
      const { data: integrations, error: integrationsError } = await supabase
        .from("financial_integrations")
        .select("*");

      if (integrationsError) {
        throw integrationsError;
      }

      // Calculate totals
      const totalQuoted =
        integrations?.reduce((sum, item) => sum + item.quoted_amount, 0) || 0;
      const totalInvoiced =
        integrations?.reduce((sum, item) => sum + item.invoiced_amount, 0) || 0;
      const totalCollected =
        integrations?.reduce((sum, item) => sum + item.paid_amount, 0) || 0;
      const totalCosts =
        integrations?.reduce((sum, item) => sum + item.total_costs, 0) || 0;
      const grossProfit = totalCollected - totalCosts;
      const jobsCompleted = integrations?.length || 0;

      const analyticsData = {
        analysis_date: new Date().toISOString().split("T")[0],
        period_type: periodType,
        period_start: periodStart,
        period_end: periodEnd,
        total_quoted: totalQuoted,
        total_invoiced: totalInvoiced,
        total_collected: totalCollected,
        outstanding_receivables: totalInvoiced - totalCollected,
        total_labor_costs:
          integrations?.reduce((sum, item) => sum + item.labor_costs, 0) || 0,
        total_vehicle_costs:
          integrations?.reduce((sum, item) => sum + item.vehicle_costs, 0) || 0,
        total_disposal_costs:
          integrations?.reduce((sum, item) => sum + item.disposal_costs, 0) ||
          0,
        total_overhead_costs:
          integrations?.reduce((sum, item) => sum + item.overhead_costs, 0) ||
          0,
        total_costs: totalCosts,
        gross_profit: grossProfit,
        net_profit: grossProfit, // Simplified for now
        profit_margin_percentage:
          totalCollected > 0 ? (grossProfit / totalCollected) * 100 : 0,
        jobs_completed: jobsCompleted,
        average_job_value:
          jobsCompleted > 0 ? totalCollected / jobsCompleted : 0,
        cost_per_job: jobsCompleted > 0 ? totalCosts / jobsCompleted : 0,
      };

      const { data, error } = await supabase
        .from("revenue_analytics")
        .insert(analyticsData)
        .select()
        .single();

      if (error) {
        console.error("Error generating revenue analytics:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenue-analytics"] });
      toast({
        title: "Analytics Generated",
        description: "Revenue analytics have been successfully generated",
      });
    },
    onError: (error) => {
      console.error("Error generating revenue analytics:", error);
      toast({
        title: "Error",
        description: "Failed to generate revenue analytics",
        variant: "destructive",
      });
    },
  });
};

