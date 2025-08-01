import React from "react";
import FinancialCategoryCard from "./FinancialCategoryCard";
import { getFinancialCategories } from "./types/FinancialCategories";

interface FinancialCategoryGridProps {
  onCategorySelect: (categoryId: string) => void;
  stats?: any;
}

const FinancialCategoryGrid = ({
  onCategorySelect,
  stats,
}: FinancialCategoryGridProps) => {
  const categories = getFinancialCategories(stats);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <FinancialCategoryCard
          key={category.id}
          category={category}
          onClick={() => onCategorySelect(category.id)}
        />
      ))}
    </div>
  );
};

export default FinancialCategoryGrid;
