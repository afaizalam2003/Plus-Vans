import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuotesManagement from "../QuotesManagement";
import InvoicesManagement from "../InvoicesManagement";
import PaymentTransactions from "../PaymentTransactions";
import FinancialReports from "../FinancialReports";
import PricingEngine from "../PricingEngine";
import SubscriptionManagement from "../subscriptions/SubscriptionManagement";
import BookingQuoteIntegration from "../BookingQuoteIntegration";
import MLFeedbackDashboard from "../ml/MLFeedbackDashboard";
import RealTimeQuoteSync from "../integration/RealTimeQuoteSync";
import FinancialIntegrationDashboard from "../integration/FinancialIntegrationDashboard";
import JobQuoteLinkingPanel from "../integration/JobQuoteLinkingPanel";
import CustomerIntelligenceDashboard from "../customer/CustomerIntelligenceDashboard";


interface FinancialDashboardGridProps {
  stats?: any;
  categoryId?: string;
  sections?: string[];
}

const FinancialDashboardGrid = ({
  categoryId,
  sections,
}: FinancialDashboardGridProps) => {
  const getCategorySections = (categoryId: string) => {
    switch (categoryId) {
      case "pricing-quoting":
        return ["quotes", "pricing", "ml"];
      case "revenue-analytics":
        return ["reports", "integration", "sync"];
      case "payments-billing":
        return ["invoices", "payments", "subscriptions"];
      case "customer-intelligence":
        return ["customer-intelligence"];
      case "operations-integration":
        return ["job-linking", "booking-integration"];
      default:
        return [];
    }
  };

  const activeSections = categoryId
    ? getCategorySections(categoryId)
    : sections || ["quotes", "invoices", "payments", "reports"];

  const renderTabContent = (section: string) => {
    switch (section) {
      case "quotes":
        return <QuotesManagement />;
      case "invoices":
        return <InvoicesManagement />;
      case "payments":
        return <PaymentTransactions />;

      case "integration":
        return <FinancialIntegrationDashboard />;
      case "job-linking":
        return <JobQuoteLinkingPanel />;
      case "sync":
        return <RealTimeQuoteSync />;
      case "ml":
        return <MLFeedbackDashboard />;
      case "customer-intelligence":
        return <CustomerIntelligenceDashboard />;
      case "subscriptions":
        return <SubscriptionManagement />;
      case "pricing":
        return <PricingEngine />;
      case "booking-integration":
        return <BookingQuoteIntegration />;
      case "reports":
        return <FinancialReports />;
      default:
        return <QuotesManagement />;
    }
  };

  const getSectionTitle = (section: string): string => {
    const titles: Record<string, string> = {
      quotes: "Quotes",
      invoices: "Invoices",
      payments: "Payments",

      integration: "Integration",
      "job-linking": "Job Linking",
      sync: "Real-time Sync",
      ml: "ML Optimization",
      "customer-intelligence": "Customer Intelligence",
      subscriptions: "Subscriptions",
      pricing: "Pricing Engine",
      "booking-integration": "Booking Integration",
      reports: "Reports",
    };
    return titles[section] || section;
  };

  return (
    <Tabs defaultValue={activeSections[0]} className="space-y-4">
      <TabsList
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${activeSections.length}, 1fr)` }}
      >
        {activeSections.map((section) => (
          <TabsTrigger key={section} value={section}>
            {getSectionTitle(section)}
          </TabsTrigger>
        ))}
      </TabsList>

      {activeSections.map((section) => (
        <TabsContent key={section} value={section}>
          {renderTabContent(section)}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default FinancialDashboardGrid;
