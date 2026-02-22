import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Report({ onBack, username, role }) {
  const [sessions, setSessions] = useState([]);
  const [expandedSession, setExpandedSession] = useState(null);
  const [sessionQuestions, setSessionQuestions] = useState({});

  useEffect(() => {
    async function fetchSessions() {
      const url = role === 'teacher'
        ? 'http://localhost:5000/api/results/all'
        : `http://localhost:5000/api/results/mine/${username}`;
      const res = await axios.get(url);
      setSessions(res.data);
    }
    fetchSessions();
  }, [username, role]);

  async function handleExpandSession(sessionId) {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
      return;
    }
    setExpandedSession(sessionId);
    if (!sessionQuestions[sessionId]) {
      const res = await axios.get(`http://localhost:5000/api/results/session/${sessionId}`);
      setSessionQuestions(prev => ({ ...prev, [sessionId]: res.data }));
    }
  }

  const isTeacher = role === 'teacher';

  return (
    <div style={{
      minHeight: '100vh',
      background: isTeacher
        ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: "'Nunito', sans-serif",
      padding: '40px 20px'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Fredoka+One&display=swap');
        .btn { border: none; border-radius: 12px; cursor: pointer; font-family: 'Fredoka One', sans-serif; letter-spacing: 1px; transition: transform 0.1s; }
        .btn:hover { transform: translateY(-2px); }
        .session-row { cursor: pointer; transition: background 0.2s; }
        .session-row:hover { background: #f0f0ff !important; }
      `}</style>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ color: 'white' }}>
            <h1 style={{ fontFamily: "'Fredoka One', sans-serif", fontSize: '32px', margin: 0 }}>
              {isTeacher ? '👩‍🏫 Teacher Dashboard' : '📊 My Reports'}
            </h1>
            <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: '14px' }}>
              {isTeacher ? 'All students performance overview' : `Your quiz history, ${username}!`}
            </p>
          </div>
          <button className="btn" onClick={onBack} style={{
            padding: '12px 24px',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontSize: '16px'
          }}>
            {isTeacher ? '🚪 Logout' : '← Back to Quiz'}
          </button>
        </div>

        {/* Summary Stats */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Sessions', value: sessions.length, icon: '📝' },
            {
              label: 'Avg Accuracy',
              value: sessions.length > 0
                ? (sessions.reduce((a, b) => a + b.accuracy, 0) / sessions.length).toFixed(1) + '%'
                : '0%',
              icon: '🎯'
            },
            isTeacher
              ? { label: 'Students', value: [...new Set(sessions.map(r => r.username))].length, icon: '👤' }
              : { label: 'Best Score', value: sessions.length > 0 ? Math.max(...sessions.map(r => r.score)) + '/10' : 'N/A', icon: '🏆' }
          ].map((stat, i) => (
            <div key={i} style={{
              flex: 1,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: '28px' }}>{stat.icon}</div>
              <div style={{ fontFamily: "'Fredoka One', sans-serif", fontSize: '28px' }}>{stat.value}</div>
              <div style={{ fontSize: '13px', opacity: 0.85 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Sessions */}
        <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isTeacher ? '1.5fr 1fr 1fr 1fr 1.5fr 0.5fr' : '1fr 1fr 1fr 1.5fr 0.5fr',
            background: isTeacher
              ? 'linear-gradient(135deg, #f093fb, #f5576c)'
              : 'linear-gradient(135deg, #667eea, #764ba2)',
            padding: '16px'
          }}>
            {(isTeacher ? ['Student', 'Score', 'Total', 'Accuracy', 'Date', ''] : ['Score', 'Total', 'Accuracy', 'Date', '']).map((h, i) => (
              <div key={i} style={{
                color: 'white',
                fontFamily: "'Fredoka One', sans-serif",
                fontSize: '15px',
                letterSpacing: '1px',
                textAlign: 'center'
              }}>{h}</div>
            ))}
          </div>

          {sessions.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '16px' }}>
              {isTeacher ? 'No sessions yet! Students need to take the quiz 📝' : 'No sessions yet! Go take the quiz 🎯'}
            </div>
          ) : (
            sessions.map((s, i) => (
              <div key={s.id}>
                {/* Session Row */}
                <div
                  className="session-row"
                  onClick={() => handleExpandSession(s.id)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isTeacher ? '1.5fr 1fr 1fr 1fr 1.5fr 0.5fr' : '1fr 1fr 1fr 1.5fr 0.5fr',
                    padding: '16px',
                    background: i % 2 === 0 ? '#fafafa' : 'white',
                    alignItems: 'center'
                  }}
                >
                  {isTeacher && (
                    <div style={{ textAlign: 'center', fontWeight: '700', color: '#555' }}>👤 {s.username}</div>
                  )}
                  <div style={{ textAlign: 'center', color: '#4CAF50', fontWeight: '700', fontSize: '18px' }}>{s.score}</div>
                  <div style={{ textAlign: 'center', color: '#666' }}>{s.total}</div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{
                      background: s.accuracy >= 70 ? '#e8f5e9' : '#ffebee',
                      color: s.accuracy >= 70 ? '#2e7d32' : '#c62828',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontWeight: '700',
                      fontSize: '14px'
                    }}>
                      {s.accuracy}%
                    </span>
                  </div>
                  <div style={{ textAlign: 'center', color: '#999', fontSize: '13px' }}>
                    {new Date(s.date).toLocaleString()}
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '18px' }}>
                    {expandedSession === s.id ? '🔼' : '🔽'}
                  </div>
                </div>

                {/* Expanded Questions */}
                {expandedSession === s.id && (
                  <div style={{ background: '#f8f0ff', padding: '16px 24px', borderTop: '2px solid #e0d0ff' }}>
                    <h4 style={{ fontFamily: "'Fredoka One', sans-serif", color: '#667eea', marginTop: 0 }}>
                      📋 Question Breakdown
                    </h4>
                    {!sessionQuestions[s.id] ? (
                      <p style={{ color: '#888' }}>Loading...</p>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#ede0ff' }}>
                            {['#', 'Question', 'Student Answer', 'Correct Answer', 'Result'].map((h) => (
                              <th key={h} style={{ padding: '10px', textAlign: 'center', color: '#555', fontSize: '13px', fontWeight: '700' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sessionQuestions[s.id].map((q, idx) => (
                            <tr key={q.id} style={{ background: idx % 2 === 0 ? 'white' : '#faf5ff' }}>
                              <td style={{ padding: '10px', textAlign: 'center', color: '#888', fontSize: '14px' }}>{idx + 1}</td>
                              <td style={{ padding: '10px', textAlign: 'center', fontFamily: "'Fredoka One', sans-serif", fontSize: '16px', color: '#333' }}>{q.question} = ?</td>
                              <td style={{ padding: '10px', textAlign: 'center', color: q.is_correct ? '#4CAF50' : '#f44336', fontWeight: '700' }}>{q.student_answer}</td>
                              <td style={{ padding: '10px', textAlign: 'center', color: '#555', fontWeight: '700' }}>{q.correct_answer}</td>
                              <td style={{ padding: '10px', textAlign: 'center', fontSize: '20px' }}>{q.is_correct ? '✅' : '❌'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Report;