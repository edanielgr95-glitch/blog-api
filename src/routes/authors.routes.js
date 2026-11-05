const { Router } = require("express");
const controller = require("../controllers/authors.controller");
const { validateIdParam, validateAuthor } = require("../middlewares/validate");

const router = Router();

router.get("/", controller.list);
router.get("/:id", validateIdParam("id"), controller.getById);
router.post("/", validateAuthor, controller.create);
router.put("/:id", validateIdParam("id"), validateAuthor, controller.update);
router.delete("/:id", validateIdParam("id"), controller.remove);

module.exports = router;
