import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Customer } from "@/types/customer";
import { Link } from "react-router-dom";
import { Eye, Mail, Phone } from "lucide-react";
import { format } from "date-fns";

interface CustomerListProps {
  customers: Customer[];
  allCustomers: Customer[];
  isLoading: boolean;
  error: Error | null;
  selectedCustomers: string[];
  onCustomerSelect: (customerId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  isLoading,
  error,
  selectedCustomers,
  onCustomerSelect,
  onSelectAll,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Customers...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">
            Failed to load customers. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!customers.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Customers Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No customers match your current filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Customers ({customers.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedCustomers.length === customers.length}
                onCheckedChange={onSelectAll}
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-muted/50"
              >
                <Checkbox
                  checked={selectedCustomers.includes(customer.id)}
                  onCheckedChange={() => onCustomerSelect(customer.id)}
                />

                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {customer.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">
                      {customer.name || "Unknown"}
                    </h3>
                    <Badge
                      variant={
                        customer.role === "admin" ? "default" : "secondary"
                      }
                    >
                      {customer.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {customer.email}
                  </p>
                  {customer.phone && (
                    <p className="text-sm text-muted-foreground">
                      {customer.phone}
                    </p>
                  )}
                </div>

                <div className="text-right space-y-1">
                  <div className="text-sm font-medium">
                    {customer.total_bookings || 0} bookings
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(customer.total_spent || 0)} spent
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Joined{" "}
                    {format(new Date(customer.created_at), "MMM d, yyyy")}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/admin/customers/${customer.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>

                  {customer.email && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`mailto:${customer.email}`}>
                        <Mail className="h-4 w-4" />
                      </a>
                    </Button>
                  )}

                  {customer.phone && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`tel:${customer.phone}`}>
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => onPageChange(page)}
                      isActive={page === currentPage}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    onPageChange(Math.min(totalPages, currentPage + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
