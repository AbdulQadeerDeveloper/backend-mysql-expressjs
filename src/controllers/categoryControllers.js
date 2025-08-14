const db = require("../models");

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await db.Category.create({ name });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await db.Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single category with blogs
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await db.Category.findByPk(id, {
      include: [{ model: db.Blog }]
    });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await db.Category.findByPk(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const { name } = req.body;
    await category.update({ name: name || category.name });
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await db.Category.findByPk(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    await category.destroy();
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
