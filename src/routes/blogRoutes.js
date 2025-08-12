const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);

// Protected routes

router.post('/', auth, upload.single('image'), blogController.createBlog);


router.put('/:id', auth, upload.single('image'), blogController.updateBlog);
router.delete('/:id', auth, blogController.deleteBlog);
router.post('/:id/like', auth, blogController.likeBlog);


// GET /api/blogs?page=1&limit=5&search=node
router.get('/', auth, blogController.getAllBlogs);
module.exports = router;