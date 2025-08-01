import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface CustomerReviewsProps {
  bookings: any[];
}

const CustomerReviews: React.FC<CustomerReviewsProps> = ({ bookings }) => {
  const reviewsData =
    bookings
      ?.filter((b) => b.reviews?.length > 0)
      .flatMap((booking) =>
        booking.reviews.map((review: any) => ({
          ...review,
          bookingId: booking.id,
        }))
      ) || [];

  if (reviewsData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No reviews found for this customer.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Reviews ({reviewsData.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviewsData.map((review) => (
            <div key={review.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? "text-yellow-500 fill-current"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                  <span className="font-medium">{review.rating}/5</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(review.created_at), "MMM d, yyyy")}
                </span>
              </div>

              <p className="text-sm leading-relaxed">{review.comment}</p>

              <div className="text-xs text-muted-foreground">
                Booking #{review.bookingId.slice(0, 8)}
              </div>

              {reviewsData.indexOf(review) < reviewsData.length - 1 && (
                <hr className="my-4" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerReviews;
