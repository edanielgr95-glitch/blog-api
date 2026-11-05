const postsService = require("../services/posts.service");
const authorsService = require("../services/authors.service");
const { notFound } = require("../utils/httpError");

async function list(req, res) {
  const { posts, total } = await postsService.findAll(res.locals.query);
  res.set("X-Total-Count", String(total));
  res.status(200).json(posts);
}

async function getById(req, res) {
  const post = await postsService.findById(Number(req.params.id));
  if (!post) throw notFound("Post");
  res.status(200).json(post);
}

async function listByAuthor(req, res) {
  const authorId = Number(req.params.authorId);
  const author = await authorsService.findById(authorId);
  if (!author) throw notFound("Author");

  const posts = await postsService.findByAuthor(authorId);
  res.status(200).json({ author, posts });
}

async function create(req, res) {
  const post = await postsService.create(req.body);
  res.status(201).json(post);
}

async function update(req, res) {
  const post = await postsService.update(Number(req.params.id), req.body);
  if (!post) throw notFound("Post");
  res.status(200).json(post);
}

async function remove(req, res) {
  const deleted = await postsService.remove(Number(req.params.id));
  if (!deleted) throw notFound("Post");
  res.status(204).send();
}

module.exports = { list, getById, listByAuthor, create, update, remove };
