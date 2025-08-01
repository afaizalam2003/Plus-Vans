import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, TrendingUp, MapPin, Calendar } from "lucide-react";
import { useLogisticsMetrics } from "@/components/hooks/useDepts";

const LogisticsMetricsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const { data: metrics, isLoading } = useLogisticsMetrics(dateRange);

  const handleDateRangeChange = (field: "start" | "end", value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <div>Loading logistics metrics...</div>;
  }

  // Calculate summary statistics
  const summaryStats = metrics?.reduce(
    (acc, metric) => {
      acc.totalCollections += metric.total_collections || 0;
      acc.avgTravelTime += metric.avg_travel_time_minutes || 0;
      acc.avgFuelEfficiency += metric.fuel_efficiency_mpg || 0;
      acc.avgSuccessRate += metric.success_rate || 0;
      acc.avgSatisfaction += metric.customer_satisfaction || 0;
      acc.count += 1;
      return acc;
    },
    {
      totalCollections: 0,
      avgTravelTime: 0,
      avgFuelEfficiency: 0,
      avgSuccessRate: 0,
      avgSatisfaction: 0,
      count: 0,
    }
  );

  if (summaryStats && summaryStats.count > 0) {
    summaryStats.avgTravelTime /= summaryStats.count;
    summaryStats.avgFuelEfficiency /= summaryStats.count;
    summaryStats.avgSuccessRate /= summaryStats.count;
    summaryStats.avgSatisfaction /= summaryStats.count;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Logistics Intelligence Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range Filter */}
        <div className="grid grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateRangeChange("start", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateRangeChange("end", e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Apply Filter
          </Button>
        </div>

        {/* Summary Statistics */}
        {summaryStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {summaryStats.totalCollections}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Collections
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {summaryStats.avgTravelTime.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Avg Travel Time (min)
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {summaryStats.avgFuelEfficiency.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Fuel Efficiency (mpg)
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {summaryStats.avgSuccessRate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Success Rate
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {summaryStats.avgSatisfaction.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Customer Satisfaction
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Metrics */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Detailed Metrics by Zone & Depot
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics?.slice(0, 10).map((metric) => (
              <Card key={metric.id} className="border">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold capitalize">
                          {metric.zone_type} Zone
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {metric.depots?.name || "Unknown Depot"}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {new Date(metric.metric_date).toLocaleDateString()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Collections:
                        </span>
                        <span className="ml-1 font-medium">
                          {metric.total_collections}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Travel Time:
                        </span>
                        <span className="ml-1 font-medium">
                          {metric.avg_travel_time_minutes}min
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Success Rate:
                        </span>
                        <span className="ml-1 font-medium">
                          {metric.success_rate}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Satisfaction:
                        </span>
                        <span className="ml-1 font-medium">
                          {metric.customer_satisfaction}/5
                        </span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        Cost per Collection:
                      </span>
                      <span className="ml-1 font-medium">
                        £{metric.cost_per_collection}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogisticsMetricsDashboard;
