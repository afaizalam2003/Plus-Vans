import React from "react";
import AdminPageLayout from "@/components/admin/AdminPageLayout";

const CustomerDetailError: React.FC = () => {
  return (
    <AdminPageLayout
      title="Customer Not Found"
      description="The requested customer could not be found"
    >
      <div className="text-center py-8">
        <p className="text-destructive mb-4">Failed to load customer details</p>
        <p className="text-muted-foreground">
          Please check the customer ID and try again.
        </p>
      </div>
    </AdminPageLayout>
  );
};

export default CustomerDetailError;
