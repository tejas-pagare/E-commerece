import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

/**
 * Upstash Redis client (REST-based, works in serverless/edge).
 *
 * If env vars are missing, a no-op stub is exported so the app
 * continues to work without caching instead of crashing.
 */

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis = null;
let redisAvailable = false;

if (url && token) {
  try {
    redis = new Redis({ url, token });
    redisAvailable = true;
    console.log("✅ Upstash Redis client initialised");
  } catch (err) {
    console.warn("⚠️  Failed to initialise Upstash Redis:", err.message);
  }
} else {
  console.warn(
    "⚠️  UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set — caching disabled"
  );
}

export { redis, redisAvailable };
export default redis;
