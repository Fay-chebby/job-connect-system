const express = require("express");
const {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  getApplicationById,
  updateStatus,
} = require("../controllers/applicationController");
const { verifyToken } = require("../middleware/verifyToken");

const router = express.Router();

router.post("/:jobId", verifyToken, applyToJob);
router.get("/my", verifyToken, getMyApplications);
router.get("/job/:jobId", verifyToken, getApplicantsForJob);
router.get("/:id", verifyToken, getApplicationById);
router.put("/:id/status", verifyToken, updateStatus);

module.exports = router;
