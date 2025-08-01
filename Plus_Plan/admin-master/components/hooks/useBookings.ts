import { useQuery } from "@tanstack/react-query";
import { Booking } from "@/types/booking";
import { api } from "@/src/lib/axios";

export interface BookingsResponse {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useBookings = (filters: {
  status?: string;
  dateRange?: { from: Date; to: Date };
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const queryKey = [
    "bookings",
    filters.status,
    filters.dateRange,
    filters.search,
    filters.page,
    filters.limit,
  ];

  return useQuery<BookingsResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.status) params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.dateRange) {
        params.append("startDate", filters.dateRange.from.toISOString());
        params.append("endDate", filters.dateRange.to.toISOString());
      }

      const { data } = await api.get(`/api/bookings?${params.toString()}`);
      return data;
    },
    keepPreviousData: true,
  });
};

export const useBookingStats = () => {
  return useQuery({
    queryKey: ["booking-stats"],
    queryFn: async () => {
      const { data } = await api.get("/api/bookings/stats");
      return data;
    },
  });
};

