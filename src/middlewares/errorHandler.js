const { HttpError } = require("../utils/httpError");

// Códigos de error de PostgreSQL: https://www.postgresql.org/docs/current/errcodes-appendix.html
const PG_ERRORS = {
  23505: { status: 409, code: "DUPLICATE", message: "A record with that value already exists" },
  23503: { status: 400, code: "INVALID_REFERENCE", message: "A referenced record does not exist" },
  23502: { status: 400, code: "VALIDATION_ERROR", message: "A required field is missing" },
  23514: { status: 400, code: "VALIDATION_ERROR", message: "A field has an invalid value" },
  "22P02": { status: 400, code: "VALIDATION_ERROR", message: "A field has an invalid format" },
};

function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: { code: "INVALID_JSON", message: "Request body is not valid JSON" },
    });
  }

  const pgError = PG_ERRORS[err.code];
  if (pgError) {
    return res.status(pgError.status).json({
      error: {
        code: pgError.code,
        message: pgError.message,
        ...(err.detail && { details: [{ issue: err.detail }] }),
      },
    });
  }

  console.error(err);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Internal server error" },
  });
}

module.exports = { errorHandler, notFoundHandler };
