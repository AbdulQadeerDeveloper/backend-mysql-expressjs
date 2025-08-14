const db = require('../models');

exports.addComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content } = req.body;
    
    const comment = await db.Comment.create({
      content,
      BlogId: blogId,
      UserId: req.user.id
    });
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    const comments = await db.Comment.findAll({
      where: { BlogId: blogId },
      include: [{ model: db.User, attributes: ['id', 'username'] }]
    });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};