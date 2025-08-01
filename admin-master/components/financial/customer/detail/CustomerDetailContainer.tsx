import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Customer } from "@/types/customer";
import CustomerDetailHeader from "../CustomerDetailHeader";
import CustomerMetrics from "../CustomerMetrics";
import CustomerBookingHistory from "../CustomerBookingHistory";
import CustomerPaymentHistory from "../CustomerPaymentHistory";
import CustomerReviews from "../CustomerReviews";
import CustomerMediaOverview from "../CustomerMediaOverview";

interface CustomerDetailContainerProps {
  customer: Customer & {
    bookings?: any[];
    total_bookings?: number;
    total_spent?: number;
    average_rating?: number;
  };
}

const CustomerDetailContainer: React.FC<CustomerDetailContainerProps> = ({
  customer,
}) => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <CustomerDetailHeader customer={customer} />

      <CustomerMetrics customer={customer} />

      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="media">Media & Docs</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          <CustomerBookingHistory bookings={customer.bookings || []} />
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <CustomerMediaOverview bookings={customer.bookings || []} />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <CustomerPaymentHistory bookings={customer.bookings || []} />
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <CustomerReviews bookings={customer.bookings || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDetailContainer;
