import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Users,
  MessageSquare,
  MapPin,
  TrendingUp,
  Search,
  Calendar,
  Target,
} from "lucide-react";
import {
  useCustomerCommunications,
  useCustomerAddresses,
  useCustomerBehavioralInsights,
  useCustomerJourneyStages,
  useRetentionCampaigns,
  useCustomerIntelligenceAnalysis,
  CustomerCommunication,
} from "@/components/hooks/useCustomerIntelligence";
import CustomerCommunicationPanel from "./CustomerCommunicationPanel";
import CustomerJourneyTracker from "./CustomerJourneyTracker";
import RetentionCampaignManager from "./RetentionCampaignManager";
import CustomerAddressIntelligence from "./CustomerAddressIntelligence";
import CustomerBehavioralAnalytics from "./CustomerBehavioralAnalytics";

const CustomerIntelligenceDashboard: React.FC = () => {
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState("");
  const [intelligenceData, setIntelligenceData] = useState<any>(null);

  const { data: communications = [] } = useCustomerCommunications(
    selectedCustomerEmail
  );
  const { data: addresses = [] } = useCustomerAddresses(selectedCustomerEmail);
  const { data: insights = [] } = useCustomerBehavioralInsights(
    selectedCustomerEmail
  );
  const { data: journeyStages = [] } = useCustomerJourneyStages(
    selectedCustomerEmail
  );
  const { data: campaigns = [] } = useRetentionCampaigns();

  const intelligenceAnalysis = useCustomerIntelligenceAnalysis();

  const handleAnalyzeCustomer = async () => {
    if (!selectedCustomerEmail) return;

    try {
      const result = await intelligenceAnalysis.mutateAsync(
        selectedCustomerEmail
      );
      setIntelligenceData(result);
    } catch (error) {
      console.error("Failed to analyze customer:", error);
    }
  };

  const getChurnRiskColor = (score: number) => {
    if (score < 0.3) return "bg-green-100 text-green-800";
    if (score < 0.7) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getSatisfactionColor = (score: number) => {
    if (score >= 0.8) return "bg-green-100 text-green-800";
    if (score >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Customer Intelligence Dashboard
          </h3>
          <p className="text-muted-foreground">
            Advanced customer relationship management and intelligence analytics
          </p>
        </div>
      </div>

      {/* Customer Search and Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Customer Intelligence Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter customer email to analyze..."
              value={selectedCustomerEmail}
              onChange={(e) => setSelectedCustomerEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleAnalyzeCustomer}
              disabled={
                !selectedCustomerEmail || intelligenceAnalysis.isPending
              }
            >
              {intelligenceAnalysis.isPending
                ? "Analyzing..."
                : "Analyze Customer"}
            </Button>
          </div>

          {intelligenceData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Churn Risk</p>
                <Badge
                  className={getChurnRiskColor(
                    intelligenceData.churn_risk_score
                  )}
                >
                  {(intelligenceData.churn_risk_score * 100).toFixed(1)}%
                </Badge>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Satisfaction</p>
                <Badge
                  className={getSatisfactionColor(
                    intelligenceData.satisfaction_score
                  )}
                >
                  {(intelligenceData.satisfaction_score * 100).toFixed(1)}%
                </Badge>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Lifetime Value</p>
                <Badge variant="outline">
                  £{intelligenceData.customer_lifetime_value.toFixed(2)}
                </Badge>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <Badge variant="outline">
                  {intelligenceData.total_bookings}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Intelligence Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-2 lg:grid-cols-6 gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="journey">Journey Tracking</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral Analysis</TabsTrigger>
          <TabsTrigger value="addresses">Address Intelligence</TabsTrigger>
          <TabsTrigger value="campaigns">Retention Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Communications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{communications.length}</p>
                <p className="text-xs text-muted-foreground">
                  {communications.filter((c: CustomerCommunication) => c.response_required).length}{" "}
                  require response
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Addresses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{addresses.length}</p>
                <p className="text-xs text-muted-foreground">
                  {addresses.filter((a) => a.is_active).length} active addresses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Behavioral Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{insights.length}</p>
                <p className="text-xs text-muted-foreground">
                  Analysis reports available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Active Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {campaigns.filter((c) => c.is_active).length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Retention campaigns running
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="communications">
          <CustomerCommunicationPanel customerEmail={selectedCustomerEmail} />
        </TabsContent>

        <TabsContent value="journey">
          <CustomerJourneyTracker customerEmail={selectedCustomerEmail} />
        </TabsContent>

        <TabsContent value="behavioral">
          <CustomerBehavioralAnalytics customerEmail={selectedCustomerEmail} />
        </TabsContent>

        <TabsContent value="addresses">
          <CustomerAddressIntelligence customerEmail={selectedCustomerEmail} />
        </TabsContent>

        <TabsContent value="campaigns">
          <RetentionCampaignManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerIntelligenceDashboard;
