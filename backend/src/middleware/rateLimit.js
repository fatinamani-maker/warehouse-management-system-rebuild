const buckets = new Map();

function createSimpleRateLimiter({
  windowMs = 60_000,
  max = 30,
}) {
  return (req, res, next) => {
    const tenantId = req.tenant_id || "unknown_tenant";
    const userId = req.session?.user_id || "anonymous";
    const key = `${tenantId}:${userId}:${req.method}:${req.route?.path || req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now - bucket.windowStart > windowMs) {
      buckets.set(key, { windowStart: now, count: 1 });
      return next();
    }

    if (bucket.count >= max) {
      return res.status(429).json({ message: "Too many requests. Please try again shortly." });
    }

    bucket.count += 1;
    buckets.set(key, bucket);
    return next();
  };
}

export { createSimpleRateLimiter };
