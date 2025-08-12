const db = require('../config/database');

// ADD COMMENT
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params; // blog_id
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const [result] = await db.query(
      'INSERT INTO comments (content, blog_id, user_id) VALUES (?, ?, ?)',
      [content, id, userId]
    );

    const commentId = result.insertId;

    const [comments] = await db.query(
      `SELECT c.*, u.username 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.id = ?`,
      [commentId]
    );

    res.status(201).json(comments[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET COMMENTS BY BLOG
exports.getComments = async (req, res) => {
  try {
    const { id } = req.params; // blog_id

    const [comments] = await db.query(
      `SELECT c.*, u.username 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.blog_id = ? 
       ORDER BY c.created_at DESC`,
      [id]
    );

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE COMMENT
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params; // comment_id
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Ensure the comment belongs to the user
    const [existing] = await db.query(
      'SELECT * FROM comments WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (existing.length === 0) {
      return res.status(403).json({ error: 'You can only update your own comments' });
    }

    await db.query(
      'UPDATE comments SET content = ? WHERE id = ? AND user_id = ?',
      [content, id, userId]
    );

    res.json({ message: 'Comment updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE COMMENT
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params; // comment_id
    const userId = req.user.id;

    // Ensure the comment belongs to the user
    const [existing] = await db.query(
      'SELECT * FROM comments WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (existing.length === 0) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    await db.query('DELETE FROM comments WHERE id = ? AND user_id = ?', [id, userId]);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// GET ALL COMMENTS
exports.getAllComments = async (req, res) => {
  try {
    const [comments] = await db.query(
      `SELECT c.*, u.username, b.title AS blog_title
       FROM comments c
       JOIN users u ON c.user_id = u.id
       JOIN blogs b ON c.blog_id = b.id
       ORDER BY c.created_at DESC`
    );
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
