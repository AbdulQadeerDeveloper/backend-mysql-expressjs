const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  // Define categories directly in the model
  const CATEGORIES = ['Technology', 'Lifestyle', 'Travel', 'Food', 'Fashion'];
  
  const Blog = sequelize.define('Blog', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    category: {
      type: DataTypes.ENUM(...CATEGORIES),
      allowNull: false
    },
    imageUrl: DataTypes.STRING,
    deletedAt: DataTypes.DATE
  }, {
    paranoid: true,
    timestamps: true
  });
  return Blog;
};