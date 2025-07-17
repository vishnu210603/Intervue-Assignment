import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setRole } from '../slices/userSlice';
import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const handleContinue = () => {
    if (selectedRole) {
      dispatch(setRole(selectedRole));
      if (selectedRole === 'teacher') navigate('/teacher');
      else if (selectedRole === 'student') navigate('/student');
    }
  };
  return (
    <div className="role-selection" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#fff'
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
      <h2 style={{ fontWeight: 400, fontSize: 32, marginBottom: 8 }}>
        Welcome to the <b style={{ fontWeight: 700 }}>Live Polling System</b>
      </h2>
      <p style={{ color: '#888', marginBottom: 32 }}>Please select the role that best describes you to begin using the live polling system</p>
      <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
        <div
          style={{
            border: selectedRole === 'student' ? '2px solid #8b5cf6' : '2px solid #e5e7eb',
            borderRadius: 12,
            padding: 24,
            width: 220,
            background: selectedRole === 'student' ? '#f9f8ff' : '#fff',
            cursor: 'pointer'
          }}
          onClick={() => setSelectedRole('student')}
        >
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>I'm a Student</div>
          <div style={{ color: '#888', fontSize: 14 }}>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</div>
        </div>
        <div
          style={{
            border: selectedRole === 'teacher' ? '2px solid #8b5cf6' : '2px solid #e5e7eb',
            borderRadius: 12,
            padding: 24,
            width: 220,
            background: selectedRole === 'teacher' ? '#f9f8ff' : '#fff',
            cursor: 'pointer'
          }}
          onClick={() => setSelectedRole('teacher')}
        >
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>I'm a Teacher</div>
          <div style={{ color: '#888', fontSize: 14 }}>Submit answers and view live poll results in real-time.</div>
        </div>
      </div>
      <button
        style={{
          background: selectedRole ? '#8b5cf6' : '#c4b5fd',
          color: '#fff',
          border: 'none',
          borderRadius: 24,
          padding: '12px 40px',
          fontWeight: 600,
          fontSize: 18,
          cursor: selectedRole ? 'pointer' : 'not-allowed',
          opacity: selectedRole ? 1 : 0.6
        }}
        disabled={!selectedRole}
        onClick={handleContinue}
      >
        Continue
      </button>
    </div>
  );
};
export default RoleSelection;
