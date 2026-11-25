import mongoose from "mongoose";

let cached = globalThis.__hunarMongoose;

if (!cached) {
  cached = globalThis.__hunarMongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI");
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        bufferCommands: false,
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
