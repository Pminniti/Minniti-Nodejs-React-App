const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load Validation
const ValidatePostInput = require("../../Validation/post");

// Load Post Model
const Post = require("../../models/Post");

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

module.exports = router;
