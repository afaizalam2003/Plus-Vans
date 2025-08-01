import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { useItemTypes } from "@/components/hooks/useItemTypes";

const ItemTypesManagement: React.FC = () => {
  const { data: itemTypes, isLoading } = useItemTypes();

  if (isLoading) {
    return <div>Loading item types...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Item Types Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {itemTypes?.map((itemType) => (
            <Card key={itemType.id}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-sm">{itemType.name}</h3>
                    <Badge variant="outline">{itemType.category}</Badge>
                  </div>

                  {itemType.subcategory && (
                    <p className="text-xs text-muted-foreground">
                      {itemType.subcategory}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Weight:</span>
                      <span className="ml-1">{itemType.base_weight_kg}kg</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Volume:</span>
                      <span className="ml-1">{itemType.base_volume_m3}m³</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Disposal:</span>
                      <span className="ml-1">
                        £{itemType.base_disposal_cost}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Labor:</span>
                      <span className="ml-1">
                        {itemType.base_labor_minutes}min
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1 flex-wrap">
                    {itemType.hazardous && (
                      <Badge variant="destructive" className="text-xs">
                        Hazardous
                      </Badge>
                    )}
                    {itemType.requires_dismantling && (
                      <Badge variant="secondary" className="text-xs">
                        Dismantling
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Disposal: {itemType.disposal_method}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemTypesManagement;
