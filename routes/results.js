const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Save a full session with all questions
  router.post('/save-session', (req, res) => {
    const { username, score, total, accuracy, questions } = req.body;
    const date = new Date().toISOString();
    try {
      // Save session
      const session = db.prepare('INSERT INTO sessions (username, score, total, accuracy, date) VALUES (?, ?, ?, ?, ?)');
      const result = session.run(username, score, total, accuracy, date);
      const sessionId = result.lastInsertRowid;

      // Save each question
      const qStmt = db.prepare('INSERT INTO questions (session_id, question, student_answer, correct_answer, is_correct) VALUES (?, ?, ?, ?, ?)');
      questions.forEach(q => {
        qStmt.run(sessionId, q.question, q.studentAnswer, q.correctAnswer, q.isCorrect ? 1 : 0);
      });

      res.json({ message: 'Session saved!' });
    } catch (err) {
      console.error('Error saving session:', err.message);
      res.status(500).json({ message: err.message });
    }
  });

  // Get all sessions (teacher)
  router.get('/all', (req, res) => {
    try {
      const sessions = db.prepare('SELECT * FROM sessions ORDER BY date DESC').all();
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching sessions' });
    }
  });

  // Get sessions for a specific student
  router.get('/mine/:username', (req, res) => {
    try {
      const sessions = db.prepare('SELECT * FROM sessions WHERE username = ? ORDER BY date DESC').all(req.params.username);
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching sessions' });
    }
  });

  // Get questions for a specific session
  router.get('/session/:id', (req, res) => {
    try {
      const questions = db.prepare('SELECT * FROM questions WHERE session_id = ?').all(req.params.id);
      res.json(questions);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching questions' });
    }
  });

  return router;
};