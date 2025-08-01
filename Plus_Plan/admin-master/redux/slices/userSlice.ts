import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getProfile, login, signup, updateProfile } from "@/services/auth";
import type { UserProfile } from "@/services/types";

interface UserState {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
  role: "customer" | "admin" | "ops" | "support";
}

const initialState: UserState = {
  id: "",
  name: "",
  email: "",
  phone: null,
  role: "customer",
  loading: "idle",
  error: null,
};

export const fetchProfile = createAsyncThunk<UserProfile>(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      return await getProfile();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch profile');
    }
  }
);

export const loginUser = createAsyncThunk<
  UserProfile,
  { username: string; password: string }
>("user/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await login(credentials);
    return await getProfile();
  } catch (error: any) {
    return rejectWithValue(error.message || 'Login failed');
  }
});

export const signupUser = createAsyncThunk<
  UserProfile,
  {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: "customer" | "admin" | "ops" | "support";
  }
>("user/signup", async (userData) => {
  await signup(userData);
  return await getProfile();
});

export const updateUser = createAsyncThunk<
  UserProfile,
  {
    name: string;
    phone: string;
    role: "customer" | "admin" | "ops" | "support";
  }
>("user/update", async (profileData) => {
  return await updateProfile(profileData);
});

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.id = action.payload.id;
        state.name = action.payload.name;
        state.email = action.payload.email;
        state.phone = action.payload.phone;
        state.role = action.payload.role;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message || "Failed to fetch profile";
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.id = action.payload.id;
        state.name = action.payload.name;
        state.email = action.payload.email;
        state.phone = action.payload.phone;
        state.role = action.payload.role;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message || "Login failed";
      })
      .addCase(signupUser.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.id = action.payload.id;
        state.name = action.payload.name;
        state.email = action.payload.email;
        state.phone = action.payload.phone;
        state.role = action.payload.role;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message || "Signup failed";
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.name = action.payload.name;
        state.phone = action.payload.phone;
        state.role = action.payload.role;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message || "Profile update failed";
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
