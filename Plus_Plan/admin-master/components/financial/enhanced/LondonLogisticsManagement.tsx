import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DepotManagement from "./DepotManagement";
import TrafficPatternsAnalysis from "./TrafficPatternsAnalysis";
import LogisticsMetricsDashboard from "./LogisticsMetricsDashboard";

const LondonLogisticsManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">London Logistics Intelligence</h2>
        <p className="text-muted-foreground">
          Manage depots, analyze traffic patterns, and track logistics
          performance across London
        </p>
      </div>

      <Tabs defaultValue="depots" className="space-y-4">
        <TabsList>
          <TabsTrigger value="depots">Depot Management</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Patterns</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="depots">
          <DepotManagement />
        </TabsContent>

        <TabsContent value="traffic">
          <TrafficPatternsAnalysis />
        </TabsContent>

        <TabsContent value="metrics">
          <LogisticsMetricsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LondonLogisticsManagement;
