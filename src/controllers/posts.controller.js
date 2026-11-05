const postsService = require("../services/posts.service");
const authorsService = require("../services/authors.service");

// GET /posts
// Filtro opcional:     ?published=true  o  ?published=false
// Paginación opcional: ?page=1&limit=10 (igual que en la clase)
async function list(req, res, next) {
  try {
    const { published, page, limit } = req.query;

    if (published !== undefined && published !== "true" && published !== "false") {
      return res.status(400).json({ error: "published must be true or false" });
    }

    const filters = {};
    if (published !== undefined) {
      filters.published = published === "true";
    }

    // Sin page ni limit: se devuelve la lista completa
    if (page === undefined && limit === undefined) {
      const posts = await postsService.findAll(filters);
      return res.status(200).json(posts);
    }

    // Con paginación
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const offset = (pageNumber - 1) * limitNumber;

    const total = await postsService.count(filters);
    const posts = await postsService.findAll({ ...filters, limit: limitNumber, offset });

    res.status(200).json({
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
      data: posts,
    });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const post = await postsService.findById(Number(req.params.id));
    if (!post) {
      return res.status(404).json({ error: "post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
}

// GET /posts/author/:authorId → el author y todos sus posts
async function listByAuthor(req, res, next) {
  try {
    const authorId = Number(req.params.authorId);
    const author = await authorsService.findById(authorId);
    if (!author) {
      return res.status(404).json({ error: "author not found" });
    }
    const posts = await postsService.findByAuthor(authorId);
    res.status(200).json({ author, posts });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const { author_id, title, content, published } = req.body;
    const post = await postsService.create({
      author_id: Number(author_id),
      title: title.trim(),
      content: content.trim(),
      published: published === true,
    });
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const { author_id, title, content, published } = req.body;
    const post = await postsService.update(Number(req.params.id), {
      author_id: Number(author_id),
      title: title.trim(),
      content: content.trim(),
      published: published === true,
    });
    if (!post) {
      return res.status(404).json({ error: "post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await postsService.remove(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: "post not found" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { list, getById, listByAuthor, create, update, remove };
