import { createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

// Register new user
export const registerThunk = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      await authService.register(formData);
    } catch (err) {
      // Return error message for rejected action
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Login user and return token + role
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await authService.login(formData);
      console.log("loginData", data);

      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Refresh access token using stored refreshToken/sessionId
export const refreshThunk = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.refresh();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Logout user and clear tokens
export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateProfilePhotoThunk = createAsyncThunk(
  "auth/updateProfilePhoto",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await authService.updateProfilePhoto(formData);
      return data; // Expect updated user object with new profilePhoto URL
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete profile photo thunk
export const deleteProfilePhotoThunk = createAsyncThunk(
  "auth/deleteProfilePhoto",
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.deleteProfilePhoto();
      return data; // Expect updated user object without profilePhoto
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
