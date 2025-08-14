const authRoutes = require('./src/routes/authRoutes');
const blogRoutes = require('./src/routes/blogRoute');

module.exports = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/blogs', blogRoutes);
};