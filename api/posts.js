const express = require("express");
const postsRouter = express.Router();
const { getAllPosts, createPost, updatePost, getPostById } = require("../db");
const { requireUser, requireActiveUser } = require("./utils");

postsRouter.post("/", requireActiveUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;

  const tagArr = tags.trim().split(/\s+/);
  const postData = {};

  if (tagArr.length) {
    postData.tags = tagArr;
  }

  try {
    const postData = {
      authorId: req.user.id,
      title,
      content,
    };
    if (tagArr.length) {
      postData.tags = tagArr;
    }
    const post = await createPost(postData);
    if (post) {
      res.send({ post });
    } else {
      next(error);
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.patch("/:postId", requireActiveUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;
  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);
    if (originalPost.author.id === req.user.id) {
      const patchedPost = await updatePost(postId, updateFields);
      res.send({ post: patchedPost });
    } else {
      next({
        name: "UnauthorizedUserError",
        message: "You cannot edit a post that is not yours.",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.delete("/:postId", requireActiveUser, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.postId);

    if (post && post.author.id === req.user.id) {
      const updatedPost = await updatePost(post.id, { active: false });
      res.send({ post: updatedPost });
    } else {
      next(
        post
          ? {
              name: "UnauthorizedUserError",
              message: "You cannot delete someone else's post.",
            }
          : {
              name: "PostNotFoundError",
              message: "That post does not exist.",
            }
      );
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.use((req, res, next) => {
  console.log("A request is being made to /posts!");
  next();
});

postsRouter.get("/", async (req, res, next) => {
  try {
    const allPosts = await getAllPosts();

    const posts = allPosts.filter((post) => {
      return (
        (post.active && post.author.active) ||
        (req.user && post.author.id === req.user.id)
      );
    });
    res.send({
      posts,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});
module.exports = postsRouter;
