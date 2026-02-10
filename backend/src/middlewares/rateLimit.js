import rateLimit from "express-rate-limit";

function createApiRateLimiter() {
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000);
  const max = Number(process.env.RATE_LIMIT_MAX || 120);

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests",
        },
        meta: {
          requestId: req.requestId || null,
          tenantId: req.context?.tenantId || null,
          timestamp: new Date().toISOString(),
        },
      });
    },
  });
}

export { createApiRateLimiter };
