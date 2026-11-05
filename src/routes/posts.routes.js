const { Router } = require("express");
const controller = require("../controllers/posts.controller");
const commentsController = require("../controllers/comments.controller");
const {
  validateIdParam,
  validatePost,
  validatePostsQuery,
} = require("../middlewares/validate");

const router = Router();

router.get("/", validatePostsQuery, controller.list);
// Va antes de "/:id" para que "author" no se lea como un id
router.get("/author/:authorId", validateIdParam("authorId"), controller.listByAuthor);
router.get("/:id", validateIdParam("id"), controller.getById);
router.get("/:id/comments", validateIdParam("id"), commentsController.listByPost);
router.post("/", validatePost, controller.create);
router.put("/:id", validateIdParam("id"), validatePost, controller.update);
router.delete("/:id", validateIdParam("id"), controller.remove);

module.exports = router;
