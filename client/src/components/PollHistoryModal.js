import React from 'react';

const PollHistoryModal = ({ open, onClose, history }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.28)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 32, minWidth: 480, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 2px 32px rgba(139,92,246,0.14)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 24, margin: 0 }}>Poll History</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#8b5cf6' }}>×</button>
        </div>
        {history.length === 0 ? (
          <div style={{ color: '#888', fontSize: 16 }}>No poll history yet.</div>
        ) : (
          history.slice().reverse().map((h, idx) => {
            const totalVotes = h.results ? Object.values(h.results).reduce((a, b) => a + b, 0) : 0;
            return (
              <div key={idx} style={{ marginBottom: 32, border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(90deg, #434343 0%, #8b5cf6 100%)', color: '#fff', fontWeight: 600, fontSize: 18, padding: '18px 24px' }}>{h.question}</div>
                <div style={{ padding: 24 }}>
                  {h.options.map((opt, i) => {
                    const count = h.results && h.results[opt] ? h.results[opt] : 0;
                    const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 17, marginRight: 16 }}>{i + 1}</div>
                        <div style={{ flex: 1, position: 'relative', background: '#f3f3fa', borderRadius: 8, overflow: 'hidden', height: 44, display: 'flex', alignItems: 'center' }}>
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${percent}%`, background: '#8b5cf6', borderRadius: 8, transition: 'width 0.5s' }}></div>
                          <div style={{ position: 'relative', zIndex: 1, padding: '0 18px', color: percent > 12 ? '#fff' : '#333', fontWeight: 600, fontSize: 16 }}>{opt}</div>
                        </div>
                        <div style={{ minWidth: 60, fontWeight: 600, color: '#7c3aed', marginLeft: 18 }}>{percent}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PollHistoryModal;
