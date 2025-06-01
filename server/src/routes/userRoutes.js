const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");
const authorizeRoutes = require("../middlewares/roleMiddleware");
const checkPermissions = require("../middlewares/permissionMiddleware");
const {
  admin,
  manager,
  users,
  updateProfilePhoto,
  deleteProfilePhoto,
} = require("../controllers/userController");
const upload = require("../middlewares/upload");

const router = express.Router();

// Update profile photo
router.put(
  "/:id/profilePhoto",
  upload.single("profilePhoto"),
  updateProfilePhoto
);

// Delete profile photo
router.delete("/:id/profilePhoto", deleteProfilePhoto);

// optional
// Route accessible only by users with 'view_Home' permission
router.get(
  "/view-Home",
  verifyToken, // Verify JWT token (authentication)
  checkPermissions("view_Home"), // Check if user has 'view_Home' permission
  (req, res) => {
    res.json({ message: "Home data for users with 'view_Home' permission" });
  }
);

// Route accessible only by Super Admin role
router.get(
  "/admin",
  verifyToken, // Verify JWT token
  authorizeRoutes("Super Admin"), // Authorize only Super Admin role
  admin // Controller function to get admin users
);

// Route accessible by Super Admin and Manager roles
router.get(
  "/manager",
  verifyToken, // Verify JWT token
  authorizeRoutes("Super Admin", "Manager"), // Authorize Super Admin & Manager roles
  manager // Controller function to get managers
);

// Route accessible by Super Admin and Manager roles (likely meant for all users?
// If truly "all", consider removing role restriction)
router.get(
  "/user",
  verifyToken, // Verify JWT token
  authorizeRoutes("Super Admin", "Manager"), // Authorize Super Admin & Manager roles
  users // Controller function to get normal users
);

module.exports = router;
