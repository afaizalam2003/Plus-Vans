import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck } from "lucide-react";
import { useLoadSizeConfigs } from "@/components/hooks/useItemTypes";

const LoadSizeManagement: React.FC = () => {
  const { data: loadConfigs, isLoading } = useLoadSizeConfigs();

  if (isLoading) {
    return <div>Loading load configurations...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Truck className="h-5 w-5 mr-2" />
          Load Size Configurations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loadConfigs?.map((config) => (
            <Card key={config.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{config.display_name}</h3>
                    <Badge variant="outline">{config.size_name}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Max Volume:</span>
                      <span className="ml-1 font-medium">
                        {config.max_volume_m3}m³
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Max Weight:</span>
                      <span className="ml-1 font-medium">
                        {config.max_weight_kg}kg
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Base Price:</span>
                      <span className="ml-1 font-medium">
                        £{config.base_price}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="ml-1 font-medium">
                        {config.estimated_duration_hours}h
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vehicle:</span>
                    <span className="font-medium">
                      {config.vehicle_type.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Crew Size:</span>
                    <span className="font-medium">
                      {config.crew_size} person{config.crew_size > 1 ? "s" : ""}
                    </span>
                  </div>

                  {(config.london_congestion_charge > 0 ||
                    config.ulez_charge > 0) && (
                    <div className="border-t pt-2">
                      <p className="text-xs text-muted-foreground mb-1">
                        London Charges:
                      </p>
                      <div className="flex justify-between text-xs">
                        {config.london_congestion_charge > 0 && (
                          <span>
                            Congestion: £{config.london_congestion_charge}
                          </span>
                        )}
                        {config.ulez_charge > 0 && (
                          <span>ULEZ: £{config.ulez_charge}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadSizeManagement;
