import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { MapPin, Calendar, ArrowRight } from "lucide-react";

interface CustomerBookingHistoryProps {
  bookings: any[];
}

const CustomerBookingHistory: React.FC<CustomerBookingHistoryProps> = ({
  bookings,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "confirmed":
        return "outline";
      default:
        return "destructive";
    }
  };

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No bookings found for this customer.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings ({bookings.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.slice(0, 5).map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    #{booking.id.slice(0, 8)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{booking.address}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(booking.created_at), "MMM d, yyyy")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-4">
                {booking.quote?.final_quote && (
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(
                        parseFloat((booking.quote as any).final_quote)
                      )}
                    </div>
                  </div>
                )}

                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/admin/bookings/${booking.id}`}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}

          {bookings.length > 5 && (
            <div className="text-center pt-4">
              <Button variant="outline" size="sm">
                View All Bookings ({bookings.length})
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerBookingHistory;
