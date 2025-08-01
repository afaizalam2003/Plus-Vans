import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, CheckCircle, Clock, RefreshCw } from "lucide-react";

interface SyncMetrics {
  totalSyncs: number;
  successRate: number;
  avgSyncTime: number;
  lastSync: string;
}

interface SyncMetricsGridProps {
  metrics: SyncMetrics;
}

const SyncMetricsGrid: React.FC<SyncMetricsGridProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Syncs</p>
              <p className="text-2xl font-bold">
                {metrics.totalSyncs.toLocaleString()}
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold">{metrics.successRate}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Sync Time</p>
              <p className="text-2xl font-bold">{metrics.avgSyncTime}ms</p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Last Sync</p>
              <p className="text-lg font-bold">{metrics.lastSync}</p>
            </div>
            <RefreshCw className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SyncMetricsGrid;
