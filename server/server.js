const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const authRoutes = require("./Routes/auth.route");
const userRoute = require("./Routes/user.route");
const jobsRoute = require("./Routes/jobs.route ");
const applicationRoutes = require("./Routes/application.route");

// load env
dotenv.config();

// Initialize app
const app = express();
//connect DB
connectDB();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoute);
app.use("/api/jobs", jobsRoute);
app.use("/api/application", applicationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
module.exports = app;
