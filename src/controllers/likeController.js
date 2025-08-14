const db = require('../models');

exports.likeBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user.id;
    
    // Check if already liked
    const existingLike = await db.Like.findOne({ 
      where: { BlogId: blogId, UserId: userId } 
    });
    
    if (existingLike) {
      return res.status(400).json({ message: 'Blog already liked' });
    }
    
    await db.Like.create({
      BlogId: blogId,
      UserId: userId
    });
    
    res.status(201).json({ message: 'Blog liked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.unlikeBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user.id;
    
    const result = await db.Like.destroy({
      where: { BlogId: blogId, UserId: userId }
    });
    
    if (!result) {
      return res.status(404).json({ message: 'Like not found' });
    }
    
    res.json({ message: 'Blog unliked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};