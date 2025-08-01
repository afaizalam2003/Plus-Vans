import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Home, Building, Clock, Star } from "lucide-react";
import { useCustomerAddresses, CustomerAddress } from "@/components/hooks/useCustomerIntelligence";

interface CustomerAddressIntelligenceProps {
  customerEmail?: string;
}

const CustomerAddressIntelligence: React.FC<
  CustomerAddressIntelligenceProps
> = ({ customerEmail }) => {
  const { data: addresses = [], isLoading } =
    useCustomerAddresses(customerEmail);

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case "primary":
        return <Home className="h-4 w-4" />;
      case "work":
        return <Building className="h-4 w-4" />;
      case "secondary":
        return <MapPin className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getAddressTypeColor = (type: string) => {
    switch (type) {
      case "primary":
        return "bg-blue-100 text-blue-800";
      case "work":
        return "bg-purple-100 text-purple-800";
      case "secondary":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const renderStars = (score: number) => {
    const stars = Math.round(score * 5);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  if (isLoading) {
    return <div>Loading address intelligence...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Address Intelligence</h3>
        <p className="text-muted-foreground">
          Customer address history and collection insights
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {addresses.map((address: CustomerAddress) => (
          <Card key={address.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  {getAddressTypeIcon(address.address_type)}
                  {address.address}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge className={getAddressTypeColor(address.address_type)}>
                    {address.address_type}
                  </Badge>
                  <Badge variant={address.is_active ? "default" : "secondary"}>
                    {address.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Address Details</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-muted-foreground">Postcode:</span>{" "}
                      {address.postcode}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Customer:</span>{" "}
                      {address.customer_email}
                    </p>
                    {address.longitude && address.latitude && (
                      <p>
                        <span className="text-muted-foreground">
                          Coordinates:
                        </span>{" "}
                        {address.latitude.toFixed(6)},{" "}
                        {address.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Usage Statistics</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-muted-foreground">
                        Usage Frequency:
                      </span>{" "}
                      {address.usage_frequency} times
                    </p>
                    {address.last_used_date && (
                      <p>
                        <span className="text-muted-foreground">
                          Last Used:
                        </span>{" "}
                        {new Date(address.last_used_date).toLocaleDateString()}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        Quality Score:
                      </span>
                      <div className="flex items-center gap-1">
                        {renderStars(address.address_quality_score)}
                        <span
                          className={`text-sm font-medium ${getQualityScoreColor(
                            address.address_quality_score
                          )}`}
                        >
                          {(address.address_quality_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {(address.access_notes ||
                address.parking_info ||
                address.collection_instructions) && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">
                    Collection Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {address.access_notes && (
                      <div>
                        <p className="text-muted-foreground font-medium">
                          Access Notes:
                        </p>
                        <p>{address.access_notes}</p>
                      </div>
                    )}
                    {address.parking_info && (
                      <div>
                        <p className="text-muted-foreground font-medium">
                          Parking Info:
                        </p>
                        <p>{address.parking_info}</p>
                      </div>
                    )}
                    {address.collection_instructions && (
                      <div>
                        <p className="text-muted-foreground font-medium">
                          Collection Instructions:
                        </p>
                        <p>{address.collection_instructions}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Added {new Date(address.created_at).toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  ID: {address.id.substring(0, 8)}...
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {addresses.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Address Data</h3>
            <p className="text-muted-foreground">
              {customerEmail
                ? `No address information found for ${customerEmail}`
                : "Enter a customer email to view their address intelligence."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerAddressIntelligence;
