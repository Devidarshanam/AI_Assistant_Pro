import { useState, useEffect } from 'react';

function HistoryViewer({ onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');

        const res = await fetch('http://localhost:5000/api/scores/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error('Failed to fetch history');

        const data = await res.json();
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="glass-card" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>Your Quiz History</h3>
        <button onClick={onClose} className="retry-btn" style={{ marginTop: 0 }}>Close</button>
      </div>

      {loading ? (
        <p>Loading history...</p>
      ) : error ? (
        <p className="error-msg">{error}</p>
      ) : history.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No quizzes completed yet. Upload a document to get started!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {history.map((record) => (
            <div key={record._id} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--glass-border)' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{record.fileName}</h4>
              <p>Score: <strong style={{ color: 'var(--success)' }}>{record.score.correct} / {record.score.total}</strong></p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                {new Date(record.createdAt).toLocaleDateString()} at {new Date(record.createdAt).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoryViewer;
