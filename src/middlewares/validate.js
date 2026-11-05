const { HttpError } = require("../utils/httpError");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const isPositiveInteger = (value) =>
  (typeof value === "number" && Number.isInteger(value) && value > 0) ||
  (typeof value === "string" && /^\d+$/.test(value) && Number(value) > 0);

const fail = (details) =>
  new HttpError(400, "VALIDATION_ERROR", "Invalid request data", details);

function validateIdParam(paramName) {
  return (req, res, next) => {
    const value = req.params[paramName];
    if (!/^\d+$/.test(value) || Number(value) <= 0) {
      return next(
        fail([{ field: paramName, issue: "must be a positive integer" }])
      );
    }
    next();
  };
}

function validateAuthor(req, res, next) {
  const { name, email, bio } = req.body ?? {};
  const details = [];

  if (!isNonEmptyString(name)) {
    details.push({ field: "name", issue: "is required" });
  }
  if (!isNonEmptyString(email)) {
    details.push({ field: "email", issue: "is required" });
  } else if (!EMAIL_REGEX.test(email.trim())) {
    details.push({ field: "email", issue: "must be a valid email" });
  }
  if (bio !== undefined && bio !== null && typeof bio !== "string") {
    details.push({ field: "bio", issue: "must be a string" });
  }

  if (details.length) return next(fail(details));

  req.body = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    bio: bio ?? null,
  };
  next();
}

module.exports = {
  validateIdParam,
  validateAuthor,
  isNonEmptyString,
  isPositiveInteger,
  fail,
};
