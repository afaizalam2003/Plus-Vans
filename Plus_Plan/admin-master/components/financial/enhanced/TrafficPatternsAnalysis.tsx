import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { useTrafficPatterns } from "@/components/hooks/useDepts";

const TrafficPatternsAnalysis: React.FC = () => {
  const { data: trafficPatterns, isLoading } = useTrafficPatterns();

  if (isLoading) {
    return <div>Loading traffic patterns...</div>;
  }

  const getDayName = (dow: number) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dow];
  };

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, "0")}:00`;
  };

  const getCongestionColor = (level: string) => {
    switch (level) {
      case "low":
        return "default";
      case "normal":
        return "secondary";
      case "high":
        return "destructive";
      case "severe":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const groupedPatterns = trafficPatterns?.reduce((acc, pattern) => {
    const key = pattern.zone_type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(pattern);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Traffic Pattern Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedPatterns || {}).map(([zoneType, patterns]) => (
            <div key={zoneType} className="space-y-4">
              <h3 className="font-semibold capitalize flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {zoneType} Zone Traffic Patterns
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {patterns.map((pattern) => (
                  <Card key={pattern.id} className="border">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-sm">
                            <Clock className="h-3 w-3 mr-1" />
                            {getDayName(pattern.day_of_week)}{" "}
                            {formatTime(pattern.hour_of_day)}
                          </div>
                          <Badge
                            variant={getCongestionColor(
                              pattern.congestion_level
                            )}
                            className="text-xs"
                          >
                            {pattern.congestion_level}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">
                              Multiplier:
                            </span>
                            <span className="ml-1 font-medium">
                              {pattern.traffic_multiplier}x
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Delay:
                            </span>
                            <span className="ml-1 font-medium">
                              {pattern.avg_delay_minutes}min
                            </span>
                          </div>
                        </div>

                        <div className="text-xs">
                          <span className="text-muted-foreground">
                            Reliability:
                          </span>
                          <span className="ml-1 font-medium">
                            {(pattern.reliability_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrafficPatternsAnalysis;
