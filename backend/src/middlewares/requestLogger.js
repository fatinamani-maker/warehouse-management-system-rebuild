import { maskSensitive } from "../utils/masking.js";

function requestLogger(req, res, next) {
  const startedAt = Date.now();

  res.on("finish", () => {
    const payload = {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      tenantId: req.context?.tenantId || null,
      userId: req.context?.userId || null,
      body: process.env.NODE_ENV === "production" ? undefined : maskSensitive(req.body),
    };

    console.log(JSON.stringify(payload));
  });

  next();
}

export { requestLogger };
