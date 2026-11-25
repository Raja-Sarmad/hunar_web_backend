import { Router } from "express";
import Category from "../models/Category.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const categories = await Category.find().sort({ index: 1 });
    res.json({ categories: categories.map((c) => c.toPublic()) });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load categories." });
  }
});

router.patch("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { imageUrl, name } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found." });
    if (imageUrl !== undefined) category.imageUrl = String(imageUrl || "");
    if (name !== undefined && String(name).trim()) {
      category.name = String(name).trim();
    }
    await category.save();
    res.json({ category: category.toPublic(), message: "Category updated." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Update failed." });
  }
});

export default router;
