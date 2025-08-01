"use client";

import { useEffect, useState } from "react";
import { UserProfile } from "@/services/types";
import UsersPage from "../../users/page";

// A very thin wrapper around the existing UsersPage component that
// automatically shows only customers by enforcing the role filter.
export default function CustomersPage() {
  // We leverage UsersPage but pre-set its `statusFilter` state to customer-specific values.
  // Since UsersPage doesn't expose props, we simply reuse the component and
  // rely on UsersPage's built-in UI/filters. Business logic for customers and
  // users is the same for now.
  return <UsersPage roleFilter="customer" />;
}
