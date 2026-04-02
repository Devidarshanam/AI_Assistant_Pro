import { useState } from 'react'

function QuizDisplay({ questions, onRetry, onMoreQuestions, onSaveScore }) {
  // Key: question index, Value: string (the selected option)
  const [selections, setSelections] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const formatText = (text) => {
    if (!text || typeof text !== 'string') return text;
    const cleanText = text.replace(/_/g, ' ');
    return cleanText.charAt(0).toUpperCase() + cleanText.slice(1).toLowerCase();
  };

  const handleSelect = (qIndex, option) => {
    if (submitted) return // Prevent changing answer after submission
    setSelections(prev => ({
        ...prev,
        [qIndex]: option
    }))
  }

  const handleSubmit = () => {
      let correctCount = 0;
      questions.forEach((q, index) => {
          if (selections[index] === q.answer) {
              correctCount++;
          }
      });
      const finalScore = { correct: correctCount, total: questions.length };
      setScore(finalScore);
      setSubmitted(true);
      if (onSaveScore) {
          onSaveScore(finalScore);
      }
  }

  // Edge case handle for malformed data from AI model
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return (
          <div style={{ textAlign: 'center' }}>
              <h2>Something went wrong</h2>
              <p>The AI didn't return any readable questions. Please try uploading a different document with clearer text.</p>
              <button className="retry-btn" onClick={onRetry}>Start Over</button>
          </div>
      )
  }

  return (
    <div className="quiz-container">
        <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--primary)' }}>Your Learning Quiz</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Created specifically from your document.</p>

        {questions.map((q, qIndex) => (
            <div key={qIndex} className="question-block">
                <div className="question-text">
                    {qIndex + 1}. {q.question ? formatText(q.question) : "Unable to extract question text"}
                </div>
                
                <div className="options-grid">
                    {q.options && Array.isArray(q.options) && q.options.map((opt, optIndex) => {
                        const isSelected = selections[qIndex] === opt;
                        const isCorrect = q.answer === opt;
                        
                        let btnClass = "option-btn";
                        if (isSelected && !submitted) {
                            btnClass += " selected";
                        }
                        if (submitted) {
                            if (isCorrect) btnClass += " correct";
                            if (isSelected && !isCorrect) btnClass += " incorrect";
                        }

                        return (
                            <button 
                                key={optIndex} 
                                className={btnClass}
                                onClick={() => handleSelect(qIndex, opt)}
                                disabled={submitted}
                            >
                                {formatText(opt)}
                            </button>
                        )
                    })}
                </div>
            </div>
        ))}

        {!submitted ? (
            <button 
                className="submit-quiz-btn" 
                onClick={handleSubmit}
            >
                Submit Answers
            </button>
        ) : (
             <div className="score-display">
                <h2>Score: {score.correct} / {score.total}</h2>
                <p>{score.correct === score.total ? 'Excellent job!' : 'Review the highlighted answers to learn more.'}</p>
                <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
                    <button className="submit-quiz-btn" style={{marginTop: '0'}} onClick={onRetry}>
                        Study Another Document
                    </button>
                    {onMoreQuestions && (
                        <button className="submit-quiz-btn" style={{marginTop: '0'}} onClick={onMoreQuestions}>
                            More Questions from Same Document
                        </button>
                    )}
                </div>
             </div>
        )}
    </div>
  )
}

export default QuizDisplay
