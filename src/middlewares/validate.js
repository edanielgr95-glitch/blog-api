// Middlewares de validación: revisan los datos ANTES de llegar al controller.
// Si algo está mal, responden 400 y la request no sigue.

function isEmptyText(value) {
  return typeof value !== "string" || value.trim() === "";
}

function isPositiveId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0;
}

function validationError(res, details) {
  return res.status(400).json({ error: "validation failed", details });
}

// Valida un parámetro de la URL, por ejemplo /authors/:id
function validateId(paramName) {
  return (req, res, next) => {
    if (!isPositiveId(req.params[paramName])) {
      return res
        .status(400)
        .json({ error: `${paramName} must be a positive number` });
    }
    next();
  };
}

function validateAuthor(req, res, next) {
  const { name, email, bio } = req.body || {};
  const details = [];

  if (isEmptyText(name)) {
    details.push({ field: "name", message: "is required" });
  }
  if (isEmptyText(email)) {
    details.push({ field: "email", message: "is required" });
  } else if (!email.includes("@")) {
    details.push({ field: "email", message: "must be a valid email" });
  }
  if (bio !== undefined && bio !== null && typeof bio !== "string") {
    details.push({ field: "bio", message: "must be a string" });
  }

  if (details.length > 0) return validationError(res, details);
  next();
}

function validatePost(req, res, next) {
  const { author_id, title, content, published } = req.body || {};
  const details = [];

  if (!isPositiveId(author_id)) {
    details.push({ field: "author_id", message: "is required and must be a positive number" });
  }
  if (isEmptyText(title)) {
    details.push({ field: "title", message: "is required" });
  }
  if (isEmptyText(content)) {
    details.push({ field: "content", message: "is required" });
  }
  if (published !== undefined && typeof published !== "boolean") {
    details.push({ field: "published", message: "must be true or false" });
  }

  if (details.length > 0) return validationError(res, details);
  next();
}

function validateComment(req, res, next) {
  const { post_id, author_id, content } = req.body || {};
  const details = [];

  if (!isPositiveId(post_id)) {
    details.push({ field: "post_id", message: "is required and must be a positive number" });
  }
  if (!isPositiveId(author_id)) {
    details.push({ field: "author_id", message: "is required and must be a positive number" });
  }
  if (isEmptyText(content)) {
    details.push({ field: "content", message: "is required" });
  }

  if (details.length > 0) return validationError(res, details);
  next();
}

module.exports = { validateId, validateAuthor, validatePost, validateComment };
