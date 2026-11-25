import User from "../models/User.js";
import { verifyToken } from "../utils/auth.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Sign in required." });
    }
    const payload = verifyToken(token);
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: "Account not found." });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired session." });
  }
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();
  verifyTokenAsync(token)
    .then((user) => {
      if (user) req.user = user;
      next();
    })
    .catch(() => next());
}

async function verifyTokenAsync(token) {
  const payload = verifyToken(token);
  return User.findById(payload.id);
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Not allowed." });
    }
    next();
  };
}
