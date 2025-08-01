import { Booking } from "@/services/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Star } from "lucide-react";

interface Props {
  bookings: Booking[];
}

export default function BookingMetrics({ bookings }: Props) {
  const total = bookings.length;
  const completed = bookings.filter((b) => b.status === "completed").length;
  const completionRate = total ? ((completed / total) * 100).toFixed(0) : "0";

  // avg response = average hours between created_at and collection_time when both exist
  const responseHoursArr = bookings
    .filter((b) => b.collection_time)
    .map((b) => {
      const diff = new Date(b.collection_time as string).getTime() - new Date(b.created_at).getTime();
      return diff / 36e5; // ms to hours
    });
  const avgResponse = responseHoursArr.length
    ? (responseHoursArr.reduce((a, c) => a + c, 0) / responseHoursArr.length).toFixed(1)
    : "N/A";

  // rating placeholder (if stripe_payments used etc.)
  const rating = "4.6/5"; // static until ratings implemented

  const metricsData = [
    {
      title: "Completion Rate",
      value: parseFloat(completionRate),
      unit: "%",
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      target: 95,
      description: "Jobs completed successfully",
    },
    {
      title: "Avg Response Time",
      value: avgResponse === "N/A" ? 0 : parseFloat(avgResponse as string),
      unit: "hrs",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      target: 2,
      description: "Time to first response",
    },
    {
      title: "Rating",
      value: parseFloat(rating.split("/")[0]),
      unit: "/5",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      target: 4.8,
      description: "Average customer rating",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {metricsData.map((metric, index) => {
        const Icon = metric.icon;
        const progress = (metric.value / metric.target) * 100;
        const isOnTarget = metric.value >= metric.target;

        return (
          <Card
            key={index}
            className="border-0 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <Badge
                  variant={isOnTarget ? "default" : "secondary"}
                  className="text-xs"
                >
                  {isOnTarget ? "On Target" : "Below Target"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Progress to target</span>
                  <span>{Math.min(100, Math.round(progress))}%</span>
                </div>
                <Progress value={Math.min(100, progress)} className="h-2" />
              </div>

              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
