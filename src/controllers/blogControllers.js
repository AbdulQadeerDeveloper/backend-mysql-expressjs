const db = require("../models");
const { Op } = require("sequelize");

// Create blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content, tags, CategoryId } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    // Validate category
    const category = await db.Category.findByPk(CategoryId);
    if (!category) {
      return res.status(400).json({ message: "Invalid CategoryId" });
    }

    const blog = await db.Blog.create({
      title,
      content,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      CategoryId,
      imageUrl,
      UserId: req.user.id, // assuming user is logged in
    });

    // Return blog with category details
    const blogWithCategory = await db.Blog.findByPk(blog.id, {
      include: [
        { model: db.User, attributes: ["id", "username"] },
        { model: db.Category, attributes: ["id", "name"] },
      ],
    });

    res.status(201).json(blogWithCategory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update blog
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await db.Blog.findOne({ where: { id, UserId: req.user.id } });

    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found or unauthorized" });
    }

    const { title, content, tags, CategoryId } = req.body;
    const imageUrl = req.file ? req.file.path : blog.imageUrl;

    if (CategoryId) {
      const category = await db.Category.findByPk(CategoryId);
      if (!category) {
        return res.status(400).json({ message: "Invalid CategoryId" });
      }
    }

    await blog.update({
      title: title || blog.title,
      content: content || blog.content,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : blog.tags,
      CategoryId: CategoryId || blog.CategoryId,
      imageUrl,
    });

    const updatedBlog = await db.Blog.findByPk(blog.id, {
      include: [
        { model: db.User, attributes: ["id", "username"] },
        { model: db.Category, attributes: ["id", "name"] },
      ],
    });

    res.json(updatedBlog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete blog
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await db.Blog.findOne({ where: { id, UserId: req.user.id } });

    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found or unauthorized" });
    }

    await blog.destroy();
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single blog with category & likes
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await db.Blog.findByPk(id, {
      include: [
        { model: db.User, attributes: ["id", "username"] },
        { model: db.Category, attributes: ["id", "name"] },
        {
          model: db.Comment,
          include: [{ model: db.User, attributes: ["id", "username"] }],
        },
        { model: db.Like, as: "likes" },
      ],
    });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const likeCount = await db.Like.count({ where: { BlogId: id } });
    const blogData = blog.get({ plain: true });
    blogData.likeCount = likeCount;

    res.json(blogData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all blogs with category name
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await db.Blog.findAll({
      include: [
        { model: db.User, attributes: ["id", "username", "email"] },
        { model: db.Category, attributes: ["id", "name"] },
        {
          model: db.Comment,
          attributes: ["id", "content", "createdAt"],
          include: [{ model: db.User, attributes: ["id", "username"] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const blogsWithLikes = await Promise.all(
      blogs.map(async (blog) => {
        const blogData = blog.get({ plain: true });
        const likeCount = await db.Like.count({ where: { BlogId: blog.id } });
        return { ...blogData, likeCount };
      })
    );

    res.json(blogsWithLikes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
