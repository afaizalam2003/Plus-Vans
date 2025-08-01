import React, { useState } from "react";
import { DollarSign } from "lucide-react";
import FinancialHeader from "./FinancialHeader";
import FinancialStatsCards from "./FinancialStatsCards";
import CreateQuoteDialog from "./CreateQuoteDialog";
import FinancialCategoryGrid from "./dashboard/FinancialCategoryGrid";
import FinancialDashboardGrid from "./dashboard/FinancialDashboardGrid";
import FinancialDashboardHeader from "./dashboard/FinancialDashboardHeader";

const FinancialManagement: React.FC = () => {
  const [isCreateQuoteOpen, setIsCreateQuoteOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);

  // Mock stats - in real app, these would come from API
  const stats = {
    activeQuotes: 156,
    conversionRate: 72,
    monthlyRevenue: 245000,
    profitMargin: 18,
    pendingInvoices: 43,
    outstandingAmount: 32500,
    activeCustomers: 892,
    retentionRate: 89,
    linkedJobs: 234,
    syncStatus: "Active",
  };

  const handleCreateQuote = () => {
    setIsCreateQuoteOpen(true);
  };

  const handleCategorySelect = (categoryId: string) => {
    setCurrentCategory(categoryId);
  };

  const handleBackToCategories = () => {
    setCurrentCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Main dashboard header - only show when not in category view */}
      {!currentCategory && (
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Financial Management Dashboard
            </h1>
            <p className="text-muted-foreground">
              Comprehensive financial tools and analytics for your business
            </p>
          </div>
        </div>
      )}

      <FinancialDashboardHeader
        currentCategory={currentCategory}
        onBack={handleBackToCategories}
        onBackToCategories={handleBackToCategories}
      />

      <FinancialHeader onCreateQuote={handleCreateQuote} />

      <FinancialStatsCards />

      {currentCategory ? (
        <FinancialDashboardGrid categoryId={currentCategory} stats={stats} />
      ) : (
        <FinancialCategoryGrid
          onCategorySelect={handleCategorySelect}
          stats={stats}
        />
      )}

      <CreateQuoteDialog
        isOpen={isCreateQuoteOpen}
        onOpenChange={setIsCreateQuoteOpen}
      />
    </div>
  );
};

export default FinancialManagement;
