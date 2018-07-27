const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load Validation
const ValidatePostInput = require("../../Validation/post");

// Load Post Model
const Post = require("../../models/Post");

// Load Profile Model
const Profile = require("../../models/Profile");

// @route GET api/posts/test
// @desc Tests post route
// @access Public
router.get("/test", (req, res) => res.json({ msg: "posts works" }));

// @route GET api/posts
// @desc Get posts
// @access Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err =>
      res.status(404).json({ nopostfound: "No Posts Found with that ID" })
    );
});

// @route GET api/posts/:id
// @desc Get posts by ID
// @access Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err =>
      res.status(404).json({ nopostfound: "No Post Found with that ID" })
    );
});

// @route Post api/posts
// @desc Create Post
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = ValidatePostInput(req.body);

    // Check Validation
    if (!isValid) {
      // If errors exits, send 400 with errors object
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

// @route DELETE api/posts/:id
// @desc Delete Post
// @access Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id).then(post => {
        // Check for post owner
        if (post.user.toString() !== req.user.id) {
          return res.status(401).json({ notauthorized: "User not authorized" });
        }

        //Delete
        post
          .remove()
          .then(() =>
            res
              .json({ success: true })
              .catch(err =>
                res.status(404).json({ postnotfound: "No post found" })
              )
          );
      });
    });
  }
);

// @route Post api/posts/like/:id
// @desc Like Post
// @access Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id).then(post => {
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .lenght > 0
        ) {
          return res
            .status(400)
            .json({ alreadyliked: "User already liked this post" });
        }

        // Add user id to likes array
        post.likes.unshift({ user: req.user.id });

        // Save like to database
        post.save().then(post => res.json(post));
      });
    });
  }
);

module.exports = router;
