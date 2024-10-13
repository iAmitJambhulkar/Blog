const express = require("express");
const multer = require('multer');
const path = require('path');
const Blog = require('../models/blog');
const Comment = require("../models/comment");
const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(`./public/uploads/`));
    },
    filename: function (req, file, cb) {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

// Route to render the 'addBlog' view
router.get('/add-new', (req, res) => {
    return res.render('addBlog', {
        user: req.user,
    });
});

// Route to render a specific blog post and its comments
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('createdBy');
    const comment = await Comment.find({ blogId: req.params.id }).populate('createdBy');
    return res.render('blog', {
      user: req.user,
      blog,
      comment, // Changed variable name to 'comments'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server Error');
  }
});

// Route to handle new comments on a blog post
router.post('/comment/:blogId', async (req, res) => {
  try {
    await Comment.create({
      content: req.body.content,
      blogId: req.params.blogId,
      createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`); // Use res.redirect instead of res.render
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server Error');
  }
});

// Route to handle the creation of a new blog post
router.post('/', upload.single("coverImage"), async (req, res) => {
    try {
      const { title, body } = req.body;
      const blog = await Blog.create({
        title,
        body,
        createdBy: req.user._id,
        coverImageURL: `/uploads/${req.file.filename}`
      });
      return res.redirect(`/blog/${blog._id}`);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Server Error');
    }
});

module.exports = router;
