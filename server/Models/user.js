const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["jobseeker", "employer", "admin"],
    default: "jobseeker",
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  companyName: {
    type: String,
    required: function () {
      return this.role === "employer";
    },
  },
  industry: {
    type: String,
    required: function () {
      return this.role === "employer";
    },
  },
  companySize: {
    type: String,
    required: function () {
      return this.role === "employer";
    },
  },
  location: {
    type: String,
    required: function () {
      return this.role === "employer";
    },
  },
  description: {
    type: String,
    required: function () {
      return this.role === "employer";
    },
  },
  avatar: {
    type: String,
    default: "default-avatar.jpg",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
  verificationToken: String,
  verificationTokenExpiresAt: Date,
});

module.exports = mongoose.model("user", userSchema);
