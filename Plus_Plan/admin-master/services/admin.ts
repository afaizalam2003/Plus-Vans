import { AxiosResponse } from "axios";
import http from "./http-common";
import {
  Booking,
  ComplianceRegulation,
  AdminAuditLog,
  EstimationRule,
  StripePayment,
  UserProfile,
} from "./types";

// Booking Management
export const listBookings = async (
  statusFilter?: string
): Promise<Booking[]> => {
  try {
    const params = statusFilter ? { status_filter: statusFilter } : {};
    const response = await http.get<Booking[]>("/admin/bookings", { params });
    return response.data;
  } catch (error) {
    console.error("Error listing bookings:", error);
    throw error;
  }
};

export const getBooking = async (bookingId: string): Promise<Booking> => {
  try {
    const response = await http.get<Booking>(`/admin/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting booking ${bookingId}:`, error);
    throw error;
  }
};

export const updateBooking = async (
  bookingId: string,
  updateData: Partial<Booking>
): Promise<Booking> => {
  try {
    const response = await http.put<Booking>(
      `/admin/bookings/${bookingId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating booking ${bookingId}:`, error);
    throw error;
  }
};

export const deleteBookingById = async (bookingId: string): Promise<void> => {
  try {
    await http.delete(`/admin/bookings/${bookingId}`);
  } catch (error) {
    console.error(`Error deleting booking ${bookingId}:`, error);
    throw error;
  }
};

// Compliance Management
export const listComplianceRegulations = async (): Promise<
  ComplianceRegulation[]
> => {
  try {
    const response = await http.get<ComplianceRegulation[]>("/admin/compliance");
    return response.data;
  } catch (error) {
    console.error("Error listing compliance regulations:", error);
    throw error;
  }
};

export const addComplianceRegulation = async (
  regulation: Omit<ComplianceRegulation, "id" | "created_at" | "updated_at">
): Promise<ComplianceRegulation> => {
  const response = await http.post<ComplianceRegulation>(
    "/admin/compliance",
    regulation
  );
  return response.data;
};

export const updateComplianceRegulation = async (
  regulationId: string,
  regulationData: Partial<ComplianceRegulation>
): Promise<ComplianceRegulation> => {
  const response = await http.put<ComplianceRegulation>(
    `/admin/compliance/${regulationId}`,
    regulationData
  );
  return response.data;
};

export const deleteComplianceRegulation = async (
  regulationId: string
): Promise<void> => {
  await http.delete(`/admin/compliance/${regulationId}`);
};

// Audit Logs
export const getAuditLogs = async (): Promise<AdminAuditLog[]> => {
  const response = await http.get<AdminAuditLog[]>("/admin/audit-logs");
  return response.data;
};

// Estimation Rules
export interface EstimationRuleListParams {
  skip?: number;
  limit?: number;
  status?: "active" | "inactive";
  rule_type?: string;
  search?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
  date_from?: string;
  date_to?: string;
}

/**
 * Creates a new estimation rule
 *
 * @param rule - Estimation rule data without id and timestamps
 * @returns Created estimation rule
 */
export const createEstimationRule = async (
  rule: Omit<EstimationRule, "id" | "created_at" | "updated_at">
): Promise<EstimationRule> => {
  try {
    const response = await http.post<EstimationRule>(
      "/admin/estimation-rules",
      rule
    );
    return response.data;
  } catch (error) {
    console.error("Error creating estimation rule:", error);
    throw error;
  }
};

/**
 * Bulk creates multiple estimation rules
 *
 * @param rules - Array of estimation rule data without ids and timestamps
 * @returns Array of created estimation rules
 */
export const createEstimationRulesBulk = async (
  rules: Omit<EstimationRule, "id" | "created_at" | "updated_at">[]
): Promise<EstimationRule[]> => {
  try {
    const response = await http.post<EstimationRule[]>(
      "/admin/estimation-rules/bulk",
      rules
    );
    return response.data;
  } catch (error) {
    console.error("Error bulk creating estimation rules:", error);
    throw error;
  }
};

/**
 * Fetches estimation rules with optional filtering and pagination
 *
 * @param params - Optional parameters for filtering and pagination
 * @returns List of estimation rules
 */
export const getEstimationRules = async (
  params: EstimationRuleListParams = {}
): Promise<EstimationRule[]> => {
  try {
    const response = await http.get<EstimationRule[]>(
      "/admin/estimation-rules",
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching estimation rules:", error);
    throw error;
  }
};

/**
 * Fetches a specific estimation rule by ID
 *
 * @param ruleId - ID of the estimation rule to fetch
 * @returns Estimation rule data
 */
export const getEstimationRule = async (
  ruleId: string
): Promise<EstimationRule> => {
  try {
    const response = await http.get<EstimationRule>(
      `/admin/estimation-rules/${ruleId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching estimation rule ${ruleId}:`, error);
    throw error;
  }
};

/**
 * Updates an existing estimation rule
 *
 * @param ruleId - ID of the estimation rule to update
 * @param ruleUpdate - Partial rule data to update
 * @returns Updated estimation rule
 */
export const updateEstimationRule = async (
  ruleId: string,
  ruleUpdate: Partial<EstimationRule>
): Promise<EstimationRule> => {
  try {
    const response = await http.put<EstimationRule>(
      `/admin/estimation-rules/${ruleId}`,
      ruleUpdate
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating estimation rule ${ruleId}:`, error);
    throw error;
  }
};

/**
 * Toggles the active status of an estimation rule
 *
 * @param ruleId - ID of the estimation rule to toggle
 * @param active - New active status
 * @returns Updated estimation rule
 */
export const toggleEstimationRuleStatus = async (
  ruleId: string,
  active: boolean
): Promise<EstimationRule> => {
  try {
    const response = await http.patch<EstimationRule>(
      `/admin/estimation-rules/${ruleId}/toggle-status`,
      { active }
    );
    return response.data;
  } catch (error) {
    console.error(`Error toggling status for rule ${ruleId}:`, error);
    throw error;
  }
};

/**
 * Deletes an estimation rule
 *
 * @param ruleId - ID of the estimation rule to delete
 * @returns Void
 */
export const deleteEstimationRule = async (ruleId: string): Promise<void> => {
  try {
    await http.delete(`/admin/estimation-rules/${ruleId}`);
  } catch (error) {
    console.error(`Error deleting estimation rule ${ruleId}:`, error);
    throw error;
  }
};

// Payment Management
export interface PaymentListParams {
  skip?: number;
  limit?: number;
}

export const getAllPayments = async (
  params: PaymentListParams = {}
): Promise<StripePayment[]> => {
  const response = await http.get<StripePayment[]>("/admin/payments", {
    params,
  });
  return response.data;
};

export const getPayment = async (paymentId: string): Promise<StripePayment> => {
  const response = await http.get<StripePayment>(
    `/admin/payments/${paymentId}`
  );
  return response.data;
};

export const updatePaymentStatus = async (
  paymentId: string,
  status: string
): Promise<StripePayment> => {
  const response = await http.put<StripePayment>(
    `/admin/payments/${paymentId}/status`,
    { status }
  );
  return response.data;
};

export interface DashboardStatsParams {
  period?: "day" | "week" | "month" | "year";
}

/**
 * Fetches dashboard statistics for admin overview
 *
 * @param params - Parameters for the dashboard stats request
 * @returns Dashboard statistics formatted for recharts
 */
export const getDashboardStats = async (
  params: DashboardStatsParams = { period: "year" }
): Promise<Record<string, any>> => {
  const response = await http.get<Record<string, any>>(
    "/admin/dashboard/stats",
    {
      params,
    }
  );
  return response.data;
};

/**
 * Interface for user list parameters
 */
export interface UserListParams {
  skip?: number;
  limit?: number;
}

/**
 * Interface for user creation data
 */
export interface UserCreateData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "customer" | "admin" | "ops" | "support";
}

/**
 * Interface for user update data
 */
export interface UserUpdateData {
  name?: string;
  phone?: string;
  role?: "customer" | "admin" | "ops" | "support";
}

/**
 * Fetches all users with optional pagination
 *
 * @param params - Pagination parameters
 * @returns List of user profiles
 */
export const getAllUsers = async (
  params: UserListParams = {}
): Promise<UserProfile[]> => {
  const response = await http.get<UserProfile[]>("/admin/users", {
    params,
  });
  return response.data;
};

/**
 * Fetches a specific user by ID
 *
 * @param userId - ID of the user to fetch
 * @returns User profile data
 */
export const getUser = async (userId: string): Promise<UserProfile> => {
  const response = await http.get<UserProfile>(`/admin/users/${userId}`);
  return response.data;
};

/**
 * Creates a new user
 *
 * @param userData - User creation data including name, email, and password
 * @returns Created user profile
 */
export const createUser = async (
  userData: UserCreateData
): Promise<UserProfile> => {
  const response = await http.post<UserProfile>("/admin/users", userData);
  return response.data;
};

/**
 * Updates an existing user
 *
 * @param userId - ID of the user to update
 * @param userData - User data to update
 * @returns Updated user profile
 */
export const updateUser = async (
  userId: string,
  userData: UserUpdateData
): Promise<UserProfile> => {
  const response = await http.put<UserProfile>(
    `/admin/users/${userId}`,
    userData
  );
  return response.data;
};

/**
 * Deletes a user
 *
 * @param userId - ID of the user to delete
 * @returns Success message
 */
export const deleteUser = async (
  userId: string
): Promise<{ message: string }> => {
  const response = await http.delete<{ message: string }>(
    `/admin/users/${userId}`
  );
  return response.data;
};
