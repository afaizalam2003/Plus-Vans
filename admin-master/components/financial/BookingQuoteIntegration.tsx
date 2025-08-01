import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link2, Calculator, FileText, ArrowRight } from "lucide-react";
import { useBookings } from "../hooks/useBookings";
import { useFinancialQuotes, useCreateFinancialQuote } from "../hooks/useFinancialQuotes";
import { useCalculatePrice, PricingCalculationResult } from "../hooks/usePricingCalculation";

const BookingQuoteIntegration: React.FC = () => {
  const [selectedBooking, setSelectedBooking] = useState<string>("");
  const { data: bookings } = useBookings({
    // Add default filters or pass an empty object if all filters are optional
    status: 'confirmed', // Example: only show confirmed bookings
    page: 1,
    limit: 50
  });
  const { data: quotes } = useFinancialQuotes();
  const createQuote = useCreateFinancialQuote();
  const calculatePrice = useCalculatePrice();

  // Filter bookings that don't have quotes yet
  const bookingsWithoutQuotes = bookings?.filter(
    (booking) => !quotes?.some((quote) => quote.booking_id === booking.id)
  );

  const handleGenerateQuote = async (bookingId: string) => {
    const booking = bookings?.find((b) => b.id === bookingId);
    if (!booking) return;

    // Calculate price for the booking
    const inputData = {
      postcode: booking.postcode,
      address: booking.address,
      item_count: 1, // Default since items property doesn't exist
      access_difficulty: "normal",
    };

    calculatePrice.mutate(inputData, {
      onSuccess: (priceResult: PricingCalculationResult) => {
        // Create quote from booking and price calculation
        const customerDetail = booking.customer_details?.[0];

        createQuote.mutate({
          booking_id: booking.id,
          customer_email: customerDetail?.email || "customer@example.com",
          customer_name: customerDetail?.full_name || "Customer",
          customer_phone: customerDetail?.contact_number || "",
          address: booking.address,
          postcode: booking.postcode,
          line_items: priceResult.applied_rules || [],
          subtotal: priceResult.base_cost,
          tax_amount: 0,
          discount_amount: 0,
          total_amount: priceResult.total_amount,
          status: "draft",
          notes: `Auto-generated from booking ${booking.id}`,
        });
      },
    });
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <Link2 className="h-5 w-5 mr-2" />
            Booking-Quote Integration
          </h3>
          <p className="text-muted-foreground">
            Convert bookings to quotes and manage the pricing workflow
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Bookings without Quotes
                </p>
                <p className="text-2xl font-bold">
                  {bookingsWithoutQuotes?.length || 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Quotes</p>
                <p className="text-2xl font-bold">{quotes?.length || 0}</p>
              </div>
              <Calculator className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Quote Conversion Rate
                </p>
                <p className="text-2xl font-bold">
                  {bookings?.length
                    ? Math.round(
                        ((quotes?.length || 0) / bookings.length) * 100
                      )
                    : 0}
                  %
                </p>
              </div>
              <ArrowRight className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Ready for Quote Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings Ready for Quote Generation</CardTitle>
        </CardHeader>
        <CardContent>
          {bookingsWithoutQuotes && bookingsWithoutQuotes.length > 0 ? (
            <div className="space-y-4">
              {bookingsWithoutQuotes.slice(0, 10).map((booking) => {
                const customerDetail = booking.customer_details?.[0];
                return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Badge
                          className={getBookingStatusColor(booking.status)}
                        >
                          {booking.status}
                        </Badge>
                        <span className="font-medium">
                          {customerDetail?.full_name || "Unknown Customer"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {booking.address}, {booking.postcode}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Scheduled:{" "}
                        {customerDetail?.collection_date
                          ? new Date(
                              customerDetail.collection_date
                            ).toLocaleDateString()
                          : "Not scheduled"}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleGenerateQuote(booking.id)}
                      disabled={
                        createQuote.isPending || calculatePrice.isPending
                      }
                      size="sm"
                    >
                      {createQuote.isPending || calculatePrice.isPending
                        ? "Generating..."
                        : "Generate Quote"}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                All bookings have quotes generated
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Quote-Booking Relationships */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Quote-Booking Relationships</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {quotes
              ?.filter((quote) => quote.booking_id)
              .slice(0, 5)
              .map((quote) => {
                const booking = bookings?.find(
                  (b) => b.id === quote.booking_id
                );
                return (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{quote.quote_number}</p>
                      <p className="text-sm text-muted-foreground">
                        Booking: {booking?.address || "Unknown"} • £
                        {parseFloat(quote.total_amount.toString()).toFixed(2)}
                      </p>
                    </div>
                    <Badge className={getBookingStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingQuoteIntegration;
