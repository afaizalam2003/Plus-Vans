"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function CompliancePage() {
  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <span>Dashboard</span>
        <span>&gt;</span>
        <span className="font-medium">Compliance</span>
      </div>

      {/* Heading & subtitle */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Compliance</h1>
        <p className="text-muted-foreground">
          Manage regulatory compliance and certifications
        </p>
      </div>

      {/* Main container */}
      <div className="bg-card p-6 rounded-lg border space-y-6">
        <p className="text-sm text-muted-foreground">
          Compliance management interface will be implemented here.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2">
          {/* Active Certifications */}
          <Card className="min-h-[110px]">
            <CardHeader>
              <CardTitle className="text-sm">Active Certifications</CardTitle>
              <CardDescription>
                <span className="text-green-600 font-semibold">0</span>
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Expiring Soon */}
          <Card className="min-h-[110px]">
            <CardHeader>
              <CardTitle className="text-sm">Expiring Soon</CardTitle>
              <CardDescription>
                <span className="text-yellow-600 font-semibold">0</span>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
