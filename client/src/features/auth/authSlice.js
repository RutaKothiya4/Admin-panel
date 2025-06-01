import { createSlice } from "@reduxjs/toolkit";
import {
  loginThunk,
  registerThunk,
  refreshThunk,
  logoutThunk,
  updateProfilePhotoThunk,
  deleteProfilePhotoThunk,
} from "./authThunks";

// Load initial auth state from localStorage
const accessToken = localStorage.getItem("accessToken") || null;
const userRole = localStorage.getItem("userRole") || null;

let userFromStorage = null;
try {
  const storedUser = localStorage.getItem("user");
  if (storedUser) userFromStorage = JSON.parse(storedUser);
} catch (e) {
  console.error("Error parsing user from localStorage", e);
}

const initialState = {
  accessToken,
  role: userRole,
  user: userFromStorage,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Local logout: clear state and localStorage
    logout: (state) => {
      state.accessToken = null;
      state.role = null;
      state.user = null;
      localStorage.clear();
    },
  },
  extraReducers: (builder) => {
    // Common loading state
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };

    // Common error handler
    const rejected = (state, { payload }) => {
      state.loading = false;
      state.error = payload || "Something went wrong";
    };

    builder
      // Handle pending states
      .addCase(loginThunk.pending, pending)
      .addCase(registerThunk.pending, pending)
      .addCase(refreshThunk.pending, pending)
      .addCase(logoutThunk.pending, pending)

      // Handle fulfilled states
      .addCase(loginThunk.fulfilled, (state, { payload }) => {
        console.log("login(slice)", payload);

        state.loading = false;
        state.accessToken = payload.accessToken;
        state.role = payload.user?.role || "User";
        state.user = payload.user || null;

        // Save to localStorage
        if (payload.accessToken)
          localStorage.setItem("accessToken", payload.accessToken);
        if (payload.user)
          localStorage.setItem("user", JSON.stringify(payload.user));
        if (payload.user?.role)
          localStorage.setItem("userRole", payload.user.role);
      })

      .addCase(updateProfilePhotoThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
        localStorage.setItem("user", JSON.stringify(payload));
      })

      .addCase(deleteProfilePhotoThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
        localStorage.setItem("user", JSON.stringify(payload));
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(refreshThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.accessToken = payload.accessToken;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.loading = false;
        state.accessToken = null;
        state.role = null;
      })

      // Handle any rejected case
      .addMatcher((action) => action.type.endsWith("rejected"), rejected);
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
