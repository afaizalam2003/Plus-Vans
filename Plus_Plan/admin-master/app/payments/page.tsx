"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Button } from "@/components/ui/button";
import { fetchPayments } from "@/redux/slices/adminSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { PaymentDialog } from "@/components/dialogs/payment-dialog";
import { Download, ExternalLink, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { StripePayment } from "@/services/types";
import { Input } from "@/components/ui/input";
import DateRangePicker from "@/components/ui/date-range-picker";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type LoadingState = "idle" | "pending" | "succeeded" | "failed";

interface PaymentFilters {
  status: string;
  search?: string;
  dateRange: {
    start: string;
    end: string;
  };
}

interface AdminState {
  loading: {
    payments: LoadingState;
  };
  payments: StripePayment[];
  error: {
    payments: string | null;
  };
}

const isLoadingState = (state: unknown): state is LoadingState => {
  return (
    state === "idle" ||
    state === "pending" ||
    state === "succeeded" ||
    state === "failed"
  );
};

// Payment filters component
const PaymentFilters = ({
  filters,
  setFilters,
}: {
  filters: PaymentFilters;
  setFilters: (filters: PaymentFilters) => void;
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [searchInput, setSearchInput] = useState<string>(filters.search || "");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchInput });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    if (e.target.value === "") {
      setFilters({ ...filters, search: undefined });
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm space-y-4 mb-6 border border-[#635bff]/20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-semibold text-[#635bff]">Filters</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setFilters({
              status: "all",
              search: undefined,
              dateRange: {
                start: new Date(
                  new Date().setMonth(new Date().getMonth() - 1)
                ).toISOString(),
                end: new Date().toISOString(),
              },
            })
          }
          className="w-full sm:w-auto border-[#635bff]/20 text-[#635bff] hover:bg-[#635bff]/10"
        >
          Reset Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-[#635bff]">
            Search
          </label>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID or amount..."
              className="pl-8 w-full border-[#635bff]/20 focus:border-[#635bff] transition-colors"
              value={searchInput}
              onChange={handleSearchChange}
            />
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 text-[#635bff]"
            >
              Search
            </Button>
          </form>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-[#635bff]">
            Status
          </label>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger className="w-full border-[#635bff]/20 focus:border-[#635bff] transition-colors">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="succeeded">Succeeded</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="requires_payment_method">
                Requires Payment
              </SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-[#635bff]">
            Date Range
          </label>
          <DateRangePicker
            value={{
              from: filters.dateRange.start
                ? new Date(filters.dateRange.start)
                : undefined,
              to: filters.dateRange.end
                ? new Date(filters.dateRange.end)
                : undefined,
            }}
            onChange={(range) =>
              setFilters({
                ...filters,
                dateRange: {
                  start:
                    range?.from?.toISOString() ||
                    new Date(
                      new Date().setMonth(new Date().getMonth() - 1)
                    ).toISOString(),
                  end: range?.to?.toISOString() || new Date().toISOString(),
                },
              })
            }
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default function PaymentsPage() {
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [filters, setFilters] = useState<PaymentFilters>({
    status: "all",
    search: undefined,
    dateRange: {
      start: new Date(
        new Date().setMonth(new Date().getMonth() - 1)
      ).toISOString(),
      end: new Date().toISOString(),
    },
  });

  const { payments, loading, error } = useAppSelector(
    (state: { admin: AdminState }) => ({
      payments: state.admin.payments,
      loading: isLoadingState(state.admin.loading.payments)
        ? state.admin.loading.payments
        : "idle",
      error: state.admin.error.payments,
    })
  );

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [filteredPayments, setFilteredPayments] = useState<StripePayment[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Apply filters to payments
  useEffect(() => {
    if (!Array.isArray(payments)) return;

    let result = [...payments];

    // Apply status filter
    if (filters.status !== "all") {
      result = result.filter((payment) => payment.status === filters.status);
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (payment) =>
          payment.id.toLowerCase().includes(searchLower) ||
          payment.amount.toString().includes(searchLower) ||
          (payment.booking_id &&
            payment.booking_id.toLowerCase().includes(searchLower))
      );
    }

    // Apply date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start).getTime();
      const endDate = new Date(filters.dateRange.end).getTime();
      result = result.filter((payment) => {
        const paymentDate = new Date(payment.created_at).getTime();
        return paymentDate >= startDate && paymentDate <= endDate;
      });
    }

    setTotalItems(result.length);

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedResult = result.slice(startIndex, startIndex + itemsPerPage);

    setFilteredPayments(paginatedResult);
  }, [payments, filters, currentPage, itemsPerPage]);

  // Fetch payments with filters
  const fetchFilteredPayments = useCallback(() => {
    dispatch(fetchPayments({}));
  }, [dispatch]);

  useEffect(() => {
    fetchFilteredPayments();
  }, [fetchFilteredPayments]);

  const handleExport = async (): Promise<void> => {
    try {
      setIsExporting(true);
      const headers = [
        "Payment ID",
        "Amount",
        "Currency",
        "Status",
        "Date",
        "Booking ID",
      ];

      if (!filteredPayments || !Array.isArray(filteredPayments)) {
        throw new Error("Payments data is not available");
      }

      const csvData = filteredPayments.map((payment: StripePayment) => [
        payment.id,
        Number(payment.amount).toFixed(2),
        payment.currency.toUpperCase(),
        payment.status,
        format(new Date(payment.created_at), "PPp"),
        payment.booking_id || "N/A",
      ]);

      const csvContent = [headers, ...csvData]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `payments-${format(new Date(), "yyyy-MM-dd")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Payments data exported successfully");
    } catch (error) {
      toast.error("Failed to export payments data");
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreatePayment = (): void => {
    setDialogOpen(true);
  };

  const openStripePayment = (paymentId: string): void => {
    // Check if payment ID starts with 'pi_' (payment intent) or 'py_' (payment)
    const baseUrl = "https://dashboard.stripe.com";
    const mode =
      paymentId.startsWith("pi_test_") || paymentId.startsWith("py_test_")
        ? "/test"
        : "";
    const path = paymentId.startsWith("pi_") ? "payments" : "payouts";

    window.open(`${baseUrl}${mode}/${path}/${paymentId}`, "_blank");
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string): void => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (loading === "pending") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#635bff]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Payments</h2>
          <p>{error}</p>
          <Button
            onClick={fetchFilteredPayments}
            className="mt-4 bg-[#635bff] hover:bg-[#635bff]/90"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Safely calculate metrics with null checks
  const paymentsArray = Array.isArray(payments) ? payments : [];
  const totalAmount = paymentsArray.reduce(
    (sum: number, payment: StripePayment) => sum + Number(payment.amount),
    0
  );
  const successfulPayments = paymentsArray.filter(
    (p: StripePayment) => p.status === "succeeded"
  );
  const successRate =
    paymentsArray.length > 0
      ? (successfulPayments.length / paymentsArray.length) * 100
      : 0;

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  return (
    <div className="p-6 px-12 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#635bff]">
            Payments
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track payment transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCreatePayment}
            className="border-[#635bff]/20 text-[#635bff] hover:bg-[#635bff]/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Payment
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="border-[#635bff]/20 text-[#635bff] hover:bg-[#635bff]/10"
          >
            <Download
              className={cn("w-4 h-4 mr-2", isExporting && "animate-spin")}
            />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="p-6 border-[#635bff]/20 hover:border-[#635bff]/40 transition-colors">
          <h3 className="font-medium text-[#635bff]">Total Revenue</h3>
          <p className="text-2xl font-bold">£{totalAmount.toFixed(2)}</p>
        </Card>
        <Card className="p-6 border-[#635bff]/20 hover:border-[#635bff]/40 transition-colors">
          <h3 className="font-medium text-[#635bff]">Success Rate</h3>
          <p className="text-2xl font-bold">{successRate.toFixed(1)}%</p>
        </Card>
        <Card className="p-6 border-[#635bff]/20 hover:border-[#635bff]/40 transition-colors">
          <h3 className="font-medium text-[#635bff]">Total Transactions</h3>
          <p className="text-2xl font-bold">{paymentsArray.length}</p>
        </Card>
      </div>

      <PaymentFilters filters={filters} setFilters={setFilters} />

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          Showing {filteredPayments.length} of {totalItems} payments
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show:</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={handleItemsPerPageChange}
          >
            <SelectTrigger className="w-[80px] border-[#635bff]/20">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg bg-card border-[#635bff]/20 shadow-sm">
        <Table>
          <TableHeader className="bg-[#635bff]/5">
            <TableRow>
              <TableHead className="font-semibold">Payment ID</TableHead>
              <TableHead className="font-semibold">Amount</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Booking ID</TableHead>
              <TableHead className="text-right font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment: StripePayment) => (
                <TableRow
                  key={payment.id}
                  className="hover:bg-[#635bff]/5 transition-colors"
                >
                  <TableCell className="font-medium">
                    {payment.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {payment.currency.toUpperCase()}{" "}
                    {Number(payment.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === "succeeded"
                          ? "success"
                          : payment.status === "processing"
                          ? "warning"
                          : payment.status === "requires_payment_method"
                          ? "secondary"
                          : "destructive"
                      }
                      className={cn(
                        payment.status === "succeeded" &&
                          "bg-[#635bff] text-white",
                        payment.status === "processing" &&
                          "bg-yellow-100 text-yellow-800",
                        payment.status === "requires_payment_method" &&
                          "bg-blue-100 text-blue-800",
                        payment.status === "canceled" &&
                          "bg-red-100 text-red-800"
                      )}
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(payment.created_at), "PPp")}
                  </TableCell>
                  <TableCell>{payment.booking_id || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#635bff] hover:bg-[#635bff]/10 transition-colors"
                      onClick={() => openStripePayment(payment.id)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Stripe
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No payment records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={cn(
                    "cursor-pointer border-[#635bff]/20 text-[#635bff] hover:bg-[#635bff]/10",
                    currentPage === 1 && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show first page, last page, current page, and pages around current
                let pageToShow: number | null = null;

                if (totalPages <= 5) {
                  // If 5 or fewer pages, show all
                  pageToShow = i + 1;
                } else if (currentPage <= 3) {
                  // Near start
                  if (i < 4) {
                    pageToShow = i + 1;
                  } else {
                    pageToShow = totalPages;
                  }
                } else if (currentPage >= totalPages - 2) {
                  // Near end
                  if (i === 0) {
                    pageToShow = 1;
                  } else {
                    pageToShow = totalPages - (4 - i);
                  }
                } else {
                  // Middle
                  if (i === 0) {
                    pageToShow = 1;
                  } else if (i === 4) {
                    pageToShow = totalPages;
                  } else {
                    pageToShow = currentPage + (i - 2);
                  }
                }

                // Show ellipsis instead of page number in certain cases
                if (
                  (i === 1 && pageToShow !== 2 && totalPages > 5) ||
                  (i === 3 && pageToShow !== totalPages - 1 && totalPages > 5)
                ) {
                  return (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                if (pageToShow !== null) {
                  return (
                    <PaginationItem key={pageToShow}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageToShow as number)}
                        isActive={currentPage === pageToShow}
                        className={cn(
                          "cursor-pointer",
                          currentPage === pageToShow
                            ? "bg-[#635bff] text-white hover:bg-[#635bff]/90"
                            : "border-[#635bff]/20 text-[#635bff] hover:bg-[#635bff]/10"
                        )}
                      >
                        {pageToShow}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }

                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  className={cn(
                    "cursor-pointer border-[#635bff]/20 text-[#635bff] hover:bg-[#635bff]/10",
                    currentPage === totalPages &&
                      "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <PaymentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
