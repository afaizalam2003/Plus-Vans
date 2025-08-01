import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign } from "lucide-react";
import { getFinancialCategories } from "./types/FinancialCategories";

interface FinancialDashboardHeaderProps {
  currentCategory: string | null;
  onBack: () => void;
  onBackToCategories: () => void;
}

const FinancialDashboardHeader = ({
  currentCategory,
  onBack,
  onBackToCategories,
}: FinancialDashboardHeaderProps) => {
  // Don't show header for main dashboard view
  if (!currentCategory) {
    return null;
  }

  const categories = getFinancialCategories();
  const category = categories.find((c) => c.id === currentCategory);

  if (currentCategory && category) {
    // Category view
    const Icon = category.icon;
    return (
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onBackToCategories}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{category.title}</h1>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default FinancialDashboardHeader;
