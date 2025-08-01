import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CreditCard, Receipt } from "lucide-react";

interface CustomerPaymentHistoryProps {
  bookings: any[];
}

const CustomerPaymentHistory: React.FC<CustomerPaymentHistoryProps> = ({
  bookings,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const paymentsData =
    bookings
      ?.filter((b) => b.stripe_payments?.length > 0)
      .flatMap((booking) =>
        booking.stripe_payments.map((payment: any) => ({
          ...payment,
          bookingId: booking.id,
        }))
      ) || [];

  if (paymentsData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No payments found for this customer.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History ({paymentsData.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paymentsData.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-full">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">
                    Payment #{payment.id.slice(0, 8)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Booking #{payment.bookingId.slice(0, 8)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(payment.created_at), "MMM d, yyyy")}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-medium text-lg">
                  {formatCurrency(parseFloat(payment.amount))}
                </div>
                <Badge
                  variant={
                    payment.status === "succeeded" ? "default" : "destructive"
                  }
                >
                  {payment.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerPaymentHistory;
