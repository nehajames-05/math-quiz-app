import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit() {
    if (!username || !password) return;
    const url = isRegister
      ? 'http://localhost:5000/api/auth/register'
      : 'http://localhost:5000/api/auth/login';
    try {
      const res = await axios.post(url, { username, password });
      if (isRegister) {
        setMessage('Account created! Please login.');
        setIsRegister(false);
      } else {
        if (isTeacher && res.data.role !== 'teacher') {
          setMessage('This account is not a teacher account!');
          return;
        }
        if (!isTeacher && res.data.role === 'teacher') {
          setMessage('Please use Teacher Login for this account!');
          return;
        }
        onLogin(res.data.token, res.data.username, res.data.role);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong!');
    }
  }

  function switchMode(teacher) {
    setIsTeacher(teacher);
    setIsRegister(false);
    setMessage('');
    setUsername('');
    setPassword('');
  }

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
        .input-field {
          width: 100%;
          padding: 14px 16px;
          border: 3px solid #e0e0e0;
          border-radius: 12px;
          font-size: 16px;
          font-family: 'Nunito', sans-serif;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
          margin-bottom: 14px;
        }
        .input-field:focus { border-color: #667eea; }
        .btn-main {
          width: 100%;
          padding: 14px;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-family: 'Fredoka One', sans-serif;
          cursor: pointer;
          letter-spacing: 1px;
          transition: transform 0.1s, box-shadow 0.1s;
        }
        .btn-main:hover { transform: translateY(-2px); }
        .btn-main:active { transform: translateY(0); }
        .tab-btn {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-family: 'Fredoka One', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 1px;
        }
        .toggle-link { color: #667eea; cursor: pointer; font-weight: 700; }
        .toggle-link:hover { text-decoration: underline; }
      `}</style>

      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '56px', marginBottom: '8px' }}>🧮</div>
          <h1 style={{ fontFamily: "'Fredoka One', sans-serif", fontSize: '32px', color: '#333', margin: 0 }}>
            MathQuiz
          </h1>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <button
            className="tab-btn"
            onClick={() => switchMode(false)}
            style={{
              background: !isTeacher ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f0f0f0',
              color: !isTeacher ? 'white' : '#888'
            }}
          >
            🎒 Student
          </button>
          <button
            className="tab-btn"
            onClick={() => switchMode(true)}
            style={{
              background: isTeacher ? 'linear-gradient(135deg, #f093fb, #f5576c)' : '#f0f0f0',
              color: isTeacher ? 'white' : '#888'
            }}
          >
            👩‍🏫 Teacher
          </button>
        </div>

        <p style={{ textAlign: 'center', color: '#888', fontSize: '14px', marginBottom: '20px', marginTop: '-8px' }}>
          {isTeacher ? 'Login with your teacher credentials' : isRegister ? 'Create a student account' : 'Welcome back, student!'}
        </p>

        <input
          className="input-field"
          type="text"
          placeholder="👤 Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="input-field"
          type="password"
          placeholder="🔒 Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />

        {message && (
          <div style={{
            background: message.includes('created') ? '#e8f5e9' : '#ffebee',
            color: message.includes('created') ? '#2e7d32' : '#c62828',
            padding: '10px 16px',
            borderRadius: '10px',
            marginBottom: '14px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {message}
          </div>
        )}

        <button
          className="btn-main"
          onClick={handleSubmit}
          style={{
            background: isTeacher
              ? 'linear-gradient(135deg, #f093fb, #f5576c)'
              : 'linear-gradient(135deg, #667eea, #764ba2)',
            boxShadow: isTeacher
              ? '0 4px 15px rgba(245,87,108,0.4)'
              : '0 4px 15px rgba(102,126,234,0.4)'
          }}
        >
          {isTeacher ? '👩‍🏫 Teacher Login' : isRegister ? '🚀 Register' : '✨ Login'}
        </button>

        {!isTeacher && (
          <p style={{ textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '14px' }}>
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <span className="toggle-link" onClick={() => { setIsRegister(!isRegister); setMessage(''); }}>
              {isRegister ? 'Login' : 'Register'}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;