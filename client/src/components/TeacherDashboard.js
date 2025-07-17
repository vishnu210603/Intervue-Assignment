import React, { useState, useEffect } from 'react';
import socket from '../socket';
import ChatPopup from './ChatPopup';
import PollHistoryModal from './PollHistoryModal';
import PollResultsPage from './PollResultsPage';

// --- Participants Table for PollResultsPage ---
function ParticipantsTable({ students, onKick }) {
  return (
    <div style={{ marginTop: 32 }}>
      <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Participants</h3>
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', fontWeight: 600 }}>Name</th>
            <th style={{ textAlign: 'left', fontWeight: 600 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {(students || []).length === 0 ? (
            <tr><td colSpan={2} style={{ color: '#888' }}>No students</td></tr>
          ) : (
            students.map(s => (
              <tr key={s.name}>
                <td>{s.name}</td>
                <td>
                  <span
                    style={{
                      color: '#2563eb',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontWeight: 500,
                      background: 'none',
                      border: 'none',
                      padding: 0
                    }}
                    title={`Kick out ${s.name}`}
                    onClick={() => onKick(s.name)}
                  >
                    Kick out
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}


const TeacherDashboard = () => {
  const [view, setView] = useState('create'); // 'create' | 'results'
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [correctOption, setCorrectOption] = useState(null);
  const [timer, setTimer] = useState(60);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [results, setResults] = useState(null);
  const [pollEnded, setPollEnded] = useState(false);
  const [students, setStudents] = useState([]); // <-- maintain students state
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    socket.emit('join', { role: 'teacher', name: 'Teacher' });
    socket.on('students', (studentsList) => {
      setStudents(studentsList || []);
    });
    socket.on('new-question', (q) => {
      setCurrentQuestion(q);
      setResults(null);
    });
    socket.on('poll-results', setResults);
    socket.on('poll-complete', (res) => {
      setResults(res);
      setPollEnded(true);
      // Do NOT clear currentQuestion so PollResultsPage can render
      setView('results');
      fetchHistory();
    });
    socket.on('history', setHistory);
    return () => {
      socket.off('students');
      socket.off('new-question');
      socket.off('poll-results');
      socket.off('poll-complete');
      socket.off('history');
    };
  }, []);


  const fetchHistory = () => {
    socket.emit('get-history');
  };

  const handleAsk = () => {
    if (!question.trim() || options.filter(o => o.trim()).length < 2) return;
    socket.emit('ask-question', {
      question: question.trim(),
      options: options.map(o => o.trim()).filter(Boolean),
      timer: Number(timer) || 60,
    });
    setCurrentQuestion({ question, options: options.map(o => o.trim()).filter(Boolean), timer });
    setResults(null);
    setView('results'); // Immediately show results page after asking
    setQuestion('');
    setOptions(['', '']);
    setCorrectOption(null);
  };

  const handleKick = (studentName) => {
    socket.emit('kick-student', studentName);
  };

  const handleOptionChange = (idx, val) => {
    setOptions(opts => opts.map((o, i) => i === idx ? val : o));
  };

  const addOption = () => setOptions(opts => [...opts, '']);
  const removeOption = (idx) => setOptions(opts => opts.filter((_, i) => i !== idx));

  if (view === 'results' && currentQuestion !== null) {
    return (
      <>
        <PollResultsPage
          question={currentQuestion.question}
          options={currentQuestion.options}
          results={results}
          onAskNewQuestion={() => {
            setView('create');
            setQuestion('');
            setOptions(['', '']);
            setCorrectOption(null);
            setResults(null);
          }}
          onShowHistory={() => setShowHistory(true)}
          history={history}
          students={students}
          onKickStudent={name => socket.emit('kick-student', name)}
        />
        <PollHistoryModal open={showHistory} onClose={() => setShowHistory(false)} history={history} />
        <ChatPopup role="teacher" students={students} />
      </>
    );
  }

  return (
    <>
      <div style={{ maxWidth: 700, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(139,92,246,0.07)', padding: 0, position: 'relative' }}>
        <button
          style={{
            position: 'absolute',
            top: 22,
            right: 22,
            background: '#8b5cf6',
            color: '#fff',
            border: 'none',
            borderRadius: 32,
            padding: '7px 20px 7px 14px',
            fontWeight: 700,
            fontSize: 17,
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(139,92,246,0.13)'
          }}
          onClick={() => setShowHistory(true)}
        >
          <svg style={{ marginRight: 8 }} width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" fill="#fff" />
          </svg>
          View Poll history
        </button>

        <div style={{ padding: '32px 22px 0 22px' }}>
          <span style={{
            background: '#8b5cf6',
            color: '#fff',
            borderRadius: 16,
            padding: '4px 16px',
            fontWeight: 600,
            fontSize: 14,
            display: 'inline-block',
            marginBottom: 20
          }}>★ Intervue Poll</span>

          <h2 style={{ fontWeight: 700, fontSize: 38, marginBottom: 8 }}>Let's <span style={{ color: '#222' }}>Get Started</span></h2>
          <div style={{ color: '#888', fontSize: 18, marginBottom: 28 }}>You’ll be able to create and manage polls, ask questions, and monitor your students' responses in real-time.</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#222' }}>Enter your question</div>
            <select
              value={timer}
              onChange={e => setTimer(e.target.value)}
              style={{
                background: '#f3f3fa',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: '6px 16px',
                fontWeight: 600,
                fontSize: 16
              }}
            >
              {[60, 90, 120, 180, 300].map(t => (
                <option key={t} value={t}>{t} seconds</option>
              ))}
            </select>
          </div>

          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Enter your question"
            maxLength={100}
            rows={4}
            style={{
              width: '100%',
              fontSize: 22,
              padding: '24px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#f5f5f7',
              fontWeight: 500,
              marginBottom: 0,
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
              color: '#222',
              letterSpacing: 0.2
            }}
          />
          <div style={{ fontSize: 14, color: '#aaa', textAlign: 'right', marginBottom: 16 }}>{question.length}/100</div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: '#444' }}>Edit Options</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                {options.map((opt, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#a78bfa', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, marginRight: 14 }}>{idx + 1}</div>
                    <input
                      type="text"
                      value={opt}
                      onChange={e => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      style={{
                        width: '100%',
                        fontSize: 17,
                        padding: '12px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: '#f5f5f7'
                      }}
                    />
                  </div>
                ))}
                <button onClick={addOption} style={{
                  marginTop: 8,
                  background: '#8b5cf6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 18px',
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: 'pointer'
                }}>+ Add More option</button>
              </div>

              <div style={{ marginLeft: 32, minWidth: 150 }}>
                <div style={{ fontWeight: 600, marginBottom: 12, color: '#222', fontSize: 17 }}>Is it Correct?</div>
                {options.map((_, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 30 }}>
                    <label style={{ display: 'flex', alignItems: 'center', marginRight: 18, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        checked={correctOption === idx}
                        onChange={() => setCorrectOption(idx)}
                        style={{ accentColor: '#8b5cf6', marginRight: 7 }}
                        name="correct-option"
                      />
                      <span style={{ color: '#8b5cf6', fontWeight: 600 }}>Yes</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        checked={correctOption !== idx}
                        onChange={() => setCorrectOption(null)}
                        style={{ accentColor: '#e5e7eb', marginRight: 7 }}
                        name={`not-correct-option-${idx}`}
                      />
                      <span style={{ color: '#888', fontWeight: 600 }}>No</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleAsk} style={{
            marginTop: 28,
            background: 'linear-gradient(90deg,#8b5cf6 0%,#6366f1 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 24,
            padding: '14px 48px',
            fontWeight: 700,
            fontSize: 18,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(139,92,246,0.09)'
          }}>Ask Question</button>
        </div>
      </div>

      <ChatPopup role="teacher" students={students} />
      <PollHistoryModal open={showHistory} onClose={() => setShowHistory(false)} history={history} />


    </>
  );
};

export default TeacherDashboard;
