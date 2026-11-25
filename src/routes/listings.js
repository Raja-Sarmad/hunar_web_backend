import { Router } from "express";
import Listing from "../models/Listing.js";
import User from "../models/User.js";
import { optionalAuth, requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", optionalAuth, async (req, res) => {
  try {
    const { city, cat, q, status, mine } = req.query;
    const filter = {};

    if (mine === "1") {
      if (!req.user) {
        return res.status(401).json({ message: "Sign in required." });
      }
      filter.provider = req.user._id;
    } else if (status) {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin only." });
      }
      if (status !== "all") filter.status = status;
    } else {
      filter.status = "approved";
    }

    if (city) filter.city = city;
    if (cat !== undefined && cat !== "" && !Number.isNaN(Number(cat))) {
      filter.cat = Number(cat);
    }
    if (q) {
      filter.$or = [
        { title: new RegExp(q, "i") },
        { desc: new RegExp(q, "i") },
        { providerName: new RegExp(q, "i") },
      ];
    }

    const listings = await Listing.find(filter).sort({ createdAt: -1 });
    res.json({ listings: listings.map((l) => l.toPublic()) });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load listings." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found." });
    res.json({ listing: listing.toPublic() });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load listing." });
  }
});

router.post("/", requireAuth, requireRole("provider", "admin"), async (req, res) => {
  try {
    const {
      title,
      desc,
      city,
      cat,
      price,
      phone,
      image,
      imageUrl,
      providerId,
      providerName,
    } = req.body;
    if (!title?.trim() || !desc?.trim() || !city || price == null || !phone) {
      return res.status(400).json({ message: "Please fill in every field." });
    }

    let provider = req.user._id;
    let name = req.user.name;

    if (req.user.role === "admin" && providerId) {
      const assigned = await User.findById(providerId);
      if (!assigned) {
        return res.status(400).json({ message: "Provider not found." });
      }
      provider = assigned._id;
      name = assigned.name;
    } else if (req.user.role === "admin" && providerName?.trim()) {
      name = providerName.trim();
    }

    const listing = await Listing.create({
      title: title.trim(),
      desc: desc.trim(),
      city,
      cat: Number(cat) || 0,
      price: Number(price),
      phone: String(phone).trim(),
      image: Number(image) || Number(cat) || 0,
      imageUrl: String(imageUrl || "").trim(),
      provider,
      providerName: name,
      status: req.user.role === "admin" ? "approved" : "pending",
    });
    res.status(201).json({
      listing: listing.toPublic(),
      message:
        listing.status === "approved"
          ? "Listing published."
          : "Submitted for admin review.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Submit failed." });
  }
});

router.patch("/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!listing) return res.status(404).json({ message: "Listing not found." });
    res.json({ listing: listing.toPublic() });
  } catch (err) {
    res.status(500).json({ message: err.message || "Update failed." });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found." });
    const isOwner = listing.provider.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed." });
    }
    await listing.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message || "Delete failed." });
  }
});

export default router;
