import React from "react";
import { Button } from "@/components/ui/button";
import { Zap, RefreshCw, Wifi, WifiOff } from "lucide-react";

interface RealTimeQuoteSyncHeaderProps {
  isConnected: boolean;
  syncStatus: "idle" | "syncing" | "success" | "error";
  onToggleConnection: () => void;
  onManualSync: () => void;
}

const RealTimeQuoteSyncHeader: React.FC<RealTimeQuoteSyncHeaderProps> = ({
  isConnected,
  syncStatus,
  onToggleConnection,
  onManualSync,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold flex items-center">
          <Zap className="h-5 w-5 mr-2" />
          Real-Time Quote Synchronization
        </h3>
        <p className="text-muted-foreground">
          Monitor and control real-time synchronization between bookings and
          quotes
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onToggleConnection}
          className={
            isConnected
              ? "border-green-500 text-green-600"
              : "border-red-500 text-red-600"
          }
        >
          {isConnected ? (
            <Wifi className="h-4 w-4 mr-2" />
          ) : (
            <WifiOff className="h-4 w-4 mr-2" />
          )}
          {isConnected ? "Connected" : "Disconnected"}
        </Button>
        <Button onClick={onManualSync} disabled={syncStatus === "syncing"}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${
              syncStatus === "syncing" ? "animate-spin" : ""
            }`}
          />
          {syncStatus === "syncing" ? "Syncing..." : "Manual Sync"}
        </Button>
      </div>
    </div>
  );
};

export default RealTimeQuoteSyncHeader;
