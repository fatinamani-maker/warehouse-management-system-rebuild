import { z } from "zod";
import { ApiError } from "../utils/errors.js";

function validate(schemas = {}) {
  return (req, _res, next) => {
    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(new ApiError(400, "VALIDATION_ERROR", "Request validation failed", error.issues));
      }

      return next(error);
    }
  };
}

export { validate };
