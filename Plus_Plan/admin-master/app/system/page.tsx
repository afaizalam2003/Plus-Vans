"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function SystemHealthPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <span>Dashboard</span>
        <span className="text-muted-foreground">&gt;</span>
        <span className="font-medium">System Health</span>
      </div>

      {/* Heading & subtitle */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
        <p className="text-muted-foreground">
          Monitor system performance and health metrics
        </p>
      </div>

      {/* Container */}
      <div className="bg-card p-6 rounded-lg border space-y-6">
        <p className="text-sm text-muted-foreground">
          System health monitoring interface will be implemented here.
        </p>

        {/* Stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {/* System Status */}
          <Card className="min-h-[110px]">
            <CardHeader>
              <CardTitle className="text-sm">System Status</CardTitle>
              <CardDescription>
                <span className="text-green-600 font-semibold">Operational</span>
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Uptime */}
          <Card className="min-h-[110px]">
            <CardHeader>
              <CardTitle className="text-sm">Uptime</CardTitle>
              <CardDescription>
                <span className="text-blue-600 font-semibold">99.9%</span>
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Active Users */}
          <Card className="min-h-[110px]">
            <CardHeader>
              <CardTitle className="text-sm">Active Users</CardTitle>
              <CardDescription>
                <span className="text-yellow-500 font-semibold">0</span>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
