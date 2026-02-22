const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const db = new Database('quiz.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'student'
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    score INTEGER,
    total INTEGER,
    accuracy REAL,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    question TEXT,
    student_answer TEXT,
    correct_answer TEXT,
    is_correct INTEGER
  );
`);

// Pre-create teacher accounts
const teachers = [
  { username: 'teacher1', password: 'teach123' },
  { username: 'teacher2', password: 'teach456' }
];

teachers.forEach(({ username, password }) => {
  const existing = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!existing) {
    const hashed = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(username, hashed, 'teacher');
    console.log(`Teacher account created: ${username}`);
  }
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes(db));

const resultsRoutes = require('./routes/results');
app.use('/api/results', resultsRoutes(db));

app.get('/', (req, res) => res.send('Server is running!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));