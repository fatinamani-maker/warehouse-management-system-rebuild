function buildMeta(req, extra = {}) {
  return {
    requestId: req.requestId || null,
    tenantId: req.context?.tenantId || null,
    timestamp: new Date().toISOString(),
    ...extra,
  };
}

function sendSuccess(res, req, data, statusCode = 200, meta = {}) {
  return res.status(statusCode).json({
    success: true,
    data,
    meta: buildMeta(req, meta),
  });
}

function sendError(res, req, statusCode, code, message, details = undefined) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
    meta: buildMeta(req),
  });
}

export { buildMeta, sendSuccess, sendError };
