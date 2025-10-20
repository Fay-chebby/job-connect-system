const Job = require("../Models/job");
const User = require("../Models/user");
const Application = require("../Models/Application");
const SavedJob = require("../Models/SavedJob");
const job = require("../Models/job");
const { application } = require("express");

exports.createJob = async (req, res) => {
  try {
    if (req.role !== "employer") {
      return res.status(403).json({ message: "Only employers can post jobs" });
    }

    const job = await Job.create({
      ...req.body,
      company: req.userId, // employer’s id
    });

    res.status(201).json(job);
  } catch (err) {
    console.error("Error creating job:", err);
    res.status(500).json({ message: err.message });
  }
};
exports.getJobs = async (req, res) => {
  const {
    keyword,
    location,
    category,
    jobType,
    experienceLevel,
    minSalary,
    maxSalary,
    datePosted,
    tags,
    userId,
  } = req.query;

  const query = {
    status: "open",
    ...(keyword && { title: { $regex: keyword, $options: "i" } }),
    ...(location && { location: { $regex: location, $options: "i" } }),
    ...(category && { category }),
    ...(jobType && { jobType }),
    ...(experienceLevel && { experienceLevel }),
    ...(tags && { skills: { $in: tags.split(",") } }),
  };

  if (datePosted) {
    const now = new Date();
    const dateMap = {
      hour: new Date(now - 60 * 60 * 1000),
      day: new Date(now - 24 * 60 * 60 * 1000),
      week: new Date(now - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now - 30 * 24 * 60 * 60 * 1000),
    };
    if (dateMap[datePosted]) {
      query.createdAt = { $gte: dateMap[datePosted] };
    }
  }
  if (minSalary || maxSalary) {
    query.$and = [];

    if (minSalary) {
      query.$and.push({ salaryMax: { $gte: Number(minSalary) } });
    }
    if (maxSalary) {
      query.$and.push({ salaryMin: { $lte: Number(maxSalary) } });
    }
    if (query.$and.length === 0) {
      delete query.$and;
    }
  }

  try {
    const jobs = await Job.find(query).populate(
      "company",
      "name companyName companyLogo"
    );

    let savedJobIds = [];
    let appliedJobStatusMap = {};

    if (userId) {
      // Saved Jobs
      const savedJobs = await SavedJob.find({ jobseeker: userId }).select(
        "job"
      );
      savedJobIds = savedJobs.map((s) => String(s.job));

      // Applications
      const applications = await Application.find({ applicant: userId }).select(
        "job status"
      );
      applications.forEach((app) => {
        appliedJobStatusMap[String(app.job)] = app.status;
      });
    }
    const jobsWithExtras = jobs.map((job) => {
      const jobIdStr = String(job._id);
      return {
        ...job.toObject(),
        isSaved: savedJobs.includes(jobIdStr),
        applicationStatus: appliedJobStatusMap[jobIdStr] || null,
      };
    });

    res.json(jobsWithExtras);
  } catch (err) {
    res.status(500).json({ msg: "error message" });
  }
};

exports.getJobsEmployer = async (req, res) => {
  try {
    const userId = req.user._id;
    const { role } = req.user;
    if (role !== "employer") {
      return res.status(403).json({ message: "Access denied" });
    }
    // get all jobs by employer
    const jobs = await Job.find({ company: userId })
      .populate("company", "name companyName companyLogo")
      .lean();

    const jobsWithApplicationCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({
          job: job._id,
        });
        return {
          ...job,
          applicationCount,
        };
      })
    );

    res.json(jobsWithApplicationCounts);
  } catch (error) {
    res.status(500).json({ message: err.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const { userId } = req.query;
    const job = await Job.findById(req.params.id).populate(
      "company",
      "name companyName companyLogo"
    );
    if (!job) {
      return res.status(400).json({ message: "Job not found" });
    }
    let applicationStatus = null;
    if (userId) {
      const applicant = await Application.findOne({
        job: job._id,
        applicant: userId,
      }).select("status");
      if (applicant) {
        applicationStatus = applicationStatus;
      }
    }
    res.json({
      ...job.toObject(),
      applicationStatus,
    });
  } catch (error) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.compay.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: " Not authorized to update this job" });
    }
    Object.assign(job, req.body);
    const update = await job.save();
    res.json(update);
  } catch (error) {
    res.status(500).json({ message: err.message });
  }
};
// delete job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.compay.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: " Not authorized to delete this job" });
    }
    await job.deleteOne();
    res.json({ message: "Job Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: err.message });
  }
};
// toggle close status for job employer
exports.toggleCloseJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.compay.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: " Not authorized to close this job" });
    }

    job.isClosed = !job.isClosed;
    await job.save();
    res.json({ message: "Job marked as closed" });
  } catch (error) {
    res.status(500).json({ message: err.message });
  }
};
