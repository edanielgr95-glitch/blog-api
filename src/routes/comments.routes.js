const { Router } = require("express");
const controller = require("../controllers/comments.controller");
const { validateComment, validateIdParam } = require("../middlewares/validate");

const router = Router();

router.get("/", controller.list);
router.post("/", validateComment, controller.create);
router.delete("/:id", validateIdParam("id"), controller.remove);

module.exports = router;
