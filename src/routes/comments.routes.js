const { Router } = require("express");
const controller = require("../controllers/comments.controller");
const { validateComment } = require("../middlewares/validate");

const router = Router();

router.get("/", controller.list);
router.post("/", validateComment, controller.create);

module.exports = router;
