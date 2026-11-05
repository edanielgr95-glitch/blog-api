class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const notFound = (resource) =>
  new HttpError(404, "NOT_FOUND", `${resource} not found`);

module.exports = { HttpError, notFound };
