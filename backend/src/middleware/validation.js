import { validationResult } from "express-validator";

function handleValidationResult(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  const first = result.array({ onlyFirstError: true })[0];
  const message = first?.msg || "Validation failed";
  return res.status(400).json({ message });
}

export { handleValidationResult };
