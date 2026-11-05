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

function validatePost(req, res, next) {
  const { author_id, title, content, published } = req.body ?? {};
  const details = [];

  if (!isPositiveInteger(author_id)) {
    details.push({ field: "author_id", issue: "is required and must be a positive integer" });
  }
  if (!isNonEmptyString(title)) {
    details.push({ field: "title", issue: "is required" });
  }
  if (!isNonEmptyString(content)) {
    details.push({ field: "content", issue: "is required" });
  }
  if (published !== undefined && typeof published !== "boolean") {
    details.push({ field: "published", issue: "must be a boolean" });
  }

  if (details.length) return next(fail(details));

  req.body = {
    author_id: Number(author_id),
    title: title.trim(),
    content: content.trim(),
    published: published ?? false,
  };
  next();
}

// Paginación y filtro para GET /posts: ?limit=10&offset=0&published=true
function validatePostsQuery(req, res, next) {
  const { limit = "20", offset = "0", published } = req.query;
  const details = [];

  if (!/^\d+$/.test(limit) || Number(limit) < 1 || Number(limit) > 100) {
    details.push({ field: "limit", issue: "must be an integer between 1 and 100" });
  }
  if (!/^\d+$/.test(offset)) {
    details.push({ field: "offset", issue: "must be an integer >= 0" });
  }
  if (published !== undefined && published !== "true" && published !== "false") {
    details.push({ field: "published", issue: "must be true or false" });
  }

  if (details.length) return next(fail(details));

  res.locals.query = {
    limit: Number(limit),
    offset: Number(offset),
    published: published === undefined ? undefined : published === "true",
  };
  next();
}

module.exports = {
  validateIdParam,
  validateAuthor,
  validatePost,
  validatePostsQuery,
};
