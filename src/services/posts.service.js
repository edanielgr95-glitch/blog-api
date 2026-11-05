const pool = require("../db/pool");

const COLUMNS = "id, author_id, title, content, published, created_at";

// filters: { published, limit, offset } (todos opcionales)
async function findAll(filters = {}) {
  const values = [];
  let sql = `SELECT ${COLUMNS} FROM posts`;

  if (filters.published !== undefined) {
    values.push(filters.published);
    sql += ` WHERE published = $${values.length}`;
  }

  sql += " ORDER BY id";

  if (filters.limit !== undefined) {
    values.push(filters.limit, filters.offset || 0);
    sql += ` LIMIT $${values.length - 1} OFFSET $${values.length}`;
  }

  const { rows } = await pool.query(sql, values);
  return rows;
}

async function count(filters = {}) {
  const values = [];
  let sql = "SELECT COUNT(*)::int AS total FROM posts";

  if (filters.published !== undefined) {
    values.push(filters.published);
    sql += " WHERE published = $1";
  }

  const { rows } = await pool.query(sql, values);
  return rows[0].total;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM posts WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
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
  return rows[0] || null;
}

async function remove(id) {
  const result = await pool.query("DELETE FROM posts WHERE id = $1", [id]);
  return result.rowCount > 0;
}

module.exports = { findAll, count, findById, findByAuthor, create, update, remove };
