const jwt = require("jsonwebtoken");
const User = require("../Models/user");

const verifyToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized - no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - invalid token" });
    }

    // Attach userId
    req.userId = decoded.userId;

    // Fetch user role
    const user = await User.findById(decoded.userId).select("role");
    req.role = user?.role;

    next();
  } catch (error) {
    console.error("Error in verifyToken", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { verifyToken };
