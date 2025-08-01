import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, TrendingUp, CreditCard, Calendar } from "lucide-react";
import { Customer } from "@/types/customer";

interface CustomerMetricsProps {
  customer: Customer & {
    bookings?: any[];
    total_bookings?: number;
    total_spent?: number;
    average_rating?: number;
  };
}

const CustomerMetrics: React.FC<CustomerMetricsProps> = ({ customer }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const completedBookings =
    customer.bookings?.filter((b) => b.status === "completed").length || 0;
  const pendingBookings =
    customer.bookings?.filter((b) => b.status === "pending").length || 0;
  const averageOrderValue = customer.total_bookings
    ? (customer.total_spent || 0) / customer.total_bookings
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {customer.total_bookings || 0}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span className="text-green-600">
              {completedBookings} completed
            </span>
            {pendingBookings > 0 && (
              <span className="text-yellow-600">{pendingBookings} pending</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(customer.total_spent || 0)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Lifetime value</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Order</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(averageOrderValue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Per booking</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              {(customer.average_rating || 0).toFixed(1)}
            </div>
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Customer satisfaction
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerMetrics;
