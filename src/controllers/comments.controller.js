const commentsService = require("../services/comments.service");
const postsService = require("../services/posts.service");
const { notFound } = require("../utils/httpError");

async function list(req, res) {
  const comments = await commentsService.findAll();
  res.status(200).json(comments);
}

async function listByPost(req, res) {
  const postId = Number(req.params.id);
  const post = await postsService.findById(postId);
  if (!post) throw notFound("Post");

  const comments = await commentsService.findByPost(postId);
  res.status(200).json(comments);
}

async function create(req, res) {
  const comment = await commentsService.create(req.body);
  res.status(201).json(comment);
}

async function remove(req, res) {
  const deleted = await commentsService.remove(Number(req.params.id));
  if (!deleted) throw notFound("Comment");
  res.status(204).send();
}

module.exports = { list, listByPost, create, remove };
