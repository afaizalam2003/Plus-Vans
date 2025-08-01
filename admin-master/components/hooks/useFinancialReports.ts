import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useFinancialReports = () => {
  return useQuery({
    queryKey: ["financial-reports"],
    queryFn: async () => {
      console.log("Fetching financial reports...");
      const { data, error } = await supabase
        .from("financial_reports")
        .select("*")
        .order("generated_at", { ascending: false });

      if (error) {
        console.error("Error fetching financial reports:", error);
        throw error;
      }

      console.log("Financial reports fetched:", data);
      return data;
    },
  });
};

export const useGenerateFinancialReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      reportType,
      startDate,
      endDate,
      parameters,
    }: {
      reportType: string;
      startDate: string;
      endDate: string;
      parameters?: any;
    }) => {
      console.log("Generating financial report:", {
        reportType,
        startDate,
        endDate,
        parameters,
      });

      const { data, error } = await supabase.rpc("generate_financial_report", {
        report_type: reportType,
        start_date: startDate,
        end_date: endDate,
        parameters: parameters || {},
      });

      if (error) {
        console.error("Error generating financial report:", error);
        throw error;
      }

      // Save the generated report
      const { data: savedReport, error: saveError } = await supabase
        .from("financial_reports")
        .insert({
          report_type: reportType,
          report_title: `${
            reportType.charAt(0).toUpperCase() + reportType.slice(1)
          } Report`,
          report_data: data,
          date_range_start: startDate,
          date_range_end: endDate,
          parameters: parameters || {},
        })
        .select()
        .single();

      if (saveError) {
        console.error("Error saving financial report:", saveError);
        throw saveError;
      }

      return savedReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-reports"] });
      toast({
        title: "Report generated",
        description: "Financial report has been generated successfully",
      });
    },
    onError: (error) => {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate financial report",
        variant: "destructive",
      });
    },
  });
};

