import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Star, Award, Shield } from "lucide-react";
import { useMembershipTiers } from "@/components/hooks/useCustomerProfiles";

const MembershipTiersManagement: React.FC = () => {
  const { data: tiers, isLoading } = useMembershipTiers();

  if (isLoading) {
    return <div>Loading membership tiers...</div>;
  }

  const getTierIcon = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case "basic":
        return <Shield className="h-5 w-5" />;
      case "silver":
        return <Star className="h-5 w-5" />;
      case "gold":
        return <Award className="h-5 w-5" />;
      case "platinum":
        return <Crown className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case "basic":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "silver":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "platinum":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="h-5 w-5 mr-2" />
          Membership Tiers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers?.map((tier) => (
            <Card
              key={tier.id}
              className={`border-2 ${getTierColor(tier.tier_name)}`}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    {getTierIcon(tier.tier_name)}
                    <Badge variant="outline">Level {tier.tier_level}</Badge>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold">{tier.tier_name}</h3>
                    <div className="mt-2">
                      <p className="text-2xl font-bold">
                        £{tier.monthly_fee}
                        <span className="text-sm font-normal text-muted-foreground">
                          /month
                        </span>
                      </p>
                      {tier.annual_fee > 0 && (
                        <p className="text-sm text-muted-foreground">
                          £{tier.annual_fee}/year (save{" "}
                          {Math.round(
                            (1 - tier.annual_fee / (tier.monthly_fee * 12)) *
                              100
                          )}
                          %)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Base Discount:</span>
                      <span className="font-medium">
                        {tier.base_discount_percentage}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Free Collections:</span>
                      <span className="font-medium">
                        {tier.free_collections_per_month}/month
                      </span>
                    </div>
                    {tier.priority_booking && (
                      <Badge
                        variant="secondary"
                        className="w-full justify-center"
                      >
                        Priority Booking
                      </Badge>
                    )}
                  </div>

                  {tier.additional_benefits &&
                    Array.isArray(tier.additional_benefits) && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Benefits:</h4>
                        <ul className="text-xs space-y-1">
                          {tier.additional_benefits.map(
                            (benefit: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <span className="text-green-500 mr-1">✓</span>
                                {benefit}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  <Button variant="outline" className="w-full">
                    Edit Tier
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MembershipTiersManagement;
