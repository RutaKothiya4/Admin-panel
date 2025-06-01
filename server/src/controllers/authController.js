/* eslint-disable consistent-return */
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const User = require("../models/userModel");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/tokenUtils");

const DEFAULT_PROFILE_PHOTO = "/default.png"; // relative path inside uploads folder
const makePhotoUrl = (req, filename) =>
  `${req.protocol}://${req.get("host")}/${filename}`;

/* ────────────────────────── helpers ────────────────────────── */

const pruneInvalidTokens = (user) => {
  user.refreshTokens = user.refreshTokens.filter((t) => t.valid);
};

const hashPasswordSHA256 = (
  password,
  salt = crypto.randomBytes(16).toString("hex")
) => ({
  salt,
  hash: crypto.pbkdf2Sync(password, salt, 10_000, 64, "sha256").toString("hex"),
});

/* ────────────────────────── register ───────────────────────── */

exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password)
      return res
        .status(400)
        .json({ message: "Username and password are required" });

    if (await User.findOne({ username }))
      return res.status(400).json({ message: "User already exists" });

    const profilePhotoPath = req.file
      ? path
          .relative(path.join(process.cwd(), "uploads"), req.file.path)
          .replace(/\\/g, "/")
      : DEFAULT_PROFILE_PHOTO;

    const { hash, salt } = hashPasswordSHA256(password);

    const newUser = await User.create({
      username,
      password: hash,
      salt,
      role: role || "User",
      profilePhoto: profilePhotoPath,
    });

    const safeUser = {
      id: newUser._id,
      username: newUser.username,
      name: newUser.username,
      role: newUser.role,
      profilePhoto: makePhotoUrl(req, newUser.profilePhoto),
    };

    return res.status(201).json({
      message: `User registered successfully: ${username}`,
      safeUser,
    });
  } catch (err) {
    if (err.code === "LIMIT_FILE_SIZE")
      return res.status(400).json({ message: "File size exceeds 2 MB" });

    console.error("Register error:", err);
    return res
      .status(500)
      .json({ message: "Server error during registration" });
  }
};

/* ─────────────────────────── login ─────────────────────────── */

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const { hash } = hashPasswordSHA256(password, user.salt);
    if (hash !== user.password)
      return res.status(400).json({ message: "Invalid credentials" });

    pruneInvalidTokens(user);

    const sessionId = uuidv4();
    const refreshToken = generateRefreshToken();

    user.refreshTokens.push({
      token: refreshToken,
      valid: true,
      sessionId,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    await user.save();

    // pick only safe fields to send to the client
    const safeUser = {
      id: user._id,
      username: user.username,
      role: user.role,
      profilePhoto: makePhotoUrl(req, user.profilePhoto),
    };

    const sessions = user.refreshTokens.map(
      ({ sessionId, ipAddress, userAgent, expiresAt }) => ({
        sessionId,
        ipAddress,
        userAgent,
        expiresAt,
      })
    );

    return res.status(200).json({
      accessToken: generateAccessToken(user),
      refreshToken,
      sessionId,
      sessions,
      user: safeUser,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: `Login failed: ${err.message}` });
  }
};

/* ─────────────────────── refresh token ─────────────────────── */

exports.refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken, sessionId, ipAddress, userAgent } = req.body;
    if (!refreshToken || !sessionId || !ipAddress || !userAgent)
      return res.status(400).json({ message: "Missing required fields" });

    const user = await User.findOne({ "refreshTokens.token": refreshToken });
    if (!user) return res.status(404).json({ message: "User not found" });

    const tokenObj = user.refreshTokens.find(
      (t) => t.token === refreshToken && t.sessionId === sessionId
    );
    if (!tokenObj || !tokenObj.valid)
      return res.status(403).json({ message: "Invalid or expired session" });

    if (Date.now() > new Date(tokenObj.expiresAt))
      return res.status(403).json({ message: "Refresh token expired" });

    if (tokenObj.ipAddress !== ipAddress || tokenObj.userAgent !== userAgent)
      return res.status(403).json({ message: "Session hijacking detected" });

    pruneInvalidTokens(user);
    await user.save();

    return res.status(200).json({ accessToken: generateAccessToken(user) });
  } catch (err) {
    console.error("Refresh token error:", err);
    return res
      .status(500)
      .json({ message: `Token refresh failed: ${err.message}` });
  }
};

/* ─────────────────────────── logout ────────────────────────── */

exports.logout = async (req, res) => {
  try {
    const { refreshToken, sessionId } = req.body;
    if (!refreshToken || !sessionId)
      return res
        .status(400)
        .json({ message: "Refresh token and session ID are required" });

    const user = await User.findOne({ "refreshTokens.token": refreshToken });
    if (!user)
      return res
        .status(404)
        .json({ message: "Session not found or already logged out" });

    const tokenObj = user.refreshTokens.find(
      (t) => t.token === refreshToken && t.sessionId === sessionId
    );
    if (!tokenObj)
      return res.status(403).json({ message: "Invalid refresh token" });

    tokenObj.valid = false;
    pruneInvalidTokens(user);
    await user.save();

    return res.status(200).json({
      message: "Logged out successfully",
      sessions: user.refreshTokens,
    });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Error while logging out", err });
  }
};

/* ────────────────── revoke & delete helpers ────────────────── */

exports.revokeSession = async (req, res) => {
  try {
    const { userId, sessionId } = req.body;
    if (!userId || !sessionId)
      return res
        .status(400)
        .json({ message: "User ID and session ID are required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const idx = user.refreshTokens.findIndex((t) => t.sessionId === sessionId);
    if (idx === -1)
      return res.status(404).json({ message: "Session not found" });

    user.refreshTokens.splice(idx, 1);
    pruneInvalidTokens(user);
    await user.save();

    return res.status(200).json({
      message: "Session revoked successfully",
      sessions: user.refreshTokens,
    });
  } catch (err) {
    console.error("Revoke session error:", err);
    return res.status(500).json({ message: "Error revoking session", err });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    return res.status(500).json({ message: "Server error deleting user" });
  }
};
