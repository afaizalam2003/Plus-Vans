import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Target, Plus, Calendar, Users, TrendingUp, Mail } from "lucide-react";
import {
  useRetentionCampaigns,
  useCreateRetentionCampaign,
} from "@/components/hooks/useCustomerIntelligence";

const RetentionCampaignManager: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    campaign_name: "",
    campaign_type: "loyalty",
    target_criteria: {},
    message_template: "",
    discount_offer: {},
    start_date: "",
    end_date: "",
    is_active: true,
    success_metrics: {},
  });

  const { data: campaigns = [], isLoading } = useRetentionCampaigns();
  const createCampaign = useCreateRetentionCampaign();

  const handleCreateCampaign = async () => {
    if (
      !newCampaign.campaign_name ||
      !newCampaign.message_template ||
      !newCampaign.start_date
    )
      return;

    try {
      await createCampaign.mutateAsync(newCampaign);

      setIsCreateDialogOpen(false);
      setNewCampaign({
        campaign_name: "",
        campaign_type: "loyalty",
        target_criteria: {},
        message_template: "",
        discount_offer: {},
        start_date: "",
        end_date: "",
        is_active: true,
        success_metrics: {},
      });
    } catch (error) {
      console.error("Failed to create campaign:", error);
    }
  };

  const getCampaignTypeColor = (type: string) => {
    switch (type) {
      case "winback":
        return "bg-red-100 text-red-800";
      case "loyalty":
        return "bg-blue-100 text-blue-800";
      case "referral":
        return "bg-green-100 text-green-800";
      case "upsell":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCampaignIcon = (type: string) => {
    switch (type) {
      case "winback":
        return <TrendingUp className="h-4 w-4" />;
      case "loyalty":
        return <Target className="h-4 w-4" />;
      case "referral":
        return <Users className="h-4 w-4" />;
      case "upsell":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return <div>Loading retention campaigns...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Retention Campaign Manager</h3>
          <p className="text-muted-foreground">
            Create and manage customer retention campaigns
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Retention Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={newCampaign.campaign_name}
                    onChange={(e) =>
                      setNewCampaign({
                        ...newCampaign,
                        campaign_name: e.target.value,
                      })
                    }
                    placeholder="Summer Loyalty Program"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Campaign Type</Label>
                  <Select
                    value={newCampaign.campaign_type}
                    onValueChange={(value) =>
                      setNewCampaign({
                        ...newCampaign,
                        campaign_type: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="winback">Win-back</SelectItem>
                      <SelectItem value="loyalty">Loyalty</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="upsell">Upsell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={newCampaign.start_date}
                    onChange={(e) =>
                      setNewCampaign({
                        ...newCampaign,
                        start_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date (Optional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={newCampaign.end_date}
                    onChange={(e) =>
                      setNewCampaign({
                        ...newCampaign,
                        end_date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message Template</Label>
                <Textarea
                  id="message"
                  value={newCampaign.message_template}
                  onChange={(e) =>
                    setNewCampaign({
                      ...newCampaign,
                      message_template: e.target.value,
                    })
                  }
                  placeholder="Hi {{customer_name}}, we miss you! Here's a special offer..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCampaign}
                  disabled={
                    !newCampaign.campaign_name ||
                    !newCampaign.message_template ||
                    !newCampaign.start_date ||
                    createCampaign.isPending
                  }
                >
                  {createCampaign.isPending ? "Creating..." : "Create Campaign"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  {getCampaignIcon(campaign.campaign_type)}
                  {campaign.campaign_name}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge
                    className={getCampaignTypeColor(campaign.campaign_type)}
                  >
                    {campaign.campaign_type}
                  </Badge>
                  <Badge variant={campaign.is_active ? "default" : "secondary"}>
                    {campaign.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Campaign Details</h4>
                  <div className="text-sm">
                    <p>
                      <span className="text-muted-foreground">Start Date:</span>{" "}
                      {new Date(campaign.start_date).toLocaleDateString()}
                    </p>
                    {campaign.end_date && (
                      <p>
                        <span className="text-muted-foreground">End Date:</span>{" "}
                        {new Date(campaign.end_date).toLocaleDateString()}
                      </p>
                    )}
                    <p>
                      <span className="text-muted-foreground">Created:</span>{" "}
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Message Preview</h4>
                  <p className="text-sm text-muted-foreground">
                    {campaign.message_template.substring(0, 100)}
                    {campaign.message_template.length > 100 && "..."}
                  </p>
                </div>
              </div>

              {Object.keys(campaign.discount_offer).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Discount Offer</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(campaign.discount_offer).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="text-center p-2 bg-muted rounded"
                        >
                          <p className="text-xs text-muted-foreground">{key}</p>
                          <p className="text-sm font-medium">{String(value)}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {Object.keys(campaign.success_metrics).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Success Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(campaign.success_metrics).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="text-center p-2 bg-muted rounded"
                        >
                          <p className="text-xs text-muted-foreground">
                            {key.replace("_", " ")}
                          </p>
                          <p className="text-sm font-medium">{String(value)}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Campaign ID: {campaign.id.substring(0, 8)}...
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit Campaign
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Retention Campaigns</h3>
            <p className="text-muted-foreground mb-4">
              Create your first retention campaign to engage customers and
              improve loyalty.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Campaign
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RetentionCampaignManager;
