const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/authMiddleware');

// Comments for a blog
router.post('/:id', auth, commentController.addComment);       // Add comment to blog_id
router.get('/:id', commentController.getComments);             // Get comments for blog_id
// Get all comments
router.get('/', commentController.getAllComments);
// Manage specific comment
router.put('/update/:id', auth, commentController.updateComment);  // Update comment_id
router.delete('/delete/:id', auth, commentController.deleteComment); // Delete comment_id

module.exports = router;
