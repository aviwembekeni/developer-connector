const express = require("express");
const router = express.Router();
const passport = require("passport");

// Post model
const Post = require("../../models/Post");

// Profile model
const Profile = require("../../models/Profile");
//Validation
const ValidatePostInput = require("../../validation/post");

// @route           GET api/posts/tests
// @description     Tests post route
// @access          Public

router.get("/test", (req, res) => res.json({ msg: "posts works" }));

// @route           GET api/posts
// @description     Get posts
// @access          Public

router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ noPostsFound: "No posts found" }));
});

// @route           GET api/posts/:id
// @description     Get post by id
// @access          Public

router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(posts => res.json(posts))
    .catch(err =>
      res.status(404).json({ noPostFound: "No post found with that id" })
    );
});

// @route           POST api/posts
// @description     Create post
// @access          Private

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = ValidatePostInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.body.id
    });

    //save
    newPost.save().then(post => res.json(post));
  }
);

// @route           DELETE api/posts/:id
// @description     Delete post by id
// @access          Private

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            //check for owner
            if (post.user.toString() !== req.user.id) {
              return res
                .status(401)
                .json({ notAuthorized: "User not authorized" });
            }

            //Delete
            post.remove().then(() => res.json({ success: true }));
          })
          .catch(err => res.status(404).json({ noPostFound: "no post found" }));
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route           POST api/posts/like/:id
// @description     Like post
// @access          Private

router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            if (
              post.likes.filter(like => like.user.toString() === req.user.id)
                .length > 0
            ) {
              return res
                .status(400)
                .json({ alreadyLiked: "User already liked this post" });
            }

            // Add user id to array
            post.likes.unshift({ user: req.user.id });

            //save
            post.save().then(post => res.json(post));
          })
          .catch(err => res.status(404).json({ noPostFound: "no post found" }));
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route           POST api/posts/like/:id
// @description     Unlike post
// @access          Private

router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            if (
              post.likes.filter(like => like.user.toString() === req.user.id)
                .length === 0
            ) {
              return res
                .status(400)
                .json({ notLiked: "You have not yet liked this post" });
            }

            // Get remove index
            const removeIndex = post.likes
              .map(item => item.user.toString())
              .indexOf(req.user.id);

            //Splice out of array
            post.linkes.splice(removeIndex, 1);

            //save
            post.save().then(post => res.json(post));
          })
          .catch(err => res.status(404).json({ noPostFound: "no post found" }));
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route           POST api/posts/comment/:id
// @description     Add comment to post
// @access          Private

router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = ValidatePostInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.body.id
        };

        // Add comments to array
        post.comments.push(newComment);

        //save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ noPostFound: "no post found" }));
  }
);

// @route           DELETE api/posts/comment/:id/:comment_id
// @description     Delete comment to post
// @access          Private

router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        //Chek if comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).lenth === 0
        ) {
          return res
            .status(404)
            .json({ commentNotExists: "comment does not exist" });
        }

        // Get remove index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        // Splice comment out of array
        post.comments.splice(removeIndex, 1);
        //save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ noPostFound: "no post found" }));
  }
);
module.exports = router;
