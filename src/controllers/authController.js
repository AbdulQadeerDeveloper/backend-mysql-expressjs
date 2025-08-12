const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// REGISTER
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const [existing] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const userId = result.insertId;

    // Generate JWT (just return to frontend, not save in DB yet)
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ 
      message: 'User registered successfully', 
      token 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    console.log('Query result:', rows); 

    const user = rows[0];
    console.log('User from DB:', user);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials (no user found)' });
    }

    if (!user.password) {
      return res.status(500).json({ error: 'User has no password in DB' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await db.query('UPDATE users SET token = ? WHERE id = ?', [token, user.id]);

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
