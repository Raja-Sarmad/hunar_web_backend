import { Router } from "express";
import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Booking from "../models/Booking.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/stats", async (_req, res) => {
  try {
    const [pending, approved, bookings, users, requested] = await Promise.all([
      Listing.countDocuments({ status: "pending" }),
      Listing.countDocuments({ status: "approved" }),
      Booking.countDocuments(),
      User.countDocuments({ role: { $ne: "admin" } }),
      Booking.countDocuments({ status: "requested" }),
    ]);
    res.json({ pending, approved, bookings, users, requested });
  } catch (err) {
    res.status(500).json({ message: err.message || "Stats failed." });
  }
});

router.get("/users", async (_req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).sort({
      createdAt: -1,
    });
    res.json({ users: users.map((u) => u.toSafeJSON()) });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load users." });
  }
});

router.post("/users", async (req, res) => {
  try {
    const { name, email, phone = "", password, role = "user" } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password required." });
    }
    if (!["user", "provider"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
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
    res.status(201).json({
      user: user.toSafeJSON(),
      message: "Account created.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Create failed." });
  }
});

router.patch("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "provider"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    );
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message || "Update failed." });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === "admin") {
      return res.status(404).json({ message: "User not found." });
    }
    await user.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message || "Delete failed." });
  }
});

export default router;
