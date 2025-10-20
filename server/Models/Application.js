const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },

  coverLetter: {
    type: String,
  },
  resume: {
    type: String,
    required: [true, "Please upload your resume"],
  },
  status: {
    type: String,
    enum: ["pending", "reviewed", "interviewed", "offered", "rejected"],
    default: "pending",
  },
  appliedDate: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ApplicationSchema.index({ job: 1, jobSeeker: 1 }, { unique: true });

module.exports = mongoose.model("Application", ApplicationSchema);
