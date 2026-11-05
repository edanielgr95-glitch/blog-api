const pool = require("../db/pool");

const COLUMNS = "id, author_id, title, content, published, created_at";

async function findAll({ limit = 20, offset = 0, published } = {}) {
  const values = [];
  let where = "";

  if (published !== undefined) {
    values.push(published);
    where = `WHERE published = $${values.length}`;
  }

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM posts ${where}`,
    values
  );

  values.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM posts ${where}
     ORDER BY id
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  return { posts: rows, total: countResult.rows[0].total };
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM posts WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

async function findByAuthor(authorId) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM posts WHERE author_id = $1 ORDER BY id`,
    [authorId]
  );
  return rows;
}

async function create({ author_id, title, content, published }) {
  const { rows } = await pool.query(
    `INSERT INTO posts (author_id, title, content, published)
     VALUES ($1, $2, $3, $4)
     RETURNING ${COLUMNS}`,
    [author_id, title, content, published]
  );
  return rows[0];
}

async function update(id, { author_id, title, content, published }) {
  const { rows } = await pool.query(
    `UPDATE posts
     SET author_id = $1, title = $2, content = $3, published = $4
     WHERE id = $5
     RETURNING ${COLUMNS}`,
    [author_id, title, content, published, id]
  );
  return rows[0] ?? null;
}

async function remove(id) {
  const { rowCount } = await pool.query("DELETE FROM posts WHERE id = $1", [id]);
  return rowCount > 0;
}

module.exports = { findAll, findById, findByAuthor, create, update, remove };
