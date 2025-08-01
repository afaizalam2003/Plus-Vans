import React from "react";
import { Booking } from "@/services/types";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  bookings: Booking[];
  onView: (booking: Booking) => void;
}

const columns = [
  {
    id: "pending",
    title: "Pending",
    gradient: "from-yellow-400 to-yellow-500",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
  {
    id: "confirmed",
    title: "Confirmed",
    gradient: "from-blue-400 to-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    id: "completed",
    title: "Completed",
    gradient: "from-green-400 to-green-500",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  {
    id: "cancelled",
    title: "Cancelled",
    gradient: "from-red-400 to-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
  },
] as const;

export default function EnhancedBookingKanban({ bookings, onView }: Props) {
  const grouped = (status: string) => bookings.filter((b) => b.status === status);

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 min-h-[600px]">
      {columns.map((col) => {
        const items = grouped(col.id);
        return (
          <div key={col.id} className="flex-shrink-0 w-80">
            <Card className={cn("h-full border-0 shadow-lg", col.bg, col.border, "border-t-4")}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full bg-gradient-to-r", col.gradient)} />
                    {col.title}
                  </div>
                  <Badge variant="secondary" className={cn(col.bg, "border-0 text-gray-700 font-semibold px-3 py-1")}>{items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[520px] overflow-y-auto">
                {items.map((b) => (
                  <Card key={b.id} className="bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 group">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full bg-gradient-to-r", col.gradient)} />
                          <h4 className="font-bold text-gray-900">#{b.id.slice(-8)}</h4>
                        </div>
                        <Badge className={cn("bg-gradient-to-r", col.gradient, "text-white border-0 text-xs px-2 py-1 capitalize")}>{b.status}</Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-gray-900 truncate">{b.address}</p>
                        <p className="text-xs text-gray-500">{b.postcode}</p>
                        <p className="text-xs text-gray-500">Created {format(new Date(b.created_at), "PPP")}</p>
                      </div>

                      {b.quote?.breakdown?.price_components && (
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                          <span className="text-primary font-semibold">£{b.quote.breakdown.price_components.total.toFixed(2)}</span>
                          <span className="text-xs text-gray-500">Quote</span>
                        </div>
                      )}

                      <Button variant="outline" size="sm" className="w-full hover:bg-primary hover:text-white transition-colors" onClick={() => onView(b)}>
                        <Eye className="h-4 w-4 mr-2" /> View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                {items.length === 0 && (
                  <div className="text-center py-12">
                    <div className={cn("w-16 h-16 rounded-full bg-gradient-to-r", col.gradient, "opacity-20 mx-auto mb-4")} />
                    <p className="text-gray-500 text-sm">No bookings</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
