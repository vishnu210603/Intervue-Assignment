import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setName } from '../slices/userSlice';

// StudentNameEntry ensures name is unique per tab (sessionStorage), persists on refresh, and prompts again on new tab.
const StudentNameEntry = () => {
  const [name, setNameInput] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    // Store name in sessionStorage so it's unique per tab and persists on refresh
    sessionStorage.setItem('poll_student_name', name.trim());
    dispatch(setName(name.trim()));
  };


  return (
    <form onSubmit={handleSubmit} style={{
      textAlign: 'center',
      marginTop: 80,
      background: '#fff',
      padding: 32,
      borderRadius: 16,
      boxShadow: '0 2px 16px rgba(139,92,246,0.07)',
      maxWidth: 400,
      marginLeft: 'auto',
      marginRight: 'auto'
    }}>
      <div style={{ marginBottom: 24 }}>
        <span style={{
          background: '#8b5cf6',
          color: '#fff',
          borderRadius: 16,
          padding: '4px 16px',
          fontWeight: 600,
          fontSize: 14
        }}>★ Intervue Poll</span>
      </div>
      <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 8 }}>Let's Get Started</h2>
      <p style={{ color: '#888', marginBottom: 24 }}>
        If you're a student, you'll be able to <b>submit your answers</b>, participate in live polls, and see how your responses compare with your classmates.
      </p>
      <input
        type="text"
        value={name}
        onChange={e => setNameInput(e.target.value)}
        placeholder="Enter your Name"
        style={{
          padding: 12,
          fontSize: 16,
          borderRadius: 8,
          border: '1px solid #d1d5db',
          width: '100%',
          marginBottom: 16
        }}
      />
      <br />
      <button type="submit" style={{
        background: '#8b5cf6',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '10px 32px',
        fontWeight: 600,
        fontSize: 16,
        marginTop: 8,
        cursor: 'pointer'
      }}>
        Continue
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </form>
  );
};

export default StudentNameEntry;
