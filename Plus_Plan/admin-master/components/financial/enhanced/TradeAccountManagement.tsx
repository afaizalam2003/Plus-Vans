import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, TrendingUp, Package, Settings } from "lucide-react";
import { useTradePricingTemplates } from "@/components/hooks/useCustomerProfiles";

const TradeAccountManagement: React.FC = () => {
  const { data: templates, isLoading } = useTradePricingTemplates();

  if (isLoading) {
    return <div>Loading trade pricing templates...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          Trade Account Pricing Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates?.map((template) => (
            <Card key={template.id} className="border">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {template.template_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {template.industry_sector}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {template.base_discount_percentage}% base discount
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Minimum Order
                      </p>
                      <p className="font-medium">
                        £{template.minimum_order_value}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Volume Tiers
                      </p>
                      <p className="font-medium">
                        {Array.isArray(template.volume_pricing_tiers)
                          ? template.volume_pricing_tiers.length
                          : 0}{" "}
                        tiers
                      </p>
                    </div>
                  </div>

                  {template.volume_pricing_tiers &&
                    Array.isArray(template.volume_pricing_tiers) && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Volume Pricing Tiers
                        </h4>
                        <div className="space-y-1">
                          {template.volume_pricing_tiers.map(
                            (tier: any, index: number) => (
                              <div
                                key={index}
                                className="flex justify-between text-sm"
                              >
                                <span>
                                  {tier.min_volume} - {tier.max_volume || "∞"}{" "}
                                  m³
                                </span>
                                <Badge variant="secondary">
                                  {tier.discount}% off
                                </Badge>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {template.item_category_discounts &&
                    Object.keys(template.item_category_discounts).length >
                      0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <Package className="h-4 w-4 mr-1" />
                          Category Discounts
                        </h4>
                        <div className="grid grid-cols-2 gap-1 text-sm">
                          {Object.entries(template.item_category_discounts).map(
                            ([category, discount]: [string, any]) => (
                              <div
                                key={category}
                                className="flex justify-between"
                              >
                                <span className="capitalize">
                                  {category.replace("_", " ")}
                                </span>
                                <span className="font-medium">{discount}%</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      Duplicate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TradeAccountManagement;
