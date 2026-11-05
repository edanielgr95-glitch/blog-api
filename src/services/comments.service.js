const pool = require("../db/pool");

const COLUMNS = "id, post_id, author_id, content, created_at";

async function findAll() {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM comments ORDER BY id`
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM comments WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function findByPost(postId) {
  const { rows } = await pool.query(
    `SELECT c.id, c.post_id, c.author_id, c.content, c.created_at,
            a.name AS author_name
     FROM comments c
     LEFT JOIN authors a ON a.id = c.author_id
     WHERE c.post_id = $1
     ORDER BY c.id`,
    [postId]
  );
  return rows;
}

async function create({ post_id, author_id, content }) {
  const { rows } = await pool.query(
    `INSERT INTO comments (post_id, author_id, content)
     VALUES ($1, $2, $3)
     RETURNING ${COLUMNS}`,
    [post_id, author_id, content]
  );
  return rows[0];
}

async function remove(id) {
  const result = await pool.query("DELETE FROM comments WHERE id = $1", [
    id,
  ]);
  return result.rowCount > 0;
}

module.exports = { findAll, findById, findByPost, create, remove };
