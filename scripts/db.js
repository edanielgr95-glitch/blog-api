// Ejecuta los archivos SQL de la carpeta db/
//   npm run db:setup  → crea las tablas (no borra datos)
//   npm run db:seed   → carga datos de ejemplo solo si la tabla authors está vacía
//   npm run db:reset  → borra todo y vuelve a cargar los datos de ejemplo
//   npm run db:init   → setup + seed
const fs = require("fs");
const path = require("path");
const pool = require("../src/db/pool");

function readSql(fileName) {
  return fs.readFileSync(path.join(__dirname, "..", "db", fileName), "utf8");
}

async function setup() {
  await pool.query(readSql("setup.sql"));
  console.log("✔ Tablas creadas (authors, posts, comments)");
}

async function seed(force) {
  const result = await pool.query("SELECT COUNT(*)::int AS total FROM authors");
  if (result.rows[0].total > 0 && !force) {
    console.log("ℹ La base ya tiene datos; seed omitido (usa npm run db:reset para reiniciar)");
    return;
  }
  await pool.query(readSql("seed.sql"));
  console.log("✔ Datos de ejemplo cargados");
}

async function main() {
  const command = process.argv[2];
  const force = process.argv[3] === "--force";

  if (!process.env.DATABASE_URL) {
    console.error("✖ Falta la variable DATABASE_URL (revisa tu archivo .env)");
    process.exitCode = 1;
    return;
  }

  try {
    if (command === "setup") {
      await setup();
    } else if (command === "seed") {
      await seed(force);
    } else {
      console.error(`✖ Comando desconocido: ${command}. Usa "setup" o "seed".`);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("✖ Error:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
