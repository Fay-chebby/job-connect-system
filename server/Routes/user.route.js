const express = require("express");
const { verifyToken } = require("../middleware/verifyToken");
const {
  updateProfile,
  deleteResume,
  getPublicProfile,
} = require("../controllers/userController");

const router = express.Router();

// Update user profile
router.put("/profile", verifyToken, updateProfile);

// Delete user resume
router.delete("/resume", verifyToken, deleteResume);

// Public Routes

// Get a user public profile
router.get("/:id", getPublicProfile);

module.exports = router;
