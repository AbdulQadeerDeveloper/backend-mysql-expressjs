const db = require("../models");
const { Op } = require("sequelize");

exports.createBlog = async (req, res) => {
  try {
    const { title, content, tags, category } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    const blog = await db.Blog.create({
      title,
      content,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      category,
      imageUrl,
      UserId: req.user.id,
    });

    res.status(201).json(blog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await db.Blog.findOne({ where: { id, UserId: req.user.id } });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found or unauthorized" });
    }

    const { title, content, tags, category } = req.body;
    const imageUrl = req.file ? req.file.path : blog.imageUrl;

    await blog.update({
      title: title || blog.title,
      content: content || blog.content,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : blog.tags,
      category: category || blog.category,
      imageUrl,
    });

    res.json(blog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await db.Blog.findOne({ where: { id, UserId: req.user.id } });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found or unauthorized" });
    }

    await blog.destroy();
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await db.Blog.findByPk(id, {
      include: [
        { model: db.User, attributes: ["id", "username"] },
        { 
          model: db.Comment, 
          include: [db.User] 
        },
        { 
          model: db.Like,
          as: 'likes'
        },
      ],
    });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Add like count
    const likeCount = await db.Like.count({ where: { BlogId: id } });
    const blogData = blog.get({ plain: true });
    blogData.likeCount = likeCount;

    res.json(blogData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await db.Blog.findAll({
      include: [
        {
          model: db.User,
          attributes: ["id", "username", "email"],
        },
        {
          model: db.Comment,
          attributes: ["id", "content", "createdAt"],
          include: [
            {
              model: db.User,
              attributes: ["id", "username"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Get like counts for all blogs
    const blogsWithLikes = await Promise.all(blogs.map(async blog => {
      const blogData = blog.get({ plain: true });
      const likeCount = await db.Like.count({ where: { BlogId: blog.id } });
      return {
        ...blogData,
        likeCount
      };
    }));

    res.json(blogsWithLikes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};