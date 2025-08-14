const authRoutes = require('./src/routes/authRoutes');
const blogRoutes = require('./src/routes/blogRoute');
const categoryRoutes = require("./src/routes/categoryRoute");

module.exports = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/blogs', blogRoutes);
  app.use("/api/categories", categoryRoutes);

};