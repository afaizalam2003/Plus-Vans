import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import RealTimeQuoteSyncHeader from "./RealTimeQuoteSyncHeader";
import ConnectionStatusBanner from "./ConnectionStatusBanner";
import SyncMetricsGrid from "./SyncMetricsGrid";
import RecentSyncActivity from "./RecentSyncActivity";

const RealTimeQuoteSync: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const { toast } = useToast();

  const syncMetrics = {
    totalSyncs: 1247,
    successRate: 98.7,
    avgSyncTime: 145,
    lastSync: "2 minutes ago",
  };

  const recentSyncs = [
    {
      id: "1",
      type: "quote_created",
      status: "success" as const,
      timestamp: "2 minutes ago",
      bookingId: "BK001234",
    },
    {
      id: "2",
      type: "price_updated",
      status: "success" as const,
      timestamp: "5 minutes ago",
      bookingId: "BK001235",
    },
    {
      id: "3",
      type: "booking_converted",
      status: "success" as const,
      timestamp: "8 minutes ago",
      bookingId: "BK001236",
    },
    {
      id: "4",
      type: "quote_expired",
      status: "warning" as const,
      timestamp: "12 minutes ago",
      bookingId: "BK001237",
    },
  ];

  const handleManualSync = async () => {
    setSyncStatus("syncing");

    // Simulate sync process
    setTimeout(() => {
      setSyncStatus("success");
      toast({
        title: "Sync completed",
        description: "All quotes and bookings are now synchronized",
      });

      setTimeout(() => setSyncStatus("idle"), 2000);
    }, 2000);
  };

  const toggleConnection = () => {
    setIsConnected(!isConnected);
    toast({
      title: isConnected ? "Disconnected" : "Connected",
      description: isConnected
        ? "Real-time sync disabled"
        : "Real-time sync enabled",
      variant: isConnected ? "destructive" : "default",
    });
  };

  return (
    <div className="space-y-6">
      <RealTimeQuoteSyncHeader
        isConnected={isConnected}
        syncStatus={syncStatus}
        onToggleConnection={toggleConnection}
        onManualSync={handleManualSync}
      />

      <ConnectionStatusBanner
        isConnected={isConnected}
        autoSync={autoSync}
        onAutoSyncChange={setAutoSync}
      />

      <SyncMetricsGrid metrics={syncMetrics} />

      <RecentSyncActivity activities={recentSyncs} />
    </div>
  );
};

export default RealTimeQuoteSync;
