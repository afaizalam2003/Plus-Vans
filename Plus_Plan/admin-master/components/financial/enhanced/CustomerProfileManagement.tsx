import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, CreditCard, Award, Settings } from "lucide-react";
import CustomerProfilesList from "./CustomerProfilesList";
import MembershipTiersManagement from "./MembershipTiersManagement";
import TradeAccountManagement from "./TradeAccountManagement";
import VolumeDiscountRules from "./VolumeDiscountRules";
import CreateCustomerProfileDialog from "./CreateCustomerProfileDialog";

const CustomerProfileManagement: React.FC = () => {
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Customer Profile System</h2>
          <p className="text-muted-foreground">
            Manage customer pricing profiles, memberships, and trade accounts
          </p>
        </div>
        <Button onClick={() => setIsCreateProfileOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Profile
        </Button>
      </div>

      <Tabs defaultValue="profiles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profiles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customer Profiles
          </TabsTrigger>
          <TabsTrigger value="memberships" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Membership Tiers
          </TabsTrigger>
          <TabsTrigger value="trade" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Trade Accounts
          </TabsTrigger>
          <TabsTrigger value="discounts" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Volume Discounts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profiles">
          <CustomerProfilesList />
        </TabsContent>

        <TabsContent value="memberships">
          <MembershipTiersManagement />
        </TabsContent>

        <TabsContent value="trade">
          <TradeAccountManagement />
        </TabsContent>

        <TabsContent value="discounts">
          <VolumeDiscountRules />
        </TabsContent>
      </Tabs>

      <CreateCustomerProfileDialog
        isOpen={isCreateProfileOpen}
        onOpenChange={setIsCreateProfileOpen}
      />
    </div>
  );
};

export default CustomerProfileManagement;
