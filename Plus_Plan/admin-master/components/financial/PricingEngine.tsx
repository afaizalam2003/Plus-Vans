import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Calculator } from "lucide-react";
import PricingRulesManagement from "./PricingRulesManagement";
import PricingCalculator from "./PricingCalculator";
import EnhancedPricingTabs from "./enhanced/EnhancedPricingTabs";
import CreatePricingRuleDialog from "./CreatePricingRuleDialog";

const PricingEngine: React.FC = () => {
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pricing Engine</h2>
          <p className="text-muted-foreground">
            Manage dynamic pricing rules and calculate quotes with enhanced
            item-based pricing
          </p>
        </div>
        <Button onClick={() => setIsCreateRuleOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </div>

      <Tabs defaultValue="enhanced" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enhanced">Enhanced Pricing</TabsTrigger>
          <TabsTrigger value="calculator">Basic Calculator</TabsTrigger>
          <TabsTrigger value="rules">Pricing Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="enhanced">
          <EnhancedPricingTabs />
        </TabsContent>

        <TabsContent value="calculator">
          <PricingCalculator />
        </TabsContent>

        <TabsContent value="rules">
          <PricingRulesManagement />
        </TabsContent>
      </Tabs>

      <CreatePricingRuleDialog
        isOpen={isCreateRuleOpen}
        onOpenChange={setIsCreateRuleOpen}
      />
    </div>
  );
};

export default PricingEngine;
