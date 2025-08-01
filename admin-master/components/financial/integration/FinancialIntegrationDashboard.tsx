import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCw,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  useFinancialIntegrations,
  useAutomatedPaymentReleases,
} from "@/components/hooks/useFinancialIntegration";
import { useRevenueAnalytics } from "@/components/hooks/useRevenueAnalytics";

const FinancialIntegrationDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  const {
    data: integrations = [],
    isLoading: integrationsLoading,
    refetch: refetchIntegrations,
  } = useFinancialIntegrations();
  const { data: paymentReleases = [], isLoading: releasesLoading } =
    useAutomatedPaymentReleases();
  const { data: analytics = [], isLoading: analyticsLoading } =
    useRevenueAnalytics(selectedPeriod);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "invoiced":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "released":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "held":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalRevenue = integrations.reduce(
    (sum, item) => sum + item.paid_amount,
    0
  );
  const totalCosts = integrations.reduce(
    (sum, item) => sum + item.total_costs,
    0
  );
  const grossProfit = totalRevenue - totalCosts;
  const profitMargin =
    totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  const pendingReleases = paymentReleases.filter(
    (release) => release.status === "pending"
  );
  const readyForRelease = paymentReleases.filter(
    (release) =>
      release.job_completion_confirmed &&
      release.quality_check_passed &&
      release.all_costs_recorded
  );

  if (integrationsLoading || releasesLoading || analyticsLoading) {
    return <div>Loading financial integration dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            Financial Integration Dashboard
          </h3>
          <p className="text-muted-foreground">
            Real-time financial tracking and automation
          </p>
        </div>
        <Button variant="outline" onClick={() => refetchIntegrations()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              £{totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From {integrations.length} jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              £{grossProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {profitMargin.toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Releases
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReleases.length}</div>
            <p className="text-xs text-muted-foreground">
              £
              {pendingReleases
                .reduce((sum, item) => sum + item.release_amount, 0)
                .toLocaleString()}{" "}
              total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ready for Release
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readyForRelease.length}</div>
            <p className="text-xs text-muted-foreground">All criteria met</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="integrations">Job Integrations</TabsTrigger>
          <TabsTrigger value="payments">Payment Releases</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Financial Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {integrations.slice(0, 5).map((integration) => (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">
                          Job {integration.booking_id.substring(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Revenue: £{integration.paid_amount} | Costs: £
                          {integration.total_costs}
                        </p>
                      </div>
                      <Badge
                        className={getStatusColor(integration.revenue_status)}
                      >
                        {integration.revenue_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Release Queue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentReleases.slice(0, 5).map((release) => (
                    <div
                      key={release.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">£{release.release_amount}</p>
                        <p className="text-sm text-muted-foreground">
                          Job {release.booking_id.substring(0, 8)}
                        </p>
                      </div>
                      <Badge className={getPaymentStatusColor(release.status)}>
                        {release.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Financial Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">
                        Job {integration.booking_id.substring(0, 8)}
                      </h4>
                      <Badge
                        className={getStatusColor(integration.revenue_status)}
                      >
                        {integration.revenue_status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Quoted</p>
                        <p className="font-medium">
                          £{integration.quoted_amount}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Invoiced</p>
                        <p className="font-medium">
                          £{integration.invoiced_amount}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Paid</p>
                        <p className="font-medium">
                          £{integration.paid_amount}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Profit</p>
                        <p className="font-medium">
                          £{integration.gross_profit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Payment Releases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentReleases.map((release) => (
                  <div key={release.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">£{release.release_amount}</h4>
                      <Badge className={getPaymentStatusColor(release.status)}>
                        {release.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Job Complete</p>
                        <p
                          className={
                            release.job_completion_confirmed
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {release.job_completion_confirmed ? "✓" : "✗"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Quality Check</p>
                        <p
                          className={
                            release.quality_check_passed
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {release.quality_check_passed ? "✓" : "✗"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Costs Recorded</p>
                        <p
                          className={
                            release.all_costs_recorded
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {release.all_costs_recorded ? "✓" : "✗"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Auto Release</p>
                        <p
                          className={
                            release.auto_release_enabled
                              ? "text-green-600"
                              : "text-orange-600"
                          }
                        >
                          {release.auto_release_enabled ? "Enabled" : "Manual"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.map((analytic) => (
                  <div key={analytic.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">
                        {analytic.period_type} Analysis -{" "}
                        {new Date(analytic.analysis_date).toLocaleDateString()}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {analytic.period_start} to {analytic.period_end}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Revenue</p>
                        <p className="font-medium">
                          £{analytic.total_collected.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Costs</p>
                        <p className="font-medium">
                          £{analytic.total_costs.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Gross Profit</p>
                        <p className="font-medium">
                          £{analytic.gross_profit.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Profit Margin</p>
                        <p className="font-medium">
                          {analytic.profit_margin_percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialIntegrationDashboard;
