"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Custom 404 Not Found page for Plus Vans Admin
 * Displays when a user navigates to a non-existent route
 */
export default function NotFound(): React.ReactElement {
  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="max-w-md w-full p-8 text-center  rounded-none border-none shadow-none">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">404</h1>
            <h2 className="text-2xl font-semibold">Page Not Found</h2>
            <p className="text-muted-foreground">
              The page you are looking for doesn&apos;t exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <Button asChild>
              <Link href="/">Return to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/bookings">View Bookings</Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
