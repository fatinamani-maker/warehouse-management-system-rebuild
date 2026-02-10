class ApiError extends Error {
  constructor(statusCode, code, message, details = undefined) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, ApiError);
  }
}

function isApiError(error) {
  return error instanceof ApiError;
}

export { ApiError, isApiError };
