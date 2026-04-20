import { redis, redisAvailable } from "../config/redis.js";

/**
 * Build a deterministic cache key from the request.
 * Format: cache:<METHOD>:<originalUrl>
 * Query params are included so /products?page=1 ≠ /products?page=2.
 */
const buildKey = (req) => `cache:${req.method}:${req.originalUrl}`;

/**
 * Express middleware factory — caches JSON responses in Upstash Redis.
 *
 * Usage:
 *   router.get("/products", cacheMiddleware(120), handler);
 *
 * @param {number} ttlSeconds  Time-to-live in seconds (default 120)
 * @returns {Function} Express middleware
 */
export function cacheMiddleware(ttlSeconds = 120) {
  return async (req, res, next) => {
    // Skip caching entirely when Redis is not configured
    if (!redisAvailable || !redis) return next();

    const key = buildKey(req);

    try {
      const cached = await redis.get(key);

      if (cached !== null && cached !== undefined) {
        // Upstash REST SDK auto-parses JSON, so `cached` is already an object
        res.set("X-Cache", "HIT");
        return res.json(cached);
      }
    } catch (err) {
      // Redis read failed — fall through to handler
      console.error("Redis cache read error:", err.message);
    }

    // Monkey-patch res.json to intercept the response and cache it
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Only cache successful responses (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Fire-and-forget write to Redis
        redis
          .set(key, JSON.stringify(body), { ex: ttlSeconds })
          .catch((err) => console.error("Redis cache write error:", err.message));
      }
      res.set("X-Cache", "MISS");
      return originalJson(body);
    };

    next();
  };
}

/**
 * Invalidate cache keys matching the given patterns.
 *
 * Upstash REST API does not support `SCAN`/`KEYS` patterns the same
 * way a full Redis instance does.  Instead we maintain a list of
 * well-known prefixes to invalidate.
 *
 * @param {string[]} prefixes  Array of key prefixes to delete, e.g.
 *   ["cache:GET:/api/v1/user/products", "cache:GET:/api/v1/product/details"]
 */
export async function invalidateByPrefixes(prefixes) {
  if (!redisAvailable || !redis || !prefixes?.length) return;

  try {
    // Use SCAN to find matching keys (Upstash supports cursor-based scan)
    for (const prefix of prefixes) {
      let cursor = 0;
      do {
        const [nextCursor, keys] = await redis.scan(cursor, {
          match: `${prefix}*`,
          count: 100,
        });
        cursor = Number(nextCursor);

        if (keys.length > 0) {
          // Pipeline delete for efficiency
          const pipeline = redis.pipeline();
          keys.forEach((k) => pipeline.del(k));
          await pipeline.exec();
        }
      } while (cursor !== 0);
    }
  } catch (err) {
    console.error("Redis cache invalidation error:", err.message);
  }
}

/**
 * Map a request path to the cache prefixes that should be busted.
 *
 * When a mutation (POST/PUT/PATCH/DELETE) succeeds on a route, we
 * invalidate the related read caches.
 */
const INVALIDATION_MAP = {
  // Product mutations → bust product lists, details, admin/manager/seller views
  "/api/v1/seller/create": [
    "cache:GET:/api/v1/user/products",
    "cache:GET:/api/v1/product/details",
    "cache:GET:/api/v1/admin/products",
    "cache:GET:/api/v1/manager/products",
    "cache:GET:/api/v1/seller/products",
  ],
  "/api/v1/seller/update": [
    "cache:GET:/api/v1/user/products",
    "cache:GET:/api/v1/product/details",
    "cache:GET:/api/v1/admin/products",
    "cache:GET:/api/v1/seller/products",
  ],
  "/api/v1/seller/product": [
    "cache:GET:/api/v1/user/products",
    "cache:GET:/api/v1/product/details",
    "cache:GET:/api/v1/admin/products",
    "cache:GET:/api/v1/seller/products",
  ],
  "/api/v1/admin/products": [
    "cache:GET:/api/v1/user/products",
    "cache:GET:/api/v1/product/details",
    "cache:GET:/api/v1/admin/products",
  ],
  "/api/v1/admin/product": [
    "cache:GET:/api/v1/user/products",
    "cache:GET:/api/v1/product/details",
    "cache:GET:/api/v1/admin/products",
  ],
  "/api/v1/manager/product": [
    "cache:GET:/api/v1/user/products",
    "cache:GET:/api/v1/product/details",
    "cache:GET:/api/v1/manager/products",
  ],

  // User mutations
  "/api/v1/user/signup": ["cache:GET:/api/v1/admin/users", "cache:GET:/api/v1/admin/customers"],
  "/api/v1/admin/users": ["cache:GET:/api/v1/admin/users", "cache:GET:/api/v1/admin/customers"],
  "/api/v1/admin/customers": ["cache:GET:/api/v1/admin/users", "cache:GET:/api/v1/admin/customers"],

  // Seller mutations
  "/api/v1/seller/signup": ["cache:GET:/api/v1/admin/sellers", "cache:GET:/api/v1/manager/seller"],
  "/api/v1/admin/sellers": ["cache:GET:/api/v1/admin/sellers", "cache:GET:/api/v1/manager/seller"],
  "/api/v1/admin/seller": ["cache:GET:/api/v1/admin/sellers", "cache:GET:/api/v1/manager/seller"],
  "/api/v1/manager/seller": ["cache:GET:/api/v1/admin/sellers", "cache:GET:/api/v1/manager/seller"],

  // Order mutations → bust admin/manager/seller orders + dashboard
  "/api/v1/user/payment": [
    "cache:GET:/api/v1/admin/orders",
    "cache:GET:/api/v1/admin/dashboard",
    "cache:GET:/api/v1/seller/orders",
    "cache:GET:/api/v1/seller/sold-products",
  ],
  "/api/v1/admin/orders": ["cache:GET:/api/v1/admin/orders", "cache:GET:/api/v1/admin/dashboard"],
  "/api/v1/manager/orders": ["cache:GET:/api/v1/admin/orders", "cache:GET:/api/v1/manager/orders"],
  "/api/v1/seller/orders": ["cache:GET:/api/v1/seller/orders", "cache:GET:/api/v1/seller/sold-products"],

  // Blog mutations
  "/api/v1/admin/blog": ["cache:GET:/api/v1/user/blogs", "cache:GET:/api/v1/admin/blogs"],

  // Industry mutations
  "/api/v1/industry/cart": ["cache:GET:/api/v1/industry/home", "cache:GET:/api/v1/industry/fetchhome"],
  "/api/v1/industry/checkout": ["cache:GET:/api/v1/industry/home", "cache:GET:/api/v1/industry/fetchhome", "cache:GET:/api/v1/industry/dashboard"],

  // Review mutations → bust product details
  "/api/v1/user/review": ["cache:GET:/api/v1/product/details", "cache:GET:/api/v1/user/products"],

  // Secondhand/SellProduct mutations
  "/api/v1/user/sell": ["cache:GET:/api/v1/admin/secondhand", "cache:GET:/api/v1/admin/dashboard"],
  "/api/v1/admin/secondhand": ["cache:GET:/api/v1/admin/secondhand", "cache:GET:/api/v1/admin/dashboard"],
  "/api/v1/admin/sellproduct": ["cache:GET:/api/v1/admin/secondhand", "cache:GET:/api/v1/admin/dashboard"],

  // Manager mutations
  "/api/v1/admin/managers": ["cache:GET:/api/v1/admin/managers"],

  // Rider mutations
  "/api/v1/admin/rider": ["cache:GET:/api/v1/admin/rider"],
};

/**
 * Resolve the best-matching invalidation prefixes for a given path.
 * Uses startsWith matching so that /api/v1/seller/product/123 matches
 * the /api/v1/seller/product key.
 */
function resolvePrefixes(path) {
  const allPrefixes = new Set();
  for (const [pattern, prefixes] of Object.entries(INVALIDATION_MAP)) {
    if (path.startsWith(pattern)) {
      prefixes.forEach((p) => allPrefixes.add(p));
    }
  }
  // Always bust dashboard analytics on any mutation (lightweight)
  allPrefixes.add("cache:GET:/api/v1/admin/dashboard");
  return [...allPrefixes];
}

/**
 * Express middleware — call AFTER mutation routes to auto-invalidate
 * related caches.  Attached globally in index.js.
 */
export function cacheInvalidationMiddleware(req, res, next) {
  if (!redisAvailable || !redis) return next();

  const method = req.method?.toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return next();

  // Hook into response finish to invalidate only on success
  res.on("finish", () => {
    if (res.statusCode < 400) {
      const prefixes = resolvePrefixes(req.originalUrl);
      if (prefixes.length) {
        invalidateByPrefixes(prefixes).catch((err) =>
          console.error("Background cache invalidation error:", err.message)
        );
      }
    }
  });

  next();
}
