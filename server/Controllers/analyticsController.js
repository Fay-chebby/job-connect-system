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
            job: { $in: job // <-- The rest of the query 
        });
        
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch analytics", error: err.message });
  }
};
