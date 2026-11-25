import { Router } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed."));
    }
    cb(null, true);
  },
});

router.post(
  "/",
  requireAuth,
  requireRole("provider", "admin"),
  (req, res) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message || "Upload failed." });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No image file uploaded." });
      }
      const imageUrl = `/uploads/${req.file.filename}`;
      res.status(201).json({ imageUrl, message: "Image uploaded." });
    });
  },
);

export default router;
