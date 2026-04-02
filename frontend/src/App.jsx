import { useState, useEffect } from 'react'
import FileUpload from './components/FileUpload'
import QuizDisplay from './components/QuizDisplay'
import Login from './components/Login'
import HistoryViewer from './components/HistoryViewer'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [quizData, setQuizData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentFile, setCurrentFile] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
          setIsAuthenticated(true);
      }
  }, []);

  const handleLogout = () => {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      resetApp();
      setShowHistory(false);
  }

  const handleFileUpload = async (file) => {
    setCurrentFile(file)
    setLoading(true)
    setError(null)
    setQuizData(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process document')
      }

      setQuizData(data.questions)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetApp = () => {
    setQuizData(null)
    setError(null)
    setCurrentFile(null)
  }

  const handleMoreQuestions = () => {
    if (currentFile) {
      handleFileUpload(currentFile)
    }
  }

  const handleSaveScore = async (score) => {
      try {
          const token = localStorage.getItem('token');
          if (!token || !currentFile) return;

          await fetch('/api/scores/save', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                  fileName: currentFile.name,
                  score: score
              })
          });
      } catch (err) {
          console.error("Failed to save score locally", err);
      }
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <div className="glass-card">
          <Login onLoginSuccess={(token) => setIsAuthenticated(true)} />
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <nav className="top-nav">
        <div className="nav-links">
            <button className="nav-btn" onClick={() => setShowHistory(!showHistory)}>
                {showHistory ? 'Close History' : 'My History'}
            </button>
            <button className="nav-btn logout-btn" onClick={handleLogout}>
                Logout
            </button>
        </div>
      </nav>

      <div className="header">
        <h1>AI Assistant Pro</h1>
        <p>Upload a document and auto-generate an interactive learning quiz</p>
      </div>

      {showHistory ? (
        <HistoryViewer onClose={() => setShowHistory(false)} />
      ) : (
        <div className="glass-card">
          {error && <div className="error-msg">{error}</div>}

          {loading ? (
            <div className="loader-container">
              <div className="spinner"></div>
              <p>Analyzing document & generating quiz with AI...</p>
              <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>(This step may take slightly longer on lower-memory systems)</p>
            </div>
          ) : quizData ? (
            <QuizDisplay 
                questions={quizData} 
                onRetry={resetApp} 
                onMoreQuestions={handleMoreQuestions}
                onSaveScore={handleSaveScore}
            />
          ) : (
            <FileUpload onUpload={handleFileUpload} />
          )}
        </div>
      )}
    </div>
  )
}

export default App
