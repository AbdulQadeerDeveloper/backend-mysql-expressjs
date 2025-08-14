const jwt = require('jsonwebtoken');
const db = require('../models');
const config = require('../config/config');

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Naya user create
    const user = await db.User.create({ username, email, password });

    // Token generate
    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Token save in DB
    user.token = token;
    await user.save();

    res.status(201).json({ 
      message: 'User created successfully',
      token 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.User.findOne({ where: { email } });
    
    if (!user || !user.validPassword(password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Token generate
    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Token save in DB
    user.token = token;
    await user.save();

    res.json({ 
      message: 'Login successful',
      token 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
