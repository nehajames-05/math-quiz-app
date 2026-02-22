import React, { useState } from 'react';
import axios from 'axios';
import Login from './Login';
import Report from './Report';

const TOTAL_QUESTIONS = 10;
const TIME_LIMIT = 15;

function App() {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [quizDone, setQuizDone] = useState(false);
  const [questionLog, setQuestionLog] = useState([]);

  function generateQuestion() {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operator = Math.random() > 0.5 ? '+' : '-';
    const correctAnswer = operator === '+' ? num1 + num2 : num1 - num2;
    return { num1, num2, operator, correctAnswer };
  }

  function handleLogin(token, username, role) {
    setToken(token);
    setUsername(username);
    setRole(role);
    setScore(0);
    setTotal(0);
    setTimeLeft(TIME_LIMIT);
    setQuizDone(false);
    setFeedback('');
    setAnswer('');
    setQuestionLog([]);
    setQuestion(generateQuestion());
    if (role === 'teacher') setShowReport(true);
  }

  function handleLogout() {
    setToken(null);
    setUsername('');
    setRole('');
    setScore(0);
    setTotal(0);
    setTimeLeft(TIME_LIMIT);
    setQuizDone(false);
    setShowReport(false);
    setQuestionLog([]);
    setQuestion(null);
  }

  function handleRestart() {
    setScore(0);
    setTotal(0);
    setTimeLeft(TIME_LIMIT);
    setQuizDone(false);
    setFeedback('');
    setAnswer('');
    setQuestionLog([]);
    setQuestion(generateQuestion());
  }

  React.useEffect(() => {
    if (!token || quizDone || feedback || role === 'teacher' || !question) return;
    if (timeLeft === 0) { handleTimeUp(); return; }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, token, quizDone, feedback, role, question]);

  async function saveSession(finalLog, finalScore, finalTotal) {
    const accuracy = parseFloat(((finalScore / finalTotal) * 100).toFixed(1));
    await axios.post('http://localhost:5000/api/results/save-session', {
      username,
      score: finalScore,
      total: finalTotal,
      accuracy,
      questions: finalLog
    });
  }

  async function handleTimeUp() {
    const newTotal = total + 1;
    const newLog = [...questionLog, {
      question: `${question.num1} ${question.operator} ${question.num2}`,
      studentAnswer: 'No answer (time up)',
      correctAnswer: String(question.correctAnswer),
      isCorrect: false
    }];
    setTotal(newTotal);
    setQuestionLog(newLog);
    setFeedback('wrong');
    if (newTotal >= TOTAL_QUESTIONS) {
      await saveSession(newLog, score, newTotal);
      setTimeout(() => setQuizDone(true), 1500);
    } else {
      setTimeout(() => {
        setFeedback('');
        setQuestion(generateQuestion());
        setTimeLeft(TIME_LIMIT);
      }, 1500);
    }
  }

  async function handleSubmit() {
    if (answer === '' || feedback) return;
    const isCorrect = parseInt(answer) === question.correctAnswer;
    const newScore = isCorrect ? score + 1 : score;
    const newTotal = total + 1;
    const newLog = [...questionLog, {
      question: `${question.num1} ${question.operator} ${question.num2}`,
      studentAnswer: answer,
      correctAnswer: String(question.correctAnswer),
      isCorrect
    }];
    setScore(newScore);
    setTotal(newTotal);
    setQuestionLog(newLog);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setAnswer('');
    if (newTotal >= TOTAL_QUESTIONS) {
      await saveSession(newLog, newScore, newTotal);
      setTimeout(() => setQuizDone(true), 1500);
    } else {
      setTimeout(() => {
        setFeedback('');
        setQuestion(generateQuestion());
        setTimeLeft(TIME_LIMIT);
      }, 1500);
    }
  }

  if (!token) return <Login onLogin={handleLogin} />;
  if (showReport) return <Report onBack={role === 'teacher' ? handleLogout : () => setShowReport(false)} username={username} role={role} />;

  const accuracy = total > 0 ? ((score / total) * 100).toFixed(1) : 0;
  const timerColor = timeLeft <= 5 ? '#f44336' : timeLeft <= 10 ? '#FF9800' : '#4CAF50';
  const progressPercent = (total / TOTAL_QUESTIONS) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Nunito', sans-serif",
      padding: '20px'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Fredoka+One&display=swap');
        .btn { border: none; border-radius: 12px; cursor: pointer; font-family: 'Fredoka One', sans-serif; letter-spacing: 1px; transition: transform 0.1s, box-shadow 0.1s; }
        .btn:hover { transform: translateY(-2px); }
        .btn:active { transform: translateY(0); }
        .answer-input {
          width: 180px;
          padding: 16px;
          font-size: 28px;
          text-align: center;
          border: 3px solid #e0e0e0;
          border-radius: 16px;
          font-family: 'Fredoka One', sans-serif;
          outline: none;
          transition: border-color 0.2s;
        }
        .answer-input:focus { border-color: #667eea; }
        @keyframes pop { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .pop { animation: pop 0.3s ease; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }
        .shake { animation: shake 0.3s ease; }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
        .pulse { animation: pulse 0.5s ease infinite; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '580px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ color: 'white' }}>
            <div style={{ fontFamily: "'Fredoka One', sans-serif", fontSize: '24px' }}>🧮 MathQuiz</div>
            <div style={{ fontSize: '14px', opacity: 0.85 }}>👋 Hey, {username}!</div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn" onClick={() => setShowReport(true)}
              style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '14px' }}>
              📊 My Reports
            </button>
            <button className="btn" onClick={handleLogout}
              style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '14px' }}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', fontSize: '13px', marginBottom: '6px' }}>
            <span>Question {Math.min(total + 1, TOTAL_QUESTIONS)} of {TOTAL_QUESTIONS}</span>
            <span>{total} completed</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'white',
              borderRadius: '999px',
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>

        {quizDone ? (
          <div style={{ background: 'white', borderRadius: '24px', padding: '48px 40px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>
              {score >= 8 ? '🏆' : score >= 5 ? '🌟' : '💪'}
            </div>
            <h2 style={{ fontFamily: "'Fredoka One', sans-serif", fontSize: '32px', color: '#333', margin: '0 0 8px' }}>
              Quiz Complete!
            </h2>
            <p style={{ color: '#888', marginBottom: '24px' }}>Here's how you did:</p>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '32px' }}>
              {[
                { label: 'Score', value: `${score}/${TOTAL_QUESTIONS}` },
                { label: 'Accuracy', value: `${accuracy}%` },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: "'Fredoka One', sans-serif", fontSize: '36px', color: '#667eea' }}>{s.value}</div>
                  <div style={{ color: '#888', fontSize: '14px' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn" onClick={handleRestart} style={{
                padding: '14px 32px',
                fontSize: '18px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(102,126,234,0.4)'
              }}>
                🔄 Play Again
              </button>
              <button className="btn" onClick={() => setShowReport(true)} style={{
                padding: '14px 32px',
                fontSize: '18px',
                background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(245,87,108,0.4)'
              }}>
                📊 My Reports
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '16px 24px', marginBottom: '16px', color: 'white' }}>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>📘 Solve each addition or subtraction question before the timer runs out!</p>
            </div>

            <div style={{ background: 'white', borderRadius: '24px', padding: '40px', textAlign: 'center', marginBottom: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
              <div style={{ marginBottom: '20px' }}>
                <div className={timeLeft <= 5 ? 'pulse' : ''} style={{
                  display: 'inline-block',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: timerColor,
                  color: 'white',
                  fontFamily: "'Fredoka One', sans-serif",
                  fontSize: '24px',
                  lineHeight: '60px',
                  transition: 'background 0.3s'
                }}>
                  {timeLeft}
                </div>
              </div>

              <div key={total} className="pop" style={{
                fontFamily: "'Fredoka One', sans-serif",
                fontSize: '56px',
                color: '#333',
                marginBottom: '28px',
                letterSpacing: '4px'
              }}>
                {question && `${question.num1} ${question.operator} ${question.num2} = ?`}
              </div>

              <input
                className="answer-input"
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="?"
                autoFocus
                disabled={!!feedback}
              />

              <br /><br />

              <button className="btn" onClick={handleSubmit} disabled={!!feedback} style={{
                padding: '14px 48px',
                fontSize: '20px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
                opacity: feedback ? 0.7 : 1
              }}>
                Submit ✨
              </button>

              {feedback && (
                <div className={feedback === 'correct' ? 'pop' : 'shake'} style={{
                  marginTop: '20px',
                  fontSize: '28px',
                  fontFamily: "'Fredoka One', sans-serif",
                  color: feedback === 'correct' ? '#4CAF50' : '#f44336'
                }}>
                  {feedback === 'correct' ? '✅ Correct!' : timeLeft === 0 ? `⏰ Time's up! Answer: ${question?.correctAnswer}` : `❌ Wrong! Answer: ${question?.correctAnswer}`}
                </div>
              )}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '20px 28px', color: 'white', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              {[
                { label: 'Correct', value: score },
                { label: 'Total', value: total },
                { label: 'Accuracy', value: `${accuracy}%` }
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: "'Fredoka One', sans-serif", fontSize: '32px' }}>{s.value}</div>
                  <div style={{ fontSize: '13px', opacity: 0.85 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;