const db = require("../config/database");

// Utility: normalize tags to array
function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(tag => tag.trim());
  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed.map(tag => tag.trim());
    } catch {
      return tags.split(",").map(tag => tag.trim());
    }
  }
  return [];
}

// CREATE BLOG
exports.createBlog = async (req, res) => {
  try {
    const { title, content, tags, category } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const userId = req.user.id; // from JWT middleware

    if (!title || !content || !category) {
      return res.status(400).json({ error: "Title, content, and category are required" });
    }

    const tagsArray = normalizeTags(tags);

    const [result] = await db.query(
      `INSERT INTO blogs (title, content, tags, category, image_url, user_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, content, JSON.stringify(tagsArray), category, image_url, userId]
    );

    res.status(201).json({
      message: "Blog created successfully",
      blogId: result.insertId
    });

  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET ALL BLOGS
exports.getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    const category = req.query.category || "";

    let query = "SELECT * FROM blogs WHERE deleted_at IS NULL";
    let params = [];

    if (search) {
      query += " AND (title LIKE ? OR content LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    // Count
    const [countResult] = await db.query(
      query.replace("SELECT *", "SELECT COUNT(*) AS total"),
      params
    );
    const total = countResult[0].total;

    // Pagination
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [blogs] = await db.query(query, params);

    for (const blog of blogs) {
      const [likes] = await db.query(
        "SELECT COUNT(*) AS count FROM likes WHERE blog_id = ?",
        [blog.id]
      );
      const [comments] = await db.query(
        "SELECT COUNT(*) AS count FROM comments WHERE blog_id = ?",
        [blog.id]
      );
      blog.likes = likes[0].count;
      blog.comments = comments[0].count;
      try {
        blog.tags = JSON.parse(blog.tags || "[]");
      } catch {
        blog.tags = [];
      }
    }

    res.json({
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      blogs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET BLOG BY ID
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const [blogs] = await db.query(
      "SELECT * FROM blogs WHERE id = ? AND deleted_at IS NULL",
      [id]
    );

    if (blogs.length === 0) {
      return res.status(404).json({ error: "Blog not found" });
    }

    const blog = blogs[0];

    const [users] = await db.query(
      "SELECT id, username FROM users WHERE id = ?",
      [blog.user_id]
    );
    blog.author = users[0];

    const [likes] = await db.query(
      "SELECT COUNT(*) AS count FROM likes WHERE blog_id = ?",
      [blog.id]
    );
    blog.likes = likes[0].count;

    if (req.user) {
      const [userLike] = await db.query(
        "SELECT * FROM likes WHERE blog_id = ? AND user_id = ?",
        [blog.id, req.user.id]
      );
      blog.userLiked = userLike.length > 0;
    }

    try {
      blog.tags = JSON.parse(blog.tags || "[]");
    } catch {
      blog.tags = [];
    }

    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE BLOG
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, content, tags, category } = req.body;

    const [blogs] = await db.query("SELECT * FROM blogs WHERE id = ?", [id]);
    if (blogs.length === 0) {
      return res.status(404).json({ error: "Blog not found" });
    }
    if (blogs[0].user_id !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const tagsArray = normalizeTags(tags);

    let image_url = blogs[0].image_url;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    await db.query(
      `UPDATE blogs SET 
      title = ?, content = ?, tags = ?, category = ?, image_url = ?
      WHERE id = ?`,
      [title, content, JSON.stringify(tagsArray), category, image_url, id]
    );

    const [updatedBlog] = await db.query("SELECT * FROM blogs WHERE id = ?", [id]);
    try {
      updatedBlog[0].tags = JSON.parse(updatedBlog[0].tags || "[]");
    } catch {
      updatedBlog[0].tags = [];
    }

    res.json(updatedBlog[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE BLOG
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [blogs] = await db.query("SELECT * FROM blogs WHERE id = ?", [id]);
    if (blogs.length === 0) {
      return res.status(404).json({ error: "Blog not found" });
    }
    if (blogs[0].user_id !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await db.query(
      "UPDATE blogs SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LIKE / UNLIKE BLOG
exports.likeBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [existing] = await db.query(
      "SELECT * FROM likes WHERE blog_id = ? AND user_id = ?",
      [id, userId]
    );

    if (existing.length > 0) {
      await db.query("DELETE FROM likes WHERE blog_id = ? AND user_id = ?", [id, userId]);
      res.json({ liked: false });
    } else {
      await db.query("INSERT INTO likes (blog_id, user_id) VALUES (?, ?)", [id, userId]);
      res.json({ liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// GET all blogs with pagination & search
exports.getAllBlogs = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;

    // Convert to numbers
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    // Search query
    const searchQuery = `%${search}%`;

    // Count total results
    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total 
       FROM blogs 
       WHERE title LIKE ? 
          OR content LIKE ? 
          OR category LIKE ? 
          OR tags LIKE ?`,
      [searchQuery, searchQuery, searchQuery, searchQuery]
    );
    const total = countResult[0].total;

    // Get paginated results
    const [blogs] = await db.query(
      `SELECT * 
       FROM blogs 
       WHERE title LIKE ? 
          OR content LIKE ? 
          OR category LIKE ? 
          OR tags LIKE ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [searchQuery, searchQuery, searchQuery, searchQuery, limit, offset]
    );

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      blogs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
