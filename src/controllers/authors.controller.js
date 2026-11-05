const authorsService = require("../services/authors.service");
const { notFound } = require("../utils/httpError");

async function list(req, res) {
  const authors = await authorsService.findAll();
  res.status(200).json(authors);
}

async function getById(req, res) {
  const author = await authorsService.findById(Number(req.params.id));
  if (!author) throw notFound("Author");
  res.status(200).json(author);
}

async function create(req, res) {
  const author = await authorsService.create(req.body);
  res.status(201).json(author);
}

async function update(req, res) {
  const author = await authorsService.update(Number(req.params.id), req.body);
  if (!author) throw notFound("Author");
  res.status(200).json(author);
}

async function remove(req, res) {
  const deleted = await authorsService.remove(Number(req.params.id));
  if (!deleted) throw notFound("Author");
  res.status(204).send();
}

module.exports = { list, getById, create, update, remove };
