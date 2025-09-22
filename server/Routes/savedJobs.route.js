const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {
  saveJob,
  unsaveJob,
  getMySavedJobs,
} = require("../Controllers/SavedJobController");

router.post("/:jobId", verifyToken, saveJob);
router.delete("/:jobId", verifyToken, unsaveJob);
router.get("/my", verifyToken, getMySavedJobs);

module.exports = router;
