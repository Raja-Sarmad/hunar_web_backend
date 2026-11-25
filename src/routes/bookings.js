import { Router } from "express";
import Booking from "../models/Booking.js";
import Listing from "../models/Listing.js";
import { optionalAuth, requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "admin") {
      // all
    } else if (req.user.role === "provider") {
      filter.provider = req.user._id;
    } else {
      filter.$or = [
        { customer: req.user._id },
        { customerEmail: req.user.email },
      ];
    }
    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.json({ bookings: bookings.map((b) => b.toPublic()) });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load bookings." });
  }
});

router.post("/", optionalAuth, async (req, res) => {
  try {
    const { serviceId, listingId, name, phone, date, note, email } = req.body;
    const id = listingId || serviceId;
    if (!id || !name?.trim() || !phone?.trim() || !date || !note?.trim()) {
      return res.status(400).json({ message: "Please fill in every field." });
    }

    const listing = await Listing.findById(id);
    if (!listing || listing.status !== "approved") {
      return res.status(404).json({ message: "Service not available." });
    }

    const booking = await Booking.create({
      listing: listing._id,
      serviceTitle: listing.title,
      provider: listing.provider,
      providerName: listing.providerName,
      customer: req.user?._id || null,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerEmail: (email || req.user?.email || "").trim(),
      date,
      note: note.trim(),
      status: "requested",
    });

    res.status(201).json({
      booking: booking.toPublic(),
      message:
        "Your booking request was sent. The provider will contact you to confirm details.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Booking failed." });
  }
});

router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["requested", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    const isProvider =
      booking.provider.toString() === req.user._id.toString();
    const isCustomer =
      (booking.customer &&
        booking.customer.toString() === req.user._id.toString()) ||
      booking.customerEmail === req.user.email;
    const isAdmin = req.user.role === "admin";

    if (isAdmin) {
      // full control
    } else if (isProvider) {
      // ok
    } else if (isCustomer && status === "cancelled") {
      // customers can cancel
    } else {
      return res.status(403).json({ message: "Not allowed." });
    }

    booking.status = status;
    await booking.save();
    res.json({ booking: booking.toPublic() });
  } catch (err) {
    res.status(500).json({ message: err.message || "Update failed." });
  }
});

router.get(
  "/admin/stats",
  requireAuth,
  requireRole("admin"),
  async (_req, res) => {
    try {
      const [pending, approved, bookings, users] = await Promise.all([
        Listing.countDocuments({ status: "pending" }),
        Listing.countDocuments({ status: "approved" }),
        Booking.countDocuments(),
        (await import("../models/User.js")).default.countDocuments({
          role: { $ne: "admin" },
        }),
      ]);
      res.json({ pending, approved, bookings, users });
    } catch (err) {
      res.status(500).json({ message: err.message || "Stats failed." });
    }
  },
);

export default router;
