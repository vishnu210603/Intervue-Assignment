import React, { useEffect, useRef, useState } from 'react';
import socket from '../socket';

const ChatPopup = ({ role, students }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('chat');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef();

  useEffect(() => {
    socket.on('chat-message', (msg) => setChatMessages(msgs => [...msgs, msg]));
    socket.emit('get-chat-history');
    socket.on('chat-history', (msgs) => setChatMessages(msgs || []));
    return () => {
      socket.off('chat-message');
      socket.off('chat-history');
    };
  }, []);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, open]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    socket.emit('chat-message', chatInput.trim());
    setChatInput('');
  };

  return (
    <>
      <button
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#8b5cf6',
          color: '#fff',
          fontSize: 28,
          border: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}
        onClick={() => setOpen(o => !o)}
        aria-label="Open chat"
      >
        💬
      </button>
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 100,
          right: 32,
          width: 340,
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: 12,
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
          zIndex: 1001,
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', background: '#fafaff' }}>
            <button
              style={{
                flex: 1,
                padding: 12,
                border: 'none',
                background: tab === 'chat' ? '#fff' : 'transparent',
                borderBottom: tab === 'chat' ? '2px solid #8b5cf6' : 'none',
                fontWeight: tab === 'chat' ? 600 : 400,
                cursor: 'pointer'
              }}
              onClick={() => setTab('chat')}
            >
              Chat
            </button>
            <button
                style={{
                  flex: 1,
                  padding: 12,
                  border: 'none',
                  background: tab === 'participants' ? '#fff' : 'transparent',
                  borderBottom: tab === 'participants' ? '2px solid #8b5cf6' : 'none',
                  fontWeight: tab === 'participants' ? 600 : 400,
                  cursor: 'pointer'
                }}
                onClick={() => setTab('participants')}
              >
                Participants
              </button>
          </div>
          {tab === 'chat' && (
            <div style={{ height: 220, overflowY: 'auto', padding: 10, background: '#fafaff' }}>
              {chatMessages.length === 0 && <div style={{ color: '#888' }}>No messages yet.</div>}
              {chatMessages.map((msg, idx) => {
                const myName = sessionStorage.getItem('poll_student_name') || 'Teacher';
                const isMine = msg.sender === myName;
                return (
                  <div key={idx} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMine ? 'flex-end' : 'flex-start',
                    marginBottom: 18
                  }}>
                    <span style={{
                      color: isMine ? '#7c3aed' : '#333',
                      fontWeight: 600,
                      fontSize: 13,
                      marginBottom: 2,
                      alignSelf: isMine ? 'flex-end' : 'flex-start'
                    }}>{msg.sender}</span>
                    <div style={{
                      background: isMine ? '#a78bfa' : '#333',
                      color: '#fff',
                      borderRadius: 12,
                      padding: '10px 18px',
                      maxWidth: 220,
                      fontSize: 16,
                      boxShadow: isMine ? '0 2px 8px rgba(139,92,246,0.09)' : '0 2px 8px rgba(0,0,0,0.11)',
                      alignSelf: isMine ? 'flex-end' : 'flex-start',
                      borderBottomRightRadius: isMine ? 4 : 12,
                      borderBottomLeftRadius: isMine ? 12 : 4
                    }}>{msg.message}</div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
          )}
          {tab === 'participants' && (
            <div style={{ height: 220, overflowY: 'auto', padding: 10 }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', fontWeight: 600 }}>Name</th>
                    {role === 'teacher' && <th style={{ textAlign: 'left', fontWeight: 600 }}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {(students || []).length === 0 ? (
                    <tr><td colSpan={role === 'teacher' ? 2 : 1} style={{ color: '#888' }}>No students</td></tr>
                  ) : (
                    students.map(s => (
                      <tr key={s.name}>
                        <td>{s.name}</td>
                        {role === 'teacher' && (
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
                              onClick={() => socket.emit('kick-student', s.name)}
                            >
                              Kick out
                            </span>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ borderTop: '1px solid #eee', background: '#fafaff', padding: 8 }}>
            {tab === 'chat' && (
              <form onSubmit={e => { e.preventDefault(); handleSend(); }} style={{ display: 'flex' }}>
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ddd', marginRight: 8 }}
                />
                <button type="submit" style={{ background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 6, padding: '0 16px' }}>Send</button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatPopup;
