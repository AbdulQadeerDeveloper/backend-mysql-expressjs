const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const config = require("../config/config");
const basename = path.basename(__filename);
const db = {};

// Sequelize connection
const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  {
    host: config.development.host,
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Load all models in current folder
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Define associations (after models are loaded)
if (db.User && db.Blog && db.Comment && db.Like) {
  db.User.hasMany(db.Blog, { foreignKey: "UserId" });
  db.Blog.belongsTo(db.User, { foreignKey: "UserId" });

  db.Blog.hasMany(db.Comment, { foreignKey: "BlogId" });
  db.Comment.belongsTo(db.Blog, { foreignKey: "BlogId" });

  db.User.hasMany(db.Comment, { foreignKey: "UserId" });
  db.Comment.belongsTo(db.User, { foreignKey: "UserId" });

  // Many-to-many relationship through Like model
  db.Blog.belongsToMany(db.User, { through: db.Like, foreignKey: "BlogId" });
  db.User.belongsToMany(db.Blog, { through: db.Like, foreignKey: "UserId" });

  // Direct relationships for easier querying
  db.Blog.hasMany(db.Like, { foreignKey: "BlogId", as: "likes" });
  db.Like.belongsTo(db.Blog, { foreignKey: "BlogId" });
  db.Like.belongsTo(db.User, { foreignKey: "UserId" });

  db.Category.hasMany(db.Blog, { foreignKey: "CategoryId" });
  db.Blog.belongsTo(db.Category, { foreignKey: "CategoryId" });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
