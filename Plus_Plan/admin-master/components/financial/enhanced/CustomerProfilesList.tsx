import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Mail, Phone, Building } from "lucide-react";
import { useCustomerProfiles } from "@/components/hooks/useCustomerProfiles";

const CustomerProfilesList: React.FC = () => {
  const { data: profiles, isLoading } = useCustomerProfiles();

  if (isLoading) {
    return <div>Loading customer profiles...</div>;
  }

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
        <CardTitle className="flex items-center">
          <Building className="h-5 w-5 mr-2" />
          Customer Pricing Profiles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles?.map((profile) => (
            <Card key={profile.id} className="border">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{profile.profile_name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Mail className="h-3 w-3 mr-1" />
                        <span>{profile.customer_email}</span>
                      </div>
                    </div>
                    <Badge
                      className={getProfileTypeColor(profile.profile_type)}
                    >
                      {profile.profile_type}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Discount</p>
                      <p className="font-medium">
                        {profile.discount_percentage}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Membership</p>
                      <p className="font-medium">{profile.membership_tier}</p>
                    </div>
                  </div>

                  {profile.annual_volume_commitment > 0 && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Annual Commitment</p>
                      <p className="font-medium">
                        £{profile.annual_volume_commitment}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Badge
                      variant={profile.is_active ? "default" : "secondary"}
                    >
                      {profile.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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

export default CustomerProfilesList;
