import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";

import authRoutes from "./routes/auth.js";
import listingRoutes from "./routes/listings.js";
import bookingRoutes from "./routes/bookings.js";
import adminRoutes from "./routes/admin.js";
import categoryRoutes from "./routes/categories.js";
import uploadRoutes from "./routes/uploads.js";

const app = express();

const allowed = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowed.includes(origin) || allowed.includes("*")) {
        return cb(null, true);
      }
      return cb(null, true); // allow all for FYP demos; tighten later if needed
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "8mb" }));
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "hunar-backend",
    docs: "/api/health",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "hunar-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/uploads", uploadRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error." });
});

export default app;
