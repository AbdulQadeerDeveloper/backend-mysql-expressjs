require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config/database');
const path = require('path');
const swaggerDocs = require("../swagger.js");
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/userRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

// Test DB connection
db.query('SELECT 1')
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection failed:', err));

// Create uploads folder if not exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Swagger Docs
swaggerDocs(app);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
