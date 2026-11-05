const express = require("express");
const logger = require("./middlewares/logger");
const authorsRoutes = require("./routes/authors.routes");
const postsRoutes = require("./routes/posts.routes");
const commentsRoutes = require("./routes/comments.routes");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());
app.use(logger);

app.get("/", (req, res) => {
  res.status(200).json({
    name: "Blog API",
    endpoints: ["/authors", "/posts", "/comments", "/health"],
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.use("/authors", authorsRoutes);
app.use("/posts", postsRoutes);
app.use("/comments", commentsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
