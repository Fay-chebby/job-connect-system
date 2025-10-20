const fs = require("fs");
const path = require("path");
const User = require("../Models/user");

// Update user profile

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const {
      name,
      avatar,
      resume,
      companyName,
      companyDescription,
      companyLogo,
    } = req.body;

    // Update basic user info
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (resume) user.resume = resume;

    // If user is employer, allow updating company details
    if (user.role === "employer") {
      if (companyName) user.companyName = companyName;
      if (companyDescription) user.companyDescription = companyDescription;
      if (companyLogo) user.companyLogo = companyLogo;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      companyName: user.companyName,
      companyDescription: user.companyDescription,
      companyLogo: user.companyLogo,
      resume: user.resume || "",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete resume

exports.deleteResume = async (req, res) => {
  try {
    const { resumeUrl } = req.body; // Expect frontend to send the resume URL

    // Extract file name from the URL
    const fileName = resumeUrl.split("/").pop();

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "jobseeker") {
      return res
        .status(403)
        .json({ message: "Only jobseekers can delete resume" });
    }

    // Construct full path to the file
    const filePath = path.join(__dirname, "../uploads", fileName);

    // Check if file exists and delete it
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Delete the file
    }

    // Remove resume reference from user profile
    user.resume = "";
    await user.save();

    res.json({ message: "Resume deleted successfully" });
  } catch (err) {
    console.error("Error deleting resume:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get Public Profile

exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // exclude password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
