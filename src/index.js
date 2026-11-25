import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./db.js";

const port = Number(process.env.PORT) || 5000;

async function start() {
  await connectDB();
  console.log("MongoDB connected");
  app.listen(port, () => {
    console.log(`HUNAR API on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
