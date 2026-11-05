// Muestra en la terminal cada request: método, ruta, status y tiempo de respuesta.
// Ejemplo: GET /authors → 200 (12 ms)
function logger(req, res, next) {
  if (process.env.NODE_ENV === "test") return next();

  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${ms} ms)`);
  });
  next();
}

module.exports = logger;
