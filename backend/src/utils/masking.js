const SENSITIVE_KEYS = [
  "password",
  "secret",
  "token",
  "authorization",
  "apiKey",
  "apikey",
  "refreshToken",
  "accessToken",
  "clerk_secret_key",
];

function isSensitiveKey(key) {
  return SENSITIVE_KEYS.some((item) => key.toLowerCase().includes(item.toLowerCase()));
}

function maskValue(value) {
  if (value === null || value === undefined) {
    return value;
  }
  return "***";
}

function maskSensitive(input) {
  if (Array.isArray(input)) {
    return input.map(maskSensitive);
  }

  if (input && typeof input === "object") {
    const output = {};
    for (const [key, value] of Object.entries(input)) {
      output[key] = isSensitiveKey(key) ? maskValue(value) : maskSensitive(value);
    }
    return output;
  }

  return input;
}

export { maskSensitive };
