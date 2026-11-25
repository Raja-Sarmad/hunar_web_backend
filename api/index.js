import "dotenv/config";
import app from "../src/app.js";
import { connectDB } from "../src/db.js";

let ready;

export default async function handler(req, res) {
  try {
    if (!ready) ready = connectDB();
    await ready;
    return app(req, res);
  } catch (err) {
    console.error("Vercel handler error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        message: err.message || "Server failed to start.",
      }),
    );
  }
}
