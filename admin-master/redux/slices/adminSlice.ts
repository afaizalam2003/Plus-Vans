import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  listBookings,
  listComplianceRegulations,
  getEstimationRules,
  updateEstimationRule as updateRule,
  updateComplianceRegulation as updateRegulation,
  deleteComplianceRegulation as deleteRegulation,
  deleteEstimationRule as deleteRule,
  getAllPayments,
  getAuditLogs,
  createEstimationRule,
  createEstimationRulesBulk,
  getEstimationRule,
  getPayment,
  updatePaymentStatus,
  updateBooking,
  deleteBookingById,
  getDashboardStats,
  UserListParams,
  getAllUsers,
  getUser,
  UserCreateData,
  UserUpdateData,
  createUser,
  updateUser,
  deleteUser,
} from "@/services/admin";
import type {
  Booking,
  ComplianceRegulation,
  EstimationRule,
  StripePayment,
  AdminAuditLog,
  UserProfile,
  DashboardStats,
  EstimationRuleListParams,
} from "@/services/types";

interface AdminState {
  bookings: Booking[];
  compliance: ComplianceRegulation[];
  estimationRules: EstimationRule[];
  payments: StripePayment[];
  auditLogs: AdminAuditLog[];
  dashboardStats: DashboardStats | null;
  users: UserProfile[];
  user: UserProfile | null;
  loading: {
    bookings: "idle" | "pending" | "succeeded" | "failed";
    compliance: "idle" | "pending" | "succeeded" | "failed";
    estimationRules: "idle" | "pending" | "succeeded" | "failed";
    estimationRuleCreate: "idle" | "pending" | "succeeded" | "failed";
    estimationRuleUpdate: "idle" | "pending" | "succeeded" | "failed";
    estimationRuleDelete: "idle" | "pending" | "succeeded" | "failed";
    estimationRuleBulkCreate: "idle" | "pending" | "succeeded" | "failed";
    payments: "idle" | "pending" | "succeeded" | "failed";
    auditLogs: "idle" | "pending" | "succeeded" | "failed";
    bookingEdit: "idle" | "pending" | "succeeded" | "failed";
    bookingDelete: "idle" | "pending" | "succeeded" | "failed";
    dashboardStats: "idle" | "pending" | "succeeded" | "failed";
    calendar: "idle" | "pending" | "succeeded" | "failed";
    kanban: "idle" | "pending" | "succeeded" | "failed";
    users: "idle" | "pending" | "succeeded" | "failed";
    userCreate: "idle" | "pending" | "succeeded" | "failed";
    userUpdate: "idle" | "pending" | "succeeded" | "failed";
    userDelete: "idle" | "pending" | "succeeded" | "failed";
  };
  error: {
    bookings: string | null;
    compliance: string | null;
    estimationRules: string | null;
    estimationRuleCreate: string | null;
    estimationRuleUpdate: string | null;
    estimationRuleDelete: string | null;
    estimationRuleBulkCreate: string | null;
    payments: string | null;
    auditLogs: string | null;
    bookingEdit: string | null;
    bookingDelete: string | null;
    dashboardStats: string | null;
    calendar: string | null;
    kanban: string | null;
    users: string | null;
    userCreate: string | null;
    userUpdate: string | null;
    userDelete: string | null;
  };
}

const initialState: AdminState = {
  bookings: [],
  compliance: [],
  estimationRules: [],
  payments: [],
  auditLogs: [],
  dashboardStats: null,
  users: [],
  user: null,
  loading: {
    bookings: "idle",
    compliance: "idle",
    estimationRules: "idle",
    estimationRuleCreate: "idle",
    estimationRuleUpdate: "idle",
    estimationRuleDelete: "idle",
    estimationRuleBulkCreate: "idle",
    payments: "idle",
    auditLogs: "idle",
    bookingEdit: "idle",
    bookingDelete: "idle",
    dashboardStats: "idle",
    calendar: "idle",
    kanban: "idle",
    users: "idle",
    userCreate: "idle",
    userUpdate: "idle",
    userDelete: "idle",
  },
  error: {
    bookings: null,
    compliance: null,
    estimationRules: null,
    estimationRuleCreate: null,
    estimationRuleUpdate: null,
    estimationRuleDelete: null,
    estimationRuleBulkCreate: null,
    payments: null,
    auditLogs: null,
    bookingEdit: null,
    bookingDelete: null,
    dashboardStats: null,
    calendar: null,
    kanban: null,
    users: null,
    userCreate: null,
    userUpdate: null,
    userDelete: null,
  },
};

export const fetchBookings = createAsyncThunk<Booking[], { status?: string }>(
  "admin/fetchBookings",
  async (filters) => {
    return await listBookings(filters.status);
  }
);

export const fetchComplianceRegulations = createAsyncThunk<
  ComplianceRegulation[],
  { region?: string; status?: string }
>("admin/fetchComplianceRegulations", async (filters) => {
  return await listComplianceRegulations();
});

export const fetchEstimationRules = createAsyncThunk<
  EstimationRule[],
  EstimationRuleListParams | undefined
>("admin/fetchEstimationRules", async (params = {}) => {
  return await getEstimationRules(params);
});

export const createNewEstimationRule = createAsyncThunk<
  EstimationRule,
  Omit<EstimationRule, "id" | "created_at" | "updated_at">
>("admin/createEstimationRule", async (rule) => {
  return await createEstimationRule(rule);
});

export const createBulkEstimationRules = createAsyncThunk<
  EstimationRule[],
  Omit<EstimationRule, "id" | "created_at" | "updated_at">[]
>("admin/createBulkEstimationRules", async (rules) => {
  return await createEstimationRulesBulk(rules);
});

export const fetchSingleEstimationRule = createAsyncThunk<
  EstimationRule,
  string
>("admin/fetchSingleEstimationRule", async (ruleId) => {
  return await getEstimationRule(ruleId);
});

export const updateEstimationRule = createAsyncThunk<
  EstimationRule,
  {
    ruleId: string;
    ruleData: Partial<EstimationRule>;
  }
>("admin/updateEstimationRule", async ({ ruleId, ruleData }) => {
  return await updateRule(ruleId, ruleData);
});

export const updateComplianceRegulation = createAsyncThunk<
  ComplianceRegulation,
  {
    regulationId: string;
    regulationData: Partial<ComplianceRegulation>;
  }
>(
  "admin/updateComplianceRegulation",
  async ({ regulationId, regulationData }) => {
    return await updateRegulation(regulationId, regulationData);
  }
);

export const fetchPayments = createAsyncThunk<
  StripePayment[],
  { skip?: number; limit?: number }
>("admin/fetchPayments", async (params) => {
  return await getAllPayments(params);
});

export const fetchSinglePayment = createAsyncThunk<StripePayment, string>(
  "admin/fetchSinglePayment",
  async (paymentId) => {
    return await getPayment(paymentId);
  }
);

export const updatePayment = createAsyncThunk<
  StripePayment,
  { paymentId: string; status: string }
>("admin/updatePayment", async ({ paymentId, status }) => {
  return await updatePaymentStatus(paymentId, status);
});

export const fetchAuditLogs = createAsyncThunk<AdminAuditLog[]>(
  "admin/fetchAuditLogs",
  async () => {
    return await getAuditLogs();
  }
);

export const fetchDashboardStats = createAsyncThunk<
  DashboardStats,
  { period?: "day" | "week" | "month" | "year" }
>("admin/fetchDashboardStats", async (params = { period: "year" }) => {
  const response = await getDashboardStats(params);
  return response as DashboardStats;
});

export const updateBookingThunk = createAsyncThunk<
  Booking,
  { bookingId: string; bookingData: Partial<Booking> }
>("admin/updateBooking", async ({ bookingId, bookingData }) => {
  return await updateBooking(bookingId, bookingData);
});

export const deleteBooking = createAsyncThunk<string, string>(
  "admin/deleteBooking",
  async (bookingId) => {
    await deleteBookingById(bookingId);
    return bookingId;
  }
);

export const deleteEstimationRule = createAsyncThunk<string, string>(
  "admin/deleteEstimationRule",
  async (ruleId) => {
    await deleteRule(ruleId);
    return ruleId;
  }
);

export const deleteComplianceRegulation = createAsyncThunk<string, string>(
  "admin/deleteComplianceRegulation",
  async (regulationId) => {
    await deleteRegulation(regulationId);
    return regulationId;
  }
);

export const fetchUsers = createAsyncThunk<UserProfile[], UserListParams>(
  "admin/fetchUsers",
  async (params) => {
    return await getAllUsers(params);
  }
);

export const fetchSingleUser = createAsyncThunk<UserProfile, string>(
  "admin/fetchSingleUser",
  async (userId) => {
    return await getUser(userId);
  }
);

export const createUserThunk = createAsyncThunk<UserProfile, UserCreateData>(
  "admin/createUser",
  async (userData) => {
    return await createUser(userData);
  }
);

export const updateUserThunk = createAsyncThunk<
  UserProfile,
  { userId: string; userData: UserUpdateData }
>("admin/updateUser", async ({ userId, userData }) => {
  return await updateUser(userId, userData);
});

export const deleteUserThunk = createAsyncThunk<{ message: string }, string>(
  "admin/deleteUser",
  async (userId) => {
    return await deleteUser(userId);
  }
);

export const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Bookings
      .addCase(fetchBookings.pending, (state) => {
        state.loading.bookings = "pending";
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading.bookings = "succeeded";
        state.bookings = action.payload;
        state.error.bookings = null;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading.bookings = "failed";
        state.error.bookings =
          action.error.message || "Failed to fetch bookings";
      })
      // Compliance
      .addCase(fetchComplianceRegulations.pending, (state) => {
        state.loading.compliance = "pending";
      })
      .addCase(fetchComplianceRegulations.fulfilled, (state, action) => {
        state.loading.compliance = "succeeded";
        state.compliance = action.payload;
        state.error.compliance = null;
      })
      .addCase(fetchComplianceRegulations.rejected, (state, action) => {
        state.loading.compliance = "failed";
        state.error.compliance =
          action.error.message || "Failed to fetch compliance regulations";
      })
      // Estimation Rules - Fetch
      .addCase(fetchEstimationRules.pending, (state) => {
        state.loading.estimationRules = "pending";
      })
      .addCase(fetchEstimationRules.fulfilled, (state, action) => {
        state.loading.estimationRules = "succeeded";
        state.estimationRules = action.payload;
        state.error.estimationRules = null;
      })
      .addCase(fetchEstimationRules.rejected, (state, action) => {
        state.loading.estimationRules = "failed";
        state.error.estimationRules =
          action.error.message || "Failed to fetch estimation rules";
      })
      // Estimation Rules - Create
      .addCase(createNewEstimationRule.pending, (state) => {
        state.loading.estimationRuleCreate = "pending";
        state.error.estimationRuleCreate = null;
      })
      .addCase(createNewEstimationRule.fulfilled, (state, action) => {
        state.loading.estimationRuleCreate = "succeeded";
        state.estimationRules.push(action.payload);
        state.error.estimationRuleCreate = null;
      })
      .addCase(createNewEstimationRule.rejected, (state, action) => {
        state.loading.estimationRuleCreate = "failed";
        state.error.estimationRuleCreate =
          action.error.message || "Failed to create estimation rule";
      })
      // Estimation Rules - Update
      .addCase(updateEstimationRule.pending, (state) => {
        state.loading.estimationRuleUpdate = "pending";
        state.error.estimationRuleUpdate = null;
      })
      .addCase(updateEstimationRule.fulfilled, (state, action) => {
        state.loading.estimationRuleUpdate = "succeeded";
        state.estimationRules = state.estimationRules.map((rule) =>
          rule.id === action.payload.id ? action.payload : rule
        );
        state.error.estimationRuleUpdate = null;
      })
      .addCase(updateEstimationRule.rejected, (state, action) => {
        state.loading.estimationRuleUpdate = "failed";
        state.error.estimationRuleUpdate =
          action.error.message || "Failed to update estimation rule";
      })
      // Estimation Rules - Delete
      .addCase(deleteEstimationRule.pending, (state) => {
        state.loading.estimationRuleDelete = "pending";
        state.error.estimationRuleDelete = null;
      })
      .addCase(deleteEstimationRule.fulfilled, (state, action) => {
        state.loading.estimationRuleDelete = "succeeded";
        state.estimationRules = state.estimationRules.filter(
          (rule) => rule.id !== action.payload
        );
        state.error.estimationRuleDelete = null;
      })
      .addCase(deleteEstimationRule.rejected, (state, action) => {
        state.loading.estimationRuleDelete = "failed";
        state.error.estimationRuleDelete =
          action.error.message || "Failed to delete estimation rule";
      })
      // Estimation Rules - Bulk Create
      .addCase(createBulkEstimationRules.pending, (state) => {
        state.loading.estimationRuleBulkCreate = "pending";
        state.error.estimationRuleBulkCreate = null;
      })
      .addCase(createBulkEstimationRules.fulfilled, (state, action) => {
        state.loading.estimationRuleBulkCreate = "succeeded";
        state.estimationRules = [...state.estimationRules, ...action.payload];
        state.error.estimationRuleBulkCreate = null;
      })
      .addCase(createBulkEstimationRules.rejected, (state, action) => {
        state.loading.estimationRuleBulkCreate = "failed";
        state.error.estimationRuleBulkCreate =
          action.error.message || "Failed to bulk create estimation rules";
      })
      // Payments
      .addCase(fetchPayments.pending, (state) => {
        state.loading.payments = "pending";
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading.payments = "succeeded";
        state.payments = action.payload;
        state.error.payments = null;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading.payments = "failed";
        state.error.payments =
          action.error.message || "Failed to fetch payments";
      })
      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading.dashboardStats = "pending";
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading.dashboardStats = "succeeded";
        state.dashboardStats = action.payload;
        state.error.dashboardStats = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading.dashboardStats = "failed";
        state.error.dashboardStats =
          action.error.message || "Failed to fetch dashboard statistics";
      })
      // Audit Logs
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading.auditLogs = "pending";
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading.auditLogs = "succeeded";
        state.auditLogs = action.payload;
        state.error.auditLogs = null;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading.auditLogs = "failed";
        state.error.auditLogs =
          action.error.message || "Failed to fetch audit logs";
      })
      // Update Booking
      .addCase(updateBookingThunk.pending, (state) => {
        state.loading.bookingEdit = "pending";
        state.error.bookingEdit = null;
      })
      .addCase(updateBookingThunk.fulfilled, (state, action) => {
        state.loading.bookingEdit = "succeeded";
        state.error.bookingEdit = null;
        state.bookings = state.bookings.map((booking) =>
          booking.id === action.payload.id ? action.payload : booking
        );
      })
      .addCase(updateBookingThunk.rejected, (state, action) => {
        state.loading.bookingEdit = "failed";
        state.error.bookingEdit =
          action.error.message || "Failed to update booking";
      })
      // Delete Booking
      .addCase(deleteBooking.pending, (state) => {
        state.loading.bookingDelete = "pending";
        state.error.bookingDelete = null;
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.loading.bookingDelete = "succeeded";
        state.error.bookingDelete = null;
        state.bookings = state.bookings.filter(
          (booking) => booking.id !== action.payload
        );
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.loading.bookingDelete = "failed";
        state.error.bookingDelete =
          action.error.message || "Failed to delete booking";
      })
      // Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading.users = "pending";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading.users = "succeeded";
        state.users = action.payload;
        state.error.users = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading.users = "failed";
        state.error.users = action.error.message || "Failed to fetch users";
      })
      .addCase(createUserThunk.pending, (state) => {
        state.loading.userCreate = "pending";
        state.error.userCreate = null;
      })
      .addCase(createUserThunk.fulfilled, (state, action) => {
        state.loading.userCreate = "succeeded";
        state.error.userCreate = null;
        state.users = [...state.users, action.payload];
      })
      .addCase(createUserThunk.rejected, (state, action) => {
        state.loading.userCreate = "failed";
        state.error.userCreate =
          action.error.message || "Failed to create user";
      })
      .addCase(updateUserThunk.pending, (state) => {
        state.loading.userUpdate = "pending";
        state.error.userUpdate = null;
      })
      .addCase(updateUserThunk.fulfilled, (state, action) => {
        state.loading.userUpdate = "succeeded";
        state.error.userUpdate = null;
        state.users = state.users.map((user) =>
          user.id === action.payload.id ? action.payload : user
        );
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.loading.userUpdate = "failed";
        state.error.userUpdate =
          action.error.message || "Failed to update user";
      })
      .addCase(deleteUserThunk.pending, (state) => {
        state.loading.userDelete = "pending";
        state.error.userDelete = null;
      })
      .addCase(deleteUserThunk.fulfilled, (state, action) => {
        state.loading.userDelete = "succeeded";
        state.error.userDelete = null;
        state.users = state.users.filter((user) => user.id !== action.meta.arg);
      })
      .addCase(deleteUserThunk.rejected, (state, action) => {
        state.loading.userDelete = "failed";
        state.error.userDelete =
          action.error.message || "Failed to delete user";
      });
  },
});

export default adminSlice.reducer;
