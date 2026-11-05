// Ruta que no existe → 404
function notFound(req, res) {
  res.status(404).json({ error: `route ${req.method} ${req.originalUrl} not found` });
}

// Middleware global de errores: recibe todo error que llega con next(error).
// Los errores de PostgreSQL traen un "code" que dice qué pasó:
// https://www.postgresql.org/docs/current/errcodes-appendix.html
function errorHandler(err, req, res, next) {
  // El body no es un JSON válido
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "invalid JSON body" });
  }

  // 23505: se repite un valor UNIQUE (el email de authors)
  if (err.code === "23505") {
    return res.status(400).json({ error: "email already exists" });
  }

  // 23503: la FK apunta a algo que no existe (author_id o post_id)
  if (err.code === "23503") {
    return res.status(400).json({ error: "referenced author or post does not exist" });
  }

  // 22P02, 23502, 23514: dato con formato inválido, vacío o que no cumple un CHECK
  if (err.code === "22P02" || err.code === "23502" || err.code === "23514") {
    return res.status(400).json({ error: "invalid data" });
  }

  // Cualquier otro error: se registra completo en la terminal,
  // pero al cliente solo se le envía un mensaje genérico
  console.error("Error details:", err);
  res.status(500).json({ error: "internal server error" });
}

module.exports = { errorHandler, notFound };
