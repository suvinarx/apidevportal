// routes/auth.js
const express = require("express");
const User = require("../models/User");
const generateToken = require("../utils/jwt");
const router = express.Router();

// Register
// routes/auth.js (Register route)
// Register
router.post("/register", async (req, res) => {
  const { email, password, role, adminCode } = req.body;
  try {
    // Convert email to lowercase for case-insensitive matching
    const normalizedEmail = email.toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ message: "User already exists" });

    // Require a secret or invite for admin signups
    if (role === "admin") {
      if (!process.env.ADMIN_SIGNUP_CODE) {
        return res.status(500).json({ message: "Admin registration not configured" });
      }
      if (adminCode !== process.env.ADMIN_SIGNUP_CODE) {
        return res.status(403).json({ message: "Invalid admin invite code" });
      }
    }

    const user = new User({ email: normalizedEmail, password, role: role === "admin" ? "admin" : "user" });
    await user.save();

    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Convert email to lowercase for case-insensitive matching
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
