const express = require("express");
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  toggleCloseJob,
  getJobsEmployer,
} = require("../controllers/jobController");

// Use verifyToken instead of protect
const { verifyToken } = require("../middleware/verifyToken");

const router = express.Router();

// Routes
router
  .route("/")
  .post(verifyToken, createJob) // Create job (only logged in employer/admin)
  .get(getJobs); // Public: Get all jobs

router.route("/get-jobs-employer").get(verifyToken, getJobsEmployer); // Logged-in employer: Get jobs they posted

router
  .route("/:id")
  .get(getJobById) // Public: Get single job by ID
  .put(verifyToken, updateJob) // Logged-in employer/admin: Update job
  .delete(verifyToken, deleteJob); // Logged-in employer/admin: Delete job

router.put("/:id/toggle-close", verifyToken, toggleCloseJob); // Employer: Close/Open job

module.exports = router;
