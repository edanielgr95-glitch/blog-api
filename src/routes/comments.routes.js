const express = require("express");
const controller = require("../controllers/comments.controller");
const { validateId, validateComment } = require("../middlewares/validate");

const router = express.Router();

router.get("/", controller.list);
router.post("/", validateComment, controller.create);
router.delete("/:id", validateId("id"), controller.remove);

module.exports = router;
