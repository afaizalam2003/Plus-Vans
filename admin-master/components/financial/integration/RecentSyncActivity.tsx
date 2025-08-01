import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SyncActivity {
  id: string;
  type: string;
  status: "success" | "warning" | "error";
  timestamp: string;
  bookingId: string;
}

interface RecentSyncActivityProps {
  activities: SyncActivity[];
}

const RecentSyncActivity: React.FC<RecentSyncActivityProps> = ({
  activities,
}) => {
  const getBadgeClassName = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sync Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((sync) => (
            <div
              key={sync.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Badge className={getBadgeClassName(sync.status)}>
                  {sync.status}
                </Badge>
                <span className="font-medium">
                  {sync.type.replace("_", " ")}
                </span>
                <span className="text-sm text-muted-foreground">
                  Booking: {sync.bookingId}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {sync.timestamp}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentSyncActivity;
