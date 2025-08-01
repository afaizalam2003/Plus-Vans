import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";

export interface RevenueAnalytics {
  id: string;
  period_type: string;
  period_start: string;
  period_end: string;
  analysis_date: string;
  total_collected: number;
  total_costs: number;
  gross_profit: number;
  profit_margin_percentage: number;
  created_at: string;
  updated_at: string;
}

export const useRevenueAnalytics = (period: string = 'monthly') => {
  return useQuery<RevenueAnalytics[]>({
    queryKey: ['revenue-analytics', period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenue_analytics')
        .select('*')
        .eq('period_type', period)
        .order('analysis_date', { ascending: false });

      if (error) {
        console.error('Error fetching revenue analytics:', error);
        throw error;
      }
      return data || [];
    },
  });
};

