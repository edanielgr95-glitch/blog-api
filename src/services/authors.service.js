const pool = require("../db/pool");

const COLUMNS = "id, name, email, bio, created_at";

async function findAll() {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM authors ORDER BY id`
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM authors WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

async function create({ name, email, bio }) {
  const { rows } = await pool.query(
    `INSERT INTO authors (name, email, bio)
     VALUES ($1, $2, $3)
     RETURNING ${COLUMNS}`,
    [name, email, bio]
  );
  return rows[0];
}

async function update(id, { name, email, bio }) {
  const { rows } = await pool.query(
    `UPDATE authors
     SET name = $1, email = $2, bio = $3
     WHERE id = $4
     RETURNING ${COLUMNS}`,
    [name, email, bio, id]
  );
  return rows[0] ?? null;
}

async function remove(id) {
  const { rowCount } = await pool.query("DELETE FROM authors WHERE id = $1", [
    id,
  ]);
  return rowCount > 0;
}

module.exports = { findAll, findById, create, update, remove };
