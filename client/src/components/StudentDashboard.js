import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setName, setKicked } from '../slices/userSlice';
import { setCurrentQuestion, setResults, resetPoll } from '../slices/pollSlice';
import socket from '../socket';
import ChatPopup from './ChatPopup';
import StudentNameEntry from './StudentNameEntry';


const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { name } = useSelector(state => state.user);
  const { currentQuestion, results } = useSelector(state => state.poll);
  const [selected, setSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(60);
  const [students, setStudents] = useState([]); // NEW
  const timerRef = useRef();

  // On mount, always sync Redux with sessionStorage if present (fixes refresh issue)
  useEffect(() => {
    const sessionName = sessionStorage.getItem('poll_student_name');
    if (sessionName && name !== sessionName) {
      dispatch(setName(sessionName));
    }
  }, [dispatch]); // Remove 'name' from deps to avoid infinite loop and ensure sync on refresh

  // If no name in sessionStorage, force name entry
  if (!sessionStorage.getItem('poll_student_name')) {
    return <StudentNameEntry />;
  }

  useEffect(() => {
    if (!name) return;
    if (!socket.connected) socket.connect();
    socket.emit('join', { role: 'student', name });

    // Listen for student list updates
    socket.on('students', (studentsList) => {
      setStudents(studentsList || []);
    });

    socket.on('new-question', (q) => {
      dispatch(setCurrentQuestion(q));
      setSelected('');
      setSubmitted(false);
      setTimer(q.timer || 60);
    });
    socket.on('poll-results', (res) => {
      dispatch(setResults(res));
    });
    socket.on('poll-complete', (res) => {
      dispatch(setResults(res));
      setSubmitted(true);
      setTimer(0);
    });
    socket.on('kicked', () => {
      dispatch(setKicked(true));
      socket.disconnect();
    });
    return () => {
      socket.off('students');
      socket.off('new-question');
      socket.off('poll-results');
      socket.off('poll-complete');
      socket.off('kicked');
    };
  }, [name, dispatch]);

  useEffect(() => {
    if (!currentQuestion || submitted || timer <= 0) return;
    timerRef.current = setTimeout(() => setTimer(t => t - 1), 1000);
    if (timer === 1) setSubmitted(true);
    return () => clearTimeout(timerRef.current);
  }, [timer, currentQuestion, submitted]);

  const handleNameSubmit = (n) => {
    sessionStorage.setItem('poll_student_name', n);
    dispatch(setName(n));
  };

  const handleSubmit = () => {
    if (!selected) return;
    socket.emit('answer', selected);
    setSubmitted(true);
  };

  // Only show StudentNameEntry if sessionStorage does NOT have a name
  if (!sessionStorage.getItem('poll_student_name')) return (
    <StudentNameEntry />
  );

  if (!currentQuestion) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            border: '6px solid #a78bfa',
            borderTop: '6px solid #fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'spin 1.2s linear infinite'
          }}>
          </div>
        </div>
        <div style={{ fontWeight: 700, fontSize: 26, color: '#18181b', textAlign: 'center' }}>
          Wait for the teacher to ask questions..
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', position: 'relative' }}>
      <div style={{ maxWidth: 700, margin: '40px auto 0 auto', padding: 0 }}>
        {currentQuestion && (
          <div style={{ background: '#fff', border: '2px solid #a78bfa', borderRadius: 12, boxShadow: '0 2px 12px rgba(139,92,246,0.04)', padding: 0, marginBottom: 36 }}>
            <div style={{
              background: 'linear-gradient(90deg,#434343 0%,#8b5cf6 100%)',
              borderRadius: '10px 10px 0 0',
              padding: '16px 24px',
              color: '#fff',
              fontWeight: 700,
              fontSize: 17
            }}>{currentQuestion.question}</div>
            <div style={{ padding: '24px 20px 18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 22, color: '#18181b', marginRight: 24 }}>Question {currentQuestion.id}</div>
                <div style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: 18 }}>
                  <span role="img" aria-label="timer" style={{ marginRight: 6, fontSize: 20, color: '#222' }}>0</span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>{timer > 9 ? `00:${timer}` : `00:0${timer}`}</span>
                </div>
              </div>
              {currentQuestion.options.map((opt, idx) => {
                // If submitted, show as result bar, else as selectable option
                if (submitted) {
                  const count = results && results[opt] ? results[opt] : 0;
                  const total = results ? Object.values(results).reduce((a, b) => a + b, 0) : 0;
                  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={opt} style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                      {/* Option number in circle */}
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: '#a78bfa',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 22,
                        marginRight: 18,
                        flexShrink: 0
                      }}>{idx + 1}</div>
                      {/* Option text and percent bar */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          background: '#f5f5f7',
                          borderRadius: 12,
                          height: 44,
                          display: 'flex',
                          alignItems: 'center',
                          overflow: 'hidden',
                          position: 'relative',
                        }}>
                          {/* Filled percent bar */}
                          <div style={{
                            width: `${percent}%`,
                            height: '100%',
                            background: '#a78bfa',
                            borderRadius: 12,
                            transition: 'width 0.5s',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            zIndex: 1,
                          }}>
                            <span style={{
                              marginLeft: 56,
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: 18,
                              textShadow: '0 1px 2px rgba(0,0,0,0.07)'
                            }}>{percent > 0 ? opt : ''}</span>
                          </div>
                          {/* Percent value at right */}
                          <div style={{
                            position: 'absolute',
                            right: 18,
                            top: 0,
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            color: percent === 0 ? '#888' : '#222',
                            fontWeight: 700,
                            fontSize: 18,
                            zIndex: 3
                          }}>{percent}%</div>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  const isSelected = selected === opt;
                  return (
                    <div
                      key={opt}
                      onClick={() => !submitted && setSelected(opt)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: isSelected ? '#ede9fe' : '#f7f7fa',
                        border: isSelected ? '2px solid #8b5cf6' : '1.5px solid #e5e7eb',
                        borderRadius: 8,
                        marginBottom: 18,
                        cursor: submitted ? 'default' : 'pointer',
                        fontWeight: 600,
                        fontSize: 16,
                        transition: 'all 0.15s',
                        minHeight: 48,
                        boxShadow: isSelected ? '0 2px 8px rgba(139,92,246,0.09)' : 'none',
                        padding: 0
                      }}
                    >
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: isSelected ? '#8b5cf6' : '#e5e7eb',
                        color: isSelected ? '#fff' : '#6366f1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 17,
                        margin: '0 16px 0 8px',
                        border: isSelected ? '2px solid #8b5cf6' : 'none'
                      }}>{idx + 1}</div>
                      <div style={{ flex: 1, padding: '12px 0', display: 'flex', alignItems: 'center', color: isSelected ? '#4f46e5' : '#222' }}>{opt}</div>
                    </div>
                  );
                }
              })}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {!submitted && (
                  <button
                    onClick={handleSubmit}
                    disabled={!selected}
                    style={{
                      margin: '0 auto',
                      display: 'block',
                      background: 'linear-gradient(90deg,#8b5cf6 0%,#6366f1 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 32,
                      padding: '16px 64px',
                      fontWeight: 700,
                      fontSize: 20,
                      cursor: selected ? 'pointer' : 'not-allowed',
                      boxShadow: '0 2px 8px rgba(139,92,246,0.09)'
                    }}
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <ChatPopup role="student" students={students} />
    </div>
  );
};

export default StudentDashboard;
