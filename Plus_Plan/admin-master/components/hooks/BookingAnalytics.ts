import { useQuery } from "@tanstack/react-query";
import { useAdvancedAnalytics } from "@/hooks/useAdvancedAnalytics";
import { useBookings } from "@/hooks/useBookings";
import { subDays, format } from "date-fns";

export const useAdvancedBookingAnalytics = (dateRange?: {
  from: Date;
  to: Date;
}) => {
  const defaultDateRange = {
    from: subDays(new Date(), 30),
    to: new Date(),
  };

  const range = dateRange || defaultDateRange;
  const startDate = format(range.from, "yyyy-MM-dd");
  const endDate = format(range.to, "yyyy-MM-dd");

  const { data: analyticsData, isLoading: analyticsLoading } =
    useAdvancedAnalytics(startDate, endDate);
  const { data: bookings, isLoading: bookingsLoading } = useBookings();

  return useQuery({
    queryKey: ["advanced-booking-analytics", startDate, endDate],
    queryFn: async () => {
      const totalBookings = bookings?.length || 0;
      const completedBookings =
        bookings?.filter((b) => b.status === "completed").length || 0;
      const completionRate =
        totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

      // Calculate peak hours
      const hourCounts =
        bookings?.reduce((acc, booking) => {
          const hour = new Date(booking.created_at).getHours();
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        }, {} as Record<number, number>) || {};

      const peakHour = Object.keys(hourCounts).reduce((a, b) =>
        hourCounts[parseInt(a)] > hourCounts[parseInt(b)] ? a : b
      );

      // Calculate borough distribution
      const boroughCounts =
        bookings?.reduce((acc, booking) => {
          const postcode = booking.postcode?.split(" ")[0] || "Unknown";
          acc[postcode] = (acc[postcode] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

      const topBorough = Object.keys(boroughCounts).reduce((a, b) =>
        boroughCounts[a] > boroughCounts[b] ? a : b
      );

      // Calculate average quote value
      const avgQuoteValue =
        bookings?.reduce((sum, booking) => {
          if (
            booking.quote &&
            typeof booking.quote === "object" &&
            "total" in booking.quote
          ) {
            return sum + (Number(booking.quote.total) || 0);
          }
          return sum;
        }, 0) || 0;

      const avgQuote = totalBookings > 0 ? avgQuoteValue / totalBookings : 0;

      return {
        completionRate,
        peakHours: `${peakHour}:00-${parseInt(peakHour) + 1}:00`,
        topBorough,
        avgQuote: Math.round(avgQuote),
        totalBookings,
        completedBookings,
        analyticsData,
      };
    },
    enabled: !bookingsLoading && !analyticsLoading,
  });
};

