const express = require("express");
const tagsRouter = express.Router();
const { getAllTags, getPostsByTagName } = require("../db");

tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /tags!");
  next();
});

tagsRouter.get("/", async (req, res) => {
  const tags = await getAllTags();
  res.send({
    tags,
  });
});

tagsRouter.get("/:tagName/posts", async (req, res, next) => {
  const { tagName } = req.params;
  try {
    const taggedPosts = await getPostsByTagName(tagName);
    const posts = taggedPosts.filter((post) => {
      return (
        (post.active && post.author.active) ||
        (req.user && post.author.id === req.user.id)
      );
    });
    res.send({ posts });
  } catch ({ name, message }) {
    next({ name, message });
  }
});
module.exports = tagsRouter;
