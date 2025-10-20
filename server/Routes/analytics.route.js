const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/verifyToken");
const { getEmployerAnalytics } = require("../Controllers/analyticsController");

router.get("/overview", protect, getEmployerAnalytics);

module.exports = router;
