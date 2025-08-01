import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Users,
  RefreshCw,
} from "lucide-react";
import {
  useAdvancedAnalytics,
  useRulePerformanceTracking,
  useCalculateAdvancedAnalytics,
} from "@/components/hooks/useAdvancedAnalytics";

const AdvancedAnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [selectedSegment, setSelectedSegment] = useState("");

  const { data: analytics, isLoading: analyticsLoading } = useAdvancedAnalytics(
    dateRange.startDate,
    dateRange.endDate
  );
  const { data: rulePerformance, isLoading: performanceLoading } =
    useRulePerformanceTracking();
  const calculateAnalytics = useCalculateAdvancedAnalytics();

  const handleCalculateAnalytics = () => {
    calculateAnalytics.mutate({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      segment: selectedSegment || undefined,
    });
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  // Sample data for visualization (replace with actual analytics data)
  const profitabilityData = [
    { period: "Week 1", revenue: 12500, profit: 3750, margin: 30 },
    { period: "Week 2", revenue: 15200, profit: 4560, margin: 30 },
    { period: "Week 3", revenue: 18300, profit: 5490, margin: 30 },
    { period: "Week 4", revenue: 16800, profit: 5040, margin: 30 },
  ];

  const customerSegmentData = [
    { segment: "Residential", value: 45, color: COLORS[0] },
    { segment: "Commercial", value: 30, color: COLORS[1] },
    { segment: "Construction", value: 15, color: COLORS[2] },
    { segment: "Office Clearance", value: 10, color: COLORS[3] },
  ];

  const ruleEfficiencyData =
    rulePerformance?.slice(0, 10).map((rule, index) => ({
      rule: `Rule ${index + 1}`,
      efficiency: rule.success_rate,
      executions: rule.execution_count,
      revenue_impact: rule.revenue_impact,
    })) || [];

  if (analyticsLoading || performanceLoading) {
    return <div>Loading advanced analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Advanced Analytics Dashboard
          </h3>
          <p className="text-muted-foreground">
            Comprehensive profitability insights and performance analytics
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Start Date</Label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="w-36"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">End Date</Label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="w-36"
              />
            </div>
          </div>

          <Button
            onClick={handleCalculateAnalytics}
            disabled={calculateAnalytics.isPending}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {calculateAnalytics.isPending ? "Calculating..." : "Calculate"}
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold">
                  £
                  {profitabilityData
                    .reduce((sum, item) => sum + item.revenue, 0)
                    .toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              +12.5% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Profit Margin
                </p>
                <p className="text-2xl font-bold">30.2%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              +2.1% improvement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Customers
                </p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              +8.3% new customers
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Quote Value
                </p>
                <p className="text-2xl font-bold">
                  £
                  {(
                    profitabilityData.reduce(
                      (sum, item) => sum + item.revenue,
                      0
                    ) /
                    profitabilityData.length /
                    10
                  ).toFixed(0)}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-orange-600" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              +5.7% vs target
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Profitability Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitabilityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                <Bar dataKey="profit" fill="#82ca9d" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Segment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerSegmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ segment, value }) => `${segment}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {customerSegmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Rule Performance Section */}
      <Card>
        <CardHeader>
          <CardTitle>Rule Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ruleEfficiencyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={ruleEfficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rule" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#8884d8"
                    name="Efficiency %"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No rule performance data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Insights */}
      {analytics && analytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Analytics Calculations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.slice(0, 5).map((metric) => (
                <div key={metric.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{metric.metric_type}</h4>
                    <Badge>
                      {new Date(metric.metric_date).toLocaleDateString()}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Calculated:{" "}
                    {new Date(metric.calculated_at).toLocaleString()}
                  </div>
                  {metric.profitability_insights && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(metric.profitability_insights, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
