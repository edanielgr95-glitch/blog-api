const express = require("express");
const controller = require("../controllers/authors.controller");
const { validateId, validateAuthor } = require("../middlewares/validate");

const router = express.Router();

router.get("/", controller.list);
router.get("/:id", validateId("id"), controller.getById);
router.post("/", validateAuthor, controller.create);
router.put("/:id", validateId("id"), validateAuthor, controller.update);
router.delete("/:id", validateId("id"), controller.remove);

module.exports = router;
