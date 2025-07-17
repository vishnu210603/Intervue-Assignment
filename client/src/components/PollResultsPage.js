import React from 'react';

const PollResultsPage = ({ question, options, results, onAskNewQuestion, onShowHistory, students = [], onKickStudent }) => {
  // Calculate percentages
  // Support both array and object formats for results
  let resultArr = [];
  if (Array.isArray(results)) {
    resultArr = results;
  } else if (results && typeof results === 'object') {
    resultArr = options.map(opt => results[opt] || 0);
  } else {
    resultArr = options.map(() => 0);
  }
  // Calculate percentages
  const totalVotes = resultArr.reduce((sum, r) => sum + r, 0);
  const percent = i => totalVotes ? Math.round((resultArr[i] / totalVotes) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* View Poll History Button */}
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
        onClick={onShowHistory}
      >
        <svg style={{ marginRight: 8 }} width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2" />
          <circle cx="12" cy="12" r="3" fill="#fff" />
        </svg>
        View Poll history
      </button>

      {/* Poll Results Card */}
      <div style={{ maxWidth: 650, margin: '120px auto 0 auto', borderRadius: 12, boxShadow: '0 2px 16px rgba(139,92,246,0.07)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(90deg, #444 0%, #888 100%)', color: '#fff', padding: '22px 28px', fontWeight: 700, fontSize: 19, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          {question}
        </div>
        <div style={{ background: '#fff', padding: 22 }}>
          {options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, marginRight: 14 }}>{i + 1}</div>
              <div style={{ flex: 1, background: '#f5f5f7', borderRadius: 8, position: 'relative', overflow: 'hidden', height: 46, display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${percent(i)}%`, background: '#8b5cf6', borderRadius: 8, zIndex: 1, transition: 'width 0.5s' }} />
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', width: '100%', height: '100%', paddingLeft: 16, fontWeight: 600, color: percent(i) > 0 ? '#fff' : '#222' }}>{opt}</div>
                <div style={{ position: 'relative', zIndex: 2, marginLeft: 'auto', paddingRight: 18, fontWeight: 700, fontSize: 16, color: '#222' }}>{percent(i)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ask a new question button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 42 }}>
        <button
          style={{
            background: 'linear-gradient(90deg,#8b5cf6 0%,#6366f1 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 32,
            padding: '16px 54px',
            fontWeight: 700,
            fontSize: 20,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(139,92,246,0.13)'
          }}
          onClick={onAskNewQuestion}
        >
          + Ask a new question
        </button>
      </div>


  </div>
  );
};

export default PollResultsPage;
