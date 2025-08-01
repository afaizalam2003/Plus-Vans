import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { FinancialCategory } from "./types/FinancialCategories";

interface FinancialCategoryCardProps {
  category: FinancialCategory;
  onClick: () => void;
}

const FinancialCategoryCard = ({
  category,
  onClick,
}: FinancialCategoryCardProps) => {
  const { title, description, icon: Icon, color, stats } = category;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${color}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-white/70">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">{title}</CardTitle>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        {stats && stats.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {stats.map((stat, index) => (
              <Badge key={index} variant="secondary" className="bg-white/50">
                {stat.label}: {stat.value}
              </Badge>
            ))}
          </div>
        )}

        <div className="pt-2">
          <p className="text-xs text-muted-foreground">
            {category.sections.length} tool
            {category.sections.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialCategoryCard;
