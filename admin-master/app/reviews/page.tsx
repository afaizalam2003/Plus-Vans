"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function ReviewsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <span>Dashboard</span>
        <span>&gt;</span>
        <span className="font-medium">Reviews</span>
      </div>

      {/* Heading */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground">
          Manage customer reviews and feedback
        </p>
      </div>

      {/* Main card */}
      <div className="bg-card p-6 rounded-lg border space-y-6">
        <p className="text-sm text-muted-foreground">
          Reviews management interface will be implemented here.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {/* Average Rating */}
          <Card className="min-h-[110px]">
            <CardHeader>
              <CardTitle className="text-sm">Average Rating</CardTitle>
              <CardDescription>
                <span className="text-yellow-500 font-semibold">0.0</span>
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Total Reviews */}
          <Card className="min-h-[110px]">
            <CardHeader>
              <CardTitle className="text-sm">Total Reviews</CardTitle>
              <CardDescription>
                <span className="text-blue-600 font-semibold">0</span>
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Pending Reviews */}
          <Card className="min-h-[110px]">
            <CardHeader>
              <CardTitle className="text-sm">Pending Reviews</CardTitle>
              <CardDescription>
                <span className="text-red-600 font-semibold">0</span>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
