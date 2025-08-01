import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuotesManagement from "./QuotesManagement";
import InvoicesManagement from "./InvoicesManagement";
import PaymentTransactions from "./PaymentTransactions";
import FinancialReports from "./FinancialReports";

// Simplified version for backward compatibility
const FinancialTabs: React.FC = () => {
  return (
    <Tabs defaultValue="quotes" className="space-y-4">
      <TabsList className="grid grid-cols-4">
        <TabsTrigger value="quotes">Quotes</TabsTrigger>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
        <TabsTrigger value="payments">Payments</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>

      <TabsContent value="quotes">
        <QuotesManagement />
      </TabsContent>

      <TabsContent value="invoices">
        <InvoicesManagement />
      </TabsContent>

      <TabsContent value="payments">
        <PaymentTransactions />
      </TabsContent>

      <TabsContent value="reports">
        <FinancialReports />
      </TabsContent>
    </Tabs>
  );
};

export default FinancialTabs;
