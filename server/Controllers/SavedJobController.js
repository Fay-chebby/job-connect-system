const SavedJob = require("../Models/SavedJob");

// Save a job
exports.saveJob = async (req, res) => {
  try {
    const exists = await SavedJob.findOne({
      job: req.params.jobId,
      jobseeker: req.user._id,
    });
    if (exists) return res.status(400).json({ message: "Job already saved" });

    const saved = await SavedJob.create({
      job: req.params.jobId,
      jobseeker: req.user._id,
    });
    res.status(201).json({ saved });
  } catch (err) {
    res.status(500).json({ message: "Failed to save job", error: err.message });
  }
};

//  Unsave a job
exports.unsaveJob = async (req, res) => {
  try {
    await SavedJob.findOneAndDelete({
      job: req.params.jobId,
      jobseeker: req.user._id,
    });
    res.json({ message: " Failed to remove saved jobs", error: err.message });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete job", error: err.message });
  }
};

//  Get saved jobs for current user
exports.getMySavedJobs = async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ jobseeker: req.user._id }).populate(
      {
        path: "job",
        populate: {
          path: "company",
          select: "name companyName companyLogo",
        },
      }
    );

    res.json(savedJobs);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to  getsaved job", error: err.message });
  }
};
