import API from "../../api/axios";

// Register user (no return data expected)
const register = async (formData) => {
  await API.post("/auth/register", formData);
};

// Login user and persist tokens + role
const login = async (formData) => {
  const res = await API.post("/auth/login", formData);
  const { accessToken, refreshToken, sessionId, user } = res.data;

  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("sessionId", sessionId);
  localStorage.setItem("user", JSON.stringify(user));

  // Extract role from JWT payload
  const [, payload] = accessToken.split(".");
  const { role } = JSON.parse(atob(payload));
  localStorage.setItem("userRole", role);

  return { accessToken, role, user };
};

// Refresh access token using refresh token and session ID
const refresh = async () => {
  const res = await API.post("/auth/refresh", {
    refreshToken: localStorage.getItem("refreshToken"),
    sessionId: localStorage.getItem("sessionId"),
    ipAddress: "::1", // Typically populated by server via req.ip
    userAgent: navigator.userAgent,
  });

  const { accessToken } = res.data;
  localStorage.setItem("accessToken", accessToken);
  return { accessToken };
};

// Logout user and clear local storage
const logout = async () => {
  await API.post("/auth/logout", {
    refreshToken: localStorage.getItem("refreshToken"),
    sessionId: localStorage.getItem("sessionId"),
  });
  localStorage.clear(); // remove all stored tokens/session
};

const updateProfilePhoto = async (formData) => {
  const userStr = localStorage.getItem("user");
  if (!userStr) throw new Error("User not found in localStorage");
  const user = JSON.parse(userStr);
  console.log("authService", user);

  const res = await API.put(`/users/${user.id}/profilePhoto`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

const deleteProfilePhoto = async () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) throw new Error("User not found in localStorage");
  const user = JSON.parse(userStr);

  const res = await API.delete(`/users/${user.id}/profilePhoto`);
  return res.data;
};

const authService = {
  register,
  login,
  refresh,
  logout,
  updateProfilePhoto,
  deleteProfilePhoto,
};
export default authService;
