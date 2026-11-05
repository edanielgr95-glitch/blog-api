const express = require("express");
const controller = require("../controllers/posts.controller");
const commentsController = require("../controllers/comments.controller");
const { validateId, validatePost } = require("../middlewares/validate");

const router = express.Router();

router.get("/", controller.list);
// Va antes de "/:id" para que la palabra "author" no se lea como un id
router.get("/author/:authorId", validateId("authorId"), controller.listByAuthor);
router.get("/:id", validateId("id"), controller.getById);
router.get("/:id/comments", validateId("id"), commentsController.listByPost);
router.post("/", validatePost, controller.create);
router.put("/:id", validateId("id"), validatePost, controller.update);
router.delete("/:id", validateId("id"), controller.remove);

module.exports = router;
