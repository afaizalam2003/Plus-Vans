import { useState, useMemo } from "react";
import { ViewMode } from "@/components/admin/bookings/ViewModeToggle";
import { BookingFilters, getDefaultFilters } from "@/hooks/useBookingFilters";
import { useBookings, useBookingStats } from "@/hooks/useBookings";

export const useBookingManager = () => {
  const [filters, setFilters] = useState<BookingFilters>(getDefaultFilters());
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);

  const itemsPerPage = viewMode === "kanban" ? 50 : 12;

  // Transform filters for the useBookings hook
  const transformedFilters = useMemo(() => {
    const result: {
      status?: string;
      dateRange?: { from: Date; to: Date };
      search?: string;
    } = {};

    if (filters.status !== "all") {
      result.status = filters.status;
    }

    if (filters.search) {
      result.search = filters.search;
    }

    // Transform dateRange string to Date object
    if (filters.dateRange && filters.dateRange !== "all") {
      const now = new Date();
      let from: Date;
      let to: Date = now;

      switch (filters.dateRange) {
        case "today":
          from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          from = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "quarter":
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          from = new Date(now.getFullYear(), quarterStart, 1);
          break;
        default:
          from = new Date(0);
      }

      result.dateRange = { from, to };
    }

    return result;
  }, [filters]);

  const { data: bookings, isLoading, error } = useBookings(transformedFilters);
  const { data: stats, isLoading: statsLoading } = useBookingStats();

  const totalPages = Math.ceil((bookings?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings =
    bookings?.slice(startIndex, startIndex + itemsPerPage) || [];

  const handleFiltersChange = (newFilters: BookingFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setSelectedBookings([]);
  };

  const handleBookingSelect = (bookingId: string) => {
    setSelectedBookings((prev) =>
      prev.includes(bookingId)
        ? prev.filter((id) => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBookings.length === paginatedBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(paginatedBookings.map((booking) => booking.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedBookings([]);
  };

  const handleViewChange = (newView: ViewMode) => {
    setViewMode(newView);
    setCurrentPage(1);
    setSelectedBookings([]);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    // State
    filters,
    currentPage,
    viewMode,
    selectedBookings,
    itemsPerPage,

    // Data
    bookings: bookings || [],
    paginatedBookings,
    stats,
    isLoading,
    statsLoading,
    error,
    totalPages,

    // Handlers
    handleFiltersChange,
    handleBookingSelect,
    handleSelectAll,
    handleClearSelection,
    handleViewChange,
    handlePageChange,
  };
};

