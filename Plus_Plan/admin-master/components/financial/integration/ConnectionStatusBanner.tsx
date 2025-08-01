import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface ConnectionStatusBannerProps {
  isConnected: boolean;
  autoSync: boolean;
  onAutoSyncChange: (checked: boolean) => void;
}

const ConnectionStatusBanner: React.FC<ConnectionStatusBannerProps> = ({
  isConnected,
  autoSync,
  onAutoSyncChange,
}) => {
  return (
    <Card
      className={`border-l-4 ${
        isConnected
          ? "border-l-green-500 bg-green-50"
          : "border-l-red-500 bg-red-50"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <div>
              <p
                className={`font-medium ${
                  isConnected ? "text-green-900" : "text-red-900"
                }`}
              >
                {isConnected
                  ? "Real-time sync is active"
                  : "Real-time sync is disconnected"}
              </p>
              <p
                className={`text-sm ${
                  isConnected ? "text-green-700" : "text-red-700"
                }`}
              >
                {isConnected
                  ? "All quote and booking changes are being synchronized in real-time"
                  : "Quote and booking synchronization is currently disabled"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Auto-sync</span>
            <Switch
              checked={autoSync}
              onCheckedChange={onAutoSyncChange}
              disabled={!isConnected}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionStatusBanner;
