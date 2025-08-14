const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogControllers');
const commentController = require('../controllers/commentControllers');
const likeController = require('../controllers/likeController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, upload.single('image'), blogController.createBlog);
router.put('/:id', auth, upload.single('image'), blogController.updateBlog);
router.delete('/:id', auth, blogController.deleteBlog);
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);

// Comments
router.post('/:blogId/comments', auth, commentController.addComment);
router.get('/:blogId/comments', commentController.getComments);

// Likes
router.post('/:blogId/like', auth, likeController.likeBlog);
router.delete('/:blogId/like', auth, likeController.unlikeBlog);

module.exports = router;