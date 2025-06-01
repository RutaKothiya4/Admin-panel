const fs = require("fs");
const path = require("path");
const User = require("../models/userModel");

const DEFAULT_PROFILE_PHOTO = "default.png";

const makePhotoUrl = (req, filename) =>
  `${req.protocol}://${req.get("host")}/${filename}`;

/* ───────────── generic list by role ───────────── */

const getUsersByRole = (role) => async (req, res) => {
  try {
    const data = await User.find({ role }).select("_id username refreshTokens");
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.admin = getUsersByRole("Super Admin");
exports.manager = getUsersByRole("Manager");
exports.users = getUsersByRole("User");

/* ───────────── profile photo update ───────────── */

exports.updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    /* ---- remove previous custom photo if it exists ---- */
    if (user.profilePhoto && user.profilePhoto !== DEFAULT_PROFILE_PHOTO) {
      const oldAbsPath = path.join(process.cwd(), "uploads", user.profilePhoto);
      if (fs.existsSync(oldAbsPath)) fs.unlinkSync(oldAbsPath);
    }

    /* ---- store new photo with *same* relative-to-uploads path ---- */
    user.profilePhoto = path
      .relative(path.join(process.cwd(), "uploads"), req.file.path)
      .replace(/\\/g, "/"); // keep POSIX style

    await user.save();

    return res.status(200).json({
      message: "Profile photo updated",
      id: user._id,
      username: user.username,
      /* return full URL just like login/register responses */
      profilePhoto: makePhotoUrl(req, user.profilePhoto),
    });
  } catch (err) {
    console.error("Update profile photo error:", err);
    res
      .status(500)
      .json({ message: "Server error updating profile photo", error: err });
  }
};

exports.deleteProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      user.profilePhoto &&
      !user.profilePhoto.endsWith(DEFAULT_PROFILE_PHOTO)
    ) {
      const oldPath = path.join(process.cwd(), user.profilePhoto);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    user.profilePhoto = path
      .join("uploads", DEFAULT_PROFILE_PHOTO)
      .replace(/\\/g, "/");

    await user.save();
    res.status(200).json({
      message: "Profile photo deleted, default set",
      id: user._id,
      username: user.username,
      profilePhoto: user.profilePhoto,
    });
  } catch (err) {
    console.error("Delete profile photo error:", err);
    res.status(500).json({ message: "Error deleting profile photo" });
  }
};