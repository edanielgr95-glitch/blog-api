const commentsService = require("../services/comments.service");
const postsService = require("../services/posts.service");

async function list(req, res, next) {
  try {
    const comments = await commentsService.findAll();
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
}

// GET /posts/:id/comments → los comments de un post
async function listByPost(req, res, next) {
  try {
    const postId = Number(req.params.id);
    const post = await postsService.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "post not found" });
    }
    const comments = await commentsService.findByPost(postId);
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const { post_id, author_id, content } = req.body;
    const comment = await commentsService.create({
      post_id: Number(post_id),
      author_id: Number(author_id),
      content: content.trim(),
    });
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await commentsService.remove(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: "comment not found" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { list, listByPost, create, remove };
