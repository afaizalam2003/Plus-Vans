import React from "react";

import { Booking } from "@/services/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreVertical } from "lucide-react";

interface Props {
  bookings: Booking[];
  onView: (booking: Booking) => void;
  /**
   * Optional handler fired when a status is chosen from the action menu
   */
  onStatusChange?: (id: string, status: Booking["status"]) => void;
}

const statusStyles: Record<Booking["status"], { bg: string; gradient: string }> = {
  pending: {
    bg: "bg-yellow-50 border-yellow-200",
    gradient: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white",
  },
  confirmed: {
    bg: "bg-blue-50 border-blue-200",
    gradient: "bg-gradient-to-r from-blue-400 to-blue-500 text-white",
  },
  completed: {
    bg: "bg-green-50 border-green-200",
    gradient: "bg-gradient-to-r from-green-400 to-green-500 text-white",
  },
  cancelled: {
    bg: "bg-red-50 border-red-200",
    gradient: "bg-gradient-to-r from-red-400 to-red-500 text-white",
  },
};

export default function EnhancedBookingList({ bookings, onView, onStatusChange }: Props) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground bg-slate-50 rounded-md">
        No bookings found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((b) => {
        const s = statusStyles[b.status];
        return (
          <Card
            key={b.id}
            className={cn(
              "group border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden",
              s.bg,
              "border-l-4",
              s.bg.includes("border") && s.bg.split(" ").pop()
            )}
          >
            <CardContent className="p-6">
              {/* top row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900">#{b.id.slice(-8)}</h3>
                    <Badge className={cn("px-3 py-1 text-xs font-medium border-0 shadow-sm", s.gradient)}>
                      {b.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium truncate text-gray-700">{b.address}</p>
                  <p className="text-xs text-muted-foreground">{b.postcode}</p>
                </div>

                <div className="flex flex-col items-end gap-2 min-w-[8rem]">
                  {b.quote?.breakdown?.price_components && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Quote</p>
                      <p className="text-xl font-bold text-primary">
                        £{b.quote.breakdown.price_components.total.toFixed(2)}
                      </p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(b)}
                    className="hover:bg-primary hover:text-white transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                </div>

                {onStatusChange && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {(["pending", "confirmed", "completed", "cancelled"] as Booking["status"][]).map((st) => (
                        <DropdownMenuItem key={st} onClick={() => onStatusChange(b.id, st)}>
                          Mark as {st}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* bottom meta */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-gray-600">Created</p>
                  <p>{format(new Date(b.created_at), "PPP")}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Collection</p>
                  <p>
                    {b.collection_time ? format(new Date(b.collection_time), "PPP p") : "Not scheduled"}
                  </p>
                </div>
                {b.customer_name && (
                  <div className="col-span-2 md:col-span-1">
                    <p className="font-medium text-gray-600">Customer</p>
                    <p>{b.customer_name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
