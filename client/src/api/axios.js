import axios from "axios";
import store from "../app/store";
import { logout } from "../features/auth/authSlice";
import { refreshThunk } from "../features/auth/authThunks";

// Create a custom axios instance with default config
const API = axios.create({
  baseURL: "http://localhost:5000/api", // Change this to your production URL if needed
  withCredentials: true, // Needed for cookie-based auth
});

// Add access token to request headers before sending any request
API.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh token logic control
let refreshing = false;
let subscribers = [];

function onRefreshed(token) {
  subscribers.forEach((callback) => callback(token));
  subscribers = [];
}

function addSubscriber(callback) {
  subscribers.push(callback);
}

// Response interceptor to handle 401 errors and token refresh
API.interceptors.response.use(
  (response) => response, // Return response if no error
  async (error) => {
    const original = error.config;

    // If token expired and we haven't retried yet
    if (
      error.response?.status === 401 &&
      !original._retry &&
      localStorage.getItem("refreshToken")
    ) {
      original._retry = true;

      if (refreshing) {
        // If refresh already in progress, queue the request
        return new Promise((resolve, reject) => {
          addSubscriber((token) => {
            original.headers.Authorization = "Bearer " + token;
            resolve(API(original));
          });
        });
      }
      
      refreshing = true;
      try {
        // Dispatch refresh token thunk
        const data = await store.dispatch(refreshThunk()).unwrap();

        // Update Authorization header for queued requests
        onRefreshed(data.accessToken);

        refreshing = false;

        // Retry the original failed request with new token
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return API(original);
      } catch (err) {
        refreshing = false;

        // If refresh also fails, logout user
        store.dispatch(logout());
        window.location.href = "/"; // Redirect to login
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
