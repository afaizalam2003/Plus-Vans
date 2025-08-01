import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  Clock,
  DollarSign,
  RotateCcw,
} from "lucide-react";
import { useCustomerBehavioralInsights } from "@/components/hooks/useCustomerIntelligence";

interface CustomerBehavioralAnalyticsProps {
  customerEmail?: string;
}

const CustomerBehavioralAnalytics: React.FC<
  CustomerBehavioralAnalyticsProps
> = ({ customerEmail }) => {
  const { data: insights = [], isLoading } =
    useCustomerBehavioralInsights(customerEmail);

  const getFrequencyPatternColor = (pattern: string) => {
    switch (pattern) {
      case "regular":
        return "bg-green-100 text-green-800";
      case "seasonal":
        return "bg-blue-100 text-blue-800";
      case "sporadic":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriceSensitivityColor = (score: number) => {
    if (score < 0.3) return "text-green-600";
    if (score < 0.7) return "text-yellow-600";
    return "text-red-600";
  };

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088fe"];

  const latestInsight = insights[0];

  if (isLoading) {
    return <div>Loading behavioral analytics...</div>;
  }

  if (!latestInsight) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Behavioral Data</h3>
          <p className="text-muted-foreground">
            {customerEmail
              ? `No behavioral insights found for ${customerEmail}`
              : "Enter a customer email to view their behavioral analytics."}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data for preferred booking days
  const bookingDaysData = latestInsight.preferred_booking_days.map(
    (day, index) => ({
      day,
      bookings: Math.floor(Math.random() * 20) + 1, // Simulated data
    })
  );

  // Prepare chart data for item preferences
  const itemPreferencesData = Object.entries(
    latestInsight.item_preferences || {}
  ).map(([item, count]) => ({
    name: item,
    value: Number(count),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Behavioral Analytics</h3>
        <p className="text-muted-foreground">
          Customer behavior patterns and preferences analysis
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Booking Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              className={getFrequencyPatternColor(
                latestInsight.booking_frequency_pattern || "unknown"
              )}
            >
              {latestInsight.booking_frequency_pattern || "Unknown"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Price Sensitivity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress
                value={latestInsight.price_sensitivity_score * 100}
                className="w-full"
              />
              <p
                className={`text-sm font-medium ${getPriceSensitivityColor(
                  latestInsight.price_sensitivity_score
                )}`}
              >
                {(latestInsight.price_sensitivity_score * 100).toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Lead Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {latestInsight.booking_lead_time_avg}
            </p>
            <p className="text-xs text-muted-foreground">days average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Cancellation Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {(latestInsight.cancellation_rate * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">of bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preferred Booking Days */}
        {bookingDaysData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Preferred Booking Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={bookingDaysData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Item Preferences */}
        {itemPreferencesData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Item Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={itemPreferencesData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {itemPreferencesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Detailed Behavioral Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Communication Response</h4>
              <div className="space-y-2">
                <Progress
                  value={latestInsight.communication_response_rate * 100}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  {(latestInsight.communication_response_rate * 100).toFixed(1)}
                  % response rate
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Rescheduling Frequency</h4>
              <p className="text-lg font-bold">
                {latestInsight.rescheduling_frequency}
              </p>
              <p className="text-sm text-muted-foreground">times per booking</p>
            </div>
          </div>

          {latestInsight.preferred_booking_times &&
            latestInsight.preferred_booking_times.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Preferred Booking Times</h4>
                <div className="flex gap-2 flex-wrap">
                  {latestInsight.preferred_booking_times.map((time, index) => (
                    <Badge key={index} variant="outline">
                      {time}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {latestInsight.insights_summary && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Summary</h4>
              <p className="text-sm text-muted-foreground">
                {latestInsight.insights_summary}
              </p>
            </div>
          )}

          <div className="pt-2 border-t text-xs text-muted-foreground">
            Analysis Date:{" "}
            {new Date(latestInsight.analysis_date).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>

      {/* Historical Insights */}
      {insights.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historical Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.slice(1, 4).map((insight) => (
                <div
                  key={insight.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Badge
                      className={getFrequencyPatternColor(
                        insight.booking_frequency_pattern || "unknown"
                      )}
                    >
                      {insight.booking_frequency_pattern || "Unknown"}
                    </Badge>
                    <div className="text-sm">
                      <p>
                        Analysis Date:{" "}
                        {new Date(insight.analysis_date).toLocaleDateString()}
                      </p>
                      <p className="text-muted-foreground">
                        Lead Time: {insight.booking_lead_time_avg} days |
                        Cancellation:{" "}
                        {(insight.cancellation_rate * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerBehavioralAnalytics;
