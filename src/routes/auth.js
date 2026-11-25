import { Router } from "express";
import User from "../models/User.js";
import { signToken } from "../utils/auth.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone = "", password, role = "user" } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Name, email and password required." });
    }
    if (!["user", "provider"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: "Email already registered." });
    }
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: String(phone).trim(),
      password,
      role,
    });
    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message || "Signup failed." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required." });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message || "Login failed." });
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

router.patch("/me", requireAuth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (name !== undefined) req.user.name = String(name).trim();
    if (phone !== undefined) req.user.phone = String(phone).trim();
    await req.user.save();
    res.json({ user: req.user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message || "Update failed." });
  }
});

export default router;
