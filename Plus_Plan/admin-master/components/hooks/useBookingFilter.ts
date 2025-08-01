export interface BookingFilters {
  status: string;
  search: string;
  dateRange: string;
  sortBy: string;
  sortOrder: string;
}

export const transformFiltersForAPI = (filters: BookingFilters) => {
  const transformedFilters: {
    status?: string;
    dateRange?: { from: Date; to: Date };
    search?: string;
  } = {};

  if (filters.status !== "all") {
    transformedFilters.status = filters.status;
  }

  if (filters.search) {
    transformedFilters.search = filters.search;
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
        from = new Date(0); // Default to epoch if unknown range
    }

    transformedFilters.dateRange = { from, to };
  }

  return transformedFilters;
};

export const getDefaultFilters = (): BookingFilters => ({
  status: "all",
  search: "",
  dateRange: "all",
  sortBy: "created_at",
  sortOrder: "desc",
});

