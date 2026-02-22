const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (db) => {
  // Register route (students only)
  router.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashed = bcrypt.hashSync(password, 10);
    try {
      const stmt = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
      stmt.run(username, hashed, 'student');
      res.json({ message: 'User created successfully!' });
    } catch (err) {
      res.status(400).json({ message: 'Username already exists!' });
    }
  });

  // Login route
  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) return res.status(400).json({ message: 'User not found!' });
    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) return res.status(400).json({ message: 'Wrong password!' });
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, 'secretkey', { expiresIn: '1d' });
    res.json({ token, username: user.username, role: user.role });
  });

  return router;
};