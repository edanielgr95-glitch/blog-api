const authorsService = require("../services/authors.service");

async function list(req, res, next) {
  try {
    const authors = await authorsService.findAll();
    res.status(200).json(authors);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const author = await authorsService.findById(Number(req.params.id));
    if (!author) {
      return res.status(404).json({ error: "author not found" });
    }
    res.status(200).json(author);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const { name, email, bio } = req.body;
    const author = await authorsService.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      bio: bio || null,
    });
    res.status(201).json(author);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const { name, email, bio } = req.body;
    const author = await authorsService.update(Number(req.params.id), {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      bio: bio || null,
    });
    if (!author) {
      return res.status(404).json({ error: "author not found" });
    }
    res.status(200).json(author);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await authorsService.remove(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: "author not found" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { list, getById, create, update, remove };
