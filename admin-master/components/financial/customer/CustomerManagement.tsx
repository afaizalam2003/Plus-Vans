import React from "react";
import CustomerFilters from "@/components/admin/customers/CustomerFilters";
import CustomerStats from "@/components/admin/customers/CustomerStats";
import CustomerList from "@/components/admin/customers/CustomerList";
import { useCustomerManager } from "@/hooks/useCustomerManager";

const CustomerManagement: React.FC = () => {
  const {
    filters,
    selectedCustomers,
    customers,
    paginatedCustomers,
    stats,
    isLoading,
    statsLoading,
    error,
    currentPage,
    totalPages,
    handleFiltersChange,
    handleCustomerSelect,
    handleSelectAll,
    handleClearSelection,
    handlePageChange,
  } = useCustomerManager();

  if (error) {
    console.error("Error loading customers:", error);
  }

  return (
    <div className="space-y-6">
      <CustomerStats stats={stats} isLoading={statsLoading} />

      <CustomerFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <CustomerList
        customers={paginatedCustomers}
        allCustomers={customers}
        isLoading={isLoading}
        error={error}
        selectedCustomers={selectedCustomers}
        onCustomerSelect={handleCustomerSelect}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default CustomerManagement;
