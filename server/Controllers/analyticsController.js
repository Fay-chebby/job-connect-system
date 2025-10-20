const Job = require("../Models/job");
const Application = require("../Models/Application");

const getTrend = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

exports.getEmployerAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const companyId = req.user.id;

    const now = new Date();
    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 7);
    const prev7Days = new Date(now);
    prev7Days.setDate(now.getDate() - 14);

    // COUNTS
    const totalActiveJobs = await Job.countDocuments({
      company: companyId,
      isClosed: false,
    });
    const jobIds = await Job.find({ company: companyId }).select("_id").lean();
    const jobs = jobIds.map((job) => job._id);

    const totalApplications = await Application.countDocuments({
      job: { $in: jobs },
    });
    const totalHired = await Application.countDocuments({
      job: { $in: jobs },
      status: "Accepted",
    });
    // Active Job Posts trend
    const activeJobsLast7 = await Job.countDocuments({
      company: companyId,
      createdAt: { $gte: last7Days, $lte: now },
    });

    const activeJobsPrev7 = await Job.countDocuments({
      company: companyId,
      createdAt: { $gte: prev7Days, $lt: last7Days },
    });

    const activeJobTrend = getTrend(activeJobsLast7, activeJobsPrev7);

    // Applications trend
    const applicationsLast7 = await Application.countDocuments({
      job: { $in: jobIds },
      createdAt: { $gte: last7Days, $lte: now }, // <-- Completed the date query
    });

    const applicationsPrev7 = await Application.countDocuments({
      job: { $in: jobIds },
      createdAt: { $gte: prev7Days, $lt: last7Days },
    });

    const applicantTrend = getTrend(applicationsLast7, applicationsPrev7);

    // Hired Applicants trend
    const hiredLast7 = await Application.countDocuments({
      job: { $in: jobIds },
      status: "Accepted",
      createdAt: { $gte: last7days, $lte: now },
    });

    // Hired in the previous 7 days (7-14 days ago)
    const hiredPrev7 = await Application.countDocuments({
      job: { $in: jobIds },
      status: "Accepted",
      createdAt: { $gte: prev7days, $lt: last7days },
    });

    // Calculate the trend
    const hiredTrend = getTrend(hiredLast7, hiredPrev7);

    // --- DATA ---

    // Fetch recent jobs (5 of them)
    const recentJobs = await Job.find({ company: companyId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title location type createdAt isClosed");

    // Fetch recent applications (5 of them)
    const recentApplications = await Application.find({
      job: { $in: jobIds },
    })
      .sort({ createdAt: -1 }) // Assuming you want the most recent
      .limit(5)
      .populate("job", "title") // Populate the job title for display
      .populate("user", "firstName lastName email avatar"); // Populate user details

    // Construct the response object
    res.json({
      counts: {
        totalActiveJobs,

        totalApplications,

        totalHired,
      },

      trends: {
        activeJobTrend,

        totalApplicants: applicantTrend,

        totalHired: hiredTrend,
      },

      data: {
        recentJobs,

        recentApplications,
      },
    });

    res.status(200).json({ success: true, analytics });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch analytics", error: err.message });
  }
};
