module.exports = (sequelize, DataTypes) => {
  const Blog = sequelize.define(
    "Blog",
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tags: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      imageUrl: DataTypes.STRING,
      deletedAt: DataTypes.DATE,
    },
    {
      paranoid: true, // Soft delete enabled
      timestamps: true,
    }
  );
  // Relationships
  Blog.associate = (models) => {
    // Blog belongs to Category
    Blog.belongsTo(models.Category, {
      foreignKey: "CategoryId",
      as: "category", 
      onDelete: "CASCADE",
    });

    // Blog belongs to User
    Blog.belongsTo(models.User, {
      foreignKey: "UserId",
      as: "author",
      onDelete: "CASCADE",
    });

    // Blog has many Comments
    Blog.hasMany(models.Comment, {
      foreignKey: "BlogId",
      as: "comments",
      onDelete: "CASCADE",
    });

    // Blog has many Likes
    Blog.hasMany(models.Like, {
      foreignKey: "BlogId",
      as: "likes",
      onDelete: "CASCADE",
    });
  };

  return Blog;
};
