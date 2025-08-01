import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-picker";
import { BarChart3, Download, Plus, Calendar } from "lucide-react";
import {
  useFinancialReports,
  useGenerateFinancialReport,
} from "@/components/hooks/useFinancialReports";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

const FinancialReportsDashboard: React.FC = () => {
  const [reportType, setReportType] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data: reports, isLoading } = useFinancialReports();
  const generateReport = useGenerateFinancialReport();

  const handleGenerateReport = () => {
    if (!reportType || !dateRange?.from || !dateRange?.to) {
      return;
    }

    generateReport.mutate({
      reportType,
      startDate: format(dateRange.from, "yyyy-MM-dd"),
      endDate: format(dateRange.to, "yyyy-MM-dd"),
    });
  };

  const reportTypes = [
    { value: "revenue", label: "Revenue Report" },
    { value: "quotes", label: "Quotes Report" },
    { value: "invoices", label: "Invoices Report" },
    { value: "payments", label: "Payments Report" },
  ];

  if (isLoading) {
    return <div>Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Financial Reports</h2>
          <p className="text-muted-foreground">
            Generate and manage financial reports
          </p>
        </div>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Generate New Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DateRangePicker
              startDate={dateRange?.from}
              endDate={dateRange?.to}
              onChange={({ start, end }) => setDateRange({ from: start, to: end })}
              className="w-full"
            />

            <Button
              onClick={handleGenerateReport}
              disabled={
                !reportType ||
                !dateRange?.from ||
                !dateRange?.to ||
                generateReport.isPending
              }
              className="col-span-1"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports?.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{report.report_title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(report.date_range_start), "MMM dd, yyyy")}{" "}
                    - {format(new Date(report.date_range_end), "MMM dd, yyyy")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Generated{" "}
                    {format(
                      new Date(report.generated_at),
                      "MMM dd, yyyy HH:mm"
                    )}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {reports?.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No reports generated yet. Generate your first report to get
                started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReportsDashboard;
