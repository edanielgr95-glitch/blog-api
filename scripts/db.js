// Uso:
//   node scripts/db.js setup          → crea las tablas (no borra datos)
//   node scripts/db.js seed           → carga datos de ejemplo solo si la tabla authors está vacía
//   node scripts/db.js seed --force   → borra todo y vuelve a cargar los datos de ejemplo
const fs = require("fs");
const path = require("path");
const pool = require("../src/db/pool");

const readSql = (file) =>
  fs.readFileSync(path.join(__dirname, "..", "db", file), "utf8");

async function setup() {
  await pool.query(readSql("setup.sql"));
  console.log("✔ Tablas creadas (authors, posts, comments)");
}

async function seed(force) {
  const { rows } = await pool.query("SELECT COUNT(*)::int AS total FROM authors");
  if (rows[0].total > 0 && !force) {
    console.log("ℹ La base ya tiene datos; seed omitido (usa --force para reiniciar)");
    return;
  }
  await pool.query(readSql("seed.sql"));
  console.log("✔ Datos de ejemplo cargados");
}

async function main() {
  const [command, flag] = process.argv.slice(2);

  if (!process.env.DATABASE_URL) {
    throw new Error("Falta la variable DATABASE_URL (revisa tu archivo .env)");
  }

  if (command === "setup") await setup();
  else if (command === "seed") await seed(flag === "--force");
  else throw new Error(`Comando desconocido: ${command}. Usa "setup" o "seed".`);
}

main()
  .catch((err) => {
    console.error("✖ Error:", err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
