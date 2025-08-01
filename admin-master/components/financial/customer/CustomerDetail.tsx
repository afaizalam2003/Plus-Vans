import React from "react";
import { useCustomerDetail } from "@/hooks/useCustomerDetail";
import CustomerDetailContainer from "./detail/CustomerDetailContainer";
import CustomerDetailLoading from "./detail/CustomerDetailLoading";
import CustomerDetailError from "./detail/CustomerDetailError";

interface CustomerDetailProps {
  customerId: string;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customerId }) => {
  const { data: customer, isLoading, error } = useCustomerDetail(customerId);

  if (isLoading) {
    return <CustomerDetailLoading />;
  }

  if (error || !customer) {
    return <CustomerDetailError />;
  }

  return <CustomerDetailContainer customer={customer} />;
};

export default CustomerDetail;
