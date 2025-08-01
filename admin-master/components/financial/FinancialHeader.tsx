import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FinancialHeaderProps {
  onCreateQuote: () => void;
}

const FinancialHeader: React.FC<FinancialHeaderProps> = ({ onCreateQuote }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Financial Management</h2>
        <p className="text-muted-foreground">
          Manage quotes, invoices, payments, and dynamic pricing
        </p>
      </div>
      <Button onClick={onCreateQuote}>
        <Plus className="h-4 w-4 mr-2" />
        Create Quote
      </Button>
    </div>
  );
};

export default FinancialHeader;
