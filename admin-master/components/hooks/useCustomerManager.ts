import { useState, useMemo } from "react";
import {
  CustomerFilters,
  getDefaultCustomerFilters,
} from "@/hooks/useCustomerFilters";
import { useCustomers, useCustomerStats } from "@/hooks/useCustomers";

export const useCustomerManager = () => {
  const [filters, setFilters] = useState<CustomerFilters>(
    getDefaultCustomerFilters()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  const itemsPerPage = 12;

  // Transform filters for the useCustomers hook
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

  const {
    data: customers,
    isLoading,
    error,
  } = useCustomers(transformedFilters);
  const { data: stats, isLoading: statsLoading } = useCustomerStats();

  const totalPages = Math.ceil((customers?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers =
    customers?.slice(startIndex, startIndex + itemsPerPage) || [];

  const handleFiltersChange = (newFilters: CustomerFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setSelectedCustomers([]);
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === paginatedCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(paginatedCustomers.map((customer) => customer.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedCustomers([]);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    // State
    filters,
    currentPage,
    selectedCustomers,
    itemsPerPage,

    // Data
    customers: customers || [],
    paginatedCustomers,
    stats,
    isLoading,
    statsLoading,
    error,
    totalPages,

    // Handlers
    handleFiltersChange,
    handleCustomerSelect,
    handleSelectAll,
    handleClearSelection,
    handlePageChange,
  };
};

