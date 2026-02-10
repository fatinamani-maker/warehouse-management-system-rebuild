import { isApiError } from "../utils/errors.js";
import { sendError } from "../utils/response.js";

function notFoundHandler(req, res) {
  return sendError(res, req, 404, "NOT_FOUND", "Route not found");
}

function errorHandler(error, req, res, _next) {
  if (isApiError(error)) {
    return sendError(res, req, error.statusCode, error.code, error.message, error.details);
  }

  return sendError(res, req, 500, "INTERNAL_SERVER_ERROR", "Unexpected server error");
}

export { notFoundHandler, errorHandler };
