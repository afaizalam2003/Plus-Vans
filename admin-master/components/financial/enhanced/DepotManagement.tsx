import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Truck } from "lucide-react";
import { useDepots } from "@/components/hooks/useDepts";

const DepotManagement: React.FC = () => {
  const { data: depots, isLoading } = useDepots();

  if (isLoading) {
    return <div>Loading depots...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Depot Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {depots?.map((depot) => (
            <Card key={depot.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{depot.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {depot.service_radius_km}km radius
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>{depot.address}</p>
                    <p className="font-medium">{depot.postcode}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{depot.staff_capacity} staff</span>
                    </div>
                    <div className="flex items-center">
                      <Truck className="h-3 w-3 mr-1" />
                      <span>Multi-vehicle</span>
                    </div>
                  </div>

                  {depot.latitude && depot.longitude && (
                    <div className="text-xs text-muted-foreground">
                      <p>
                        Lat: {depot.latitude}, Lng: {depot.longitude}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Badge variant={depot.is_active ? "default" : "secondary"}>
                      {depot.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Clock className="h-4 w-4 text-muted-foreground" />
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

export default DepotManagement;
