import React from 'react';

const KickedScreen = () => (
  <div style={{
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
    <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 16 }}>You've been Kicked out!</h2>
    <p style={{ color: '#888', fontSize: 18, maxWidth: 500, textAlign: 'center' }}>
      Looks like the teacher had removed you from the poll system. Please try again sometime.
    </p>
  </div>
);

export default KickedScreen;
