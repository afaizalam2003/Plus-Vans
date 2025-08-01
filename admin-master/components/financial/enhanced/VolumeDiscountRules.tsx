import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, MapPin, Plus } from "lucide-react";

const VolumeDiscountRules: React.FC = () => {
  // Mock data for now - would use actual hook in real implementation
  const mockRules = [
    {
      id: "1",
      rule_name: "Monthly High Volume",
      customer_profile_type: "trade",
      calculation_period: "monthly",
      volume_thresholds: [
        { min_volume: 50, max_volume: 100, discount: 5 },
        { min_volume: 101, max_volume: 200, discount: 10 },
        { min_volume: 201, discount: 15 },
      ],
      minimum_order_value: 500,
      is_active: true,
    },
    {
      id: "2",
      rule_name: "Annual Enterprise Discount",
      customer_profile_type: "enterprise",
      calculation_period: "annual",
      volume_thresholds: [
        { min_volume: 1000, max_volume: 2500, discount: 15 },
        { min_volume: 2501, max_volume: 5000, discount: 20 },
        { min_volume: 5001, discount: 25 },
      ],
      minimum_order_value: 1000,
      is_active: true,
    },
  ];

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case "monthly":
        return <Clock className="h-4 w-4" />;
      case "quarterly":
        return <Clock className="h-4 w-4" />;
      case "annual":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getProfileTypeColor = (type: string) => {
    switch (type) {
      case "trade":
        return "bg-blue-100 text-blue-800";
      case "premium":
        return "bg-purple-100 text-purple-800";
      case "enterprise":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Volume Discount Automation Rules
          </CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockRules.map((rule) => (
            <Card key={rule.id} className="border">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {rule.rule_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          className={getProfileTypeColor(
                            rule.customer_profile_type
                          )}
                        >
                          {rule.customer_profile_type}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          {getPeriodIcon(rule.calculation_period)}
                          <span className="ml-1 capitalize">
                            {rule.calculation_period}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={rule.is_active ? "default" : "secondary"}>
                      {rule.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Volume Thresholds
                      </h4>
                      <div className="space-y-1">
                        {rule.volume_thresholds.map(
                          (threshold: any, index: number) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm bg-muted p-2 rounded"
                            >
                              <span>
                                {threshold.min_volume} -{" "}
                                {threshold.max_volume || "∞"} m³
                              </span>
                              <Badge variant="secondary">
                                {threshold.discount}% off
                              </Badge>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Rule Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Minimum Order Value:</span>
                          <span className="font-medium">
                            £{rule.minimum_order_value}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Calculation Period:</span>
                          <span className="font-medium capitalize">
                            {rule.calculation_period}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit Rule
                    </Button>
                    <Button variant="ghost" size="sm">
                      View Usage
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

export default VolumeDiscountRules;
