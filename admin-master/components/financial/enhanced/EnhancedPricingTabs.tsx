import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnhancedPricingCalculator from "./EnhancedPricingCalculator";
import ItemTypesManagement from "./ItemTypesManagement";
import LoadSizeManagement from "./LoadSizeManagement";
import LondonLogisticsManagement from "./LondonLogisticsManagement";
import CustomerProfileManagement from "./CustomerProfileManagement";
import AIQuoteScenarios from "./AIQuoteScenarios";
import RuleTestingSandbox from "./RuleTestingSandbox";
import VisualRuleBuilder from "./VisualRuleBuilder";
import PricingABTestDashboard from "./PricingABTestDashboard";
import AdvancedAnalyticsDashboard from "./AdvancedAnalyticsDashboard";

const EnhancedPricingTabs: React.FC = () => {
  return (
    <Tabs defaultValue="calculator" className="space-y-4">
      <TabsList className="grid grid-cols-5 lg:grid-cols-10">
        <TabsTrigger value="calculator">Calculator</TabsTrigger>
        <TabsTrigger value="ai-scenarios">AI Scenarios</TabsTrigger>
        <TabsTrigger value="rule-testing">Rule Testing</TabsTrigger>
        <TabsTrigger value="visual-rules">Visual Rules</TabsTrigger>
        <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="customers">Customers</TabsTrigger>
        <TabsTrigger value="items">Items</TabsTrigger>
        <TabsTrigger value="loads">Loads</TabsTrigger>
        <TabsTrigger value="logistics">Logistics</TabsTrigger>
      </TabsList>

      <TabsContent value="calculator">
        <EnhancedPricingCalculator />
      </TabsContent>

      <TabsContent value="ai-scenarios">
        <AIQuoteScenarios />
      </TabsContent>

      <TabsContent value="rule-testing">
        <RuleTestingSandbox />
      </TabsContent>

      <TabsContent value="visual-rules">
        <VisualRuleBuilder />
      </TabsContent>

      <TabsContent value="ab-testing">
        <PricingABTestDashboard />
      </TabsContent>

      <TabsContent value="analytics">
        <AdvancedAnalyticsDashboard />
      </TabsContent>

      <TabsContent value="customers">
        <CustomerProfileManagement />
      </TabsContent>

      <TabsContent value="items">
        <ItemTypesManagement />
      </TabsContent>

      <TabsContent value="loads">
        <LoadSizeManagement />
      </TabsContent>

      <TabsContent value="logistics">
        <LondonLogisticsManagement />
      </TabsContent>
    </Tabs>
  );
};

export default EnhancedPricingTabs;
