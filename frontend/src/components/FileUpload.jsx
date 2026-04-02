import { useState, useRef } from 'react'

function FileUpload({ onUpload }) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef(null)

  const allowedExtensions = ['pdf', 'docx', 'csv', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'json']

  const handleDrag = function(e) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const validateAndSetFile = (file) => {
      setErrorMsg('')
      if (!file) return;

      const ext = file.name.split('.').pop().toLowerCase()
      if (!allowedExtensions.includes(ext)) {
          setErrorMsg('Unsupported file type. Please upload pdf, docx, txt, csv, xlsx, or images.')
          setSelectedFile(null)
          return false
      }
      setSelectedFile(file)
      return true
  }

  const handleDrop = function(e) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = function(e) {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const handleSubmit = (e) => {
      e.preventDefault()
      if (selectedFile) {
          onUpload(selectedFile)
      }
  }

  return (
    <form onSubmit={handleSubmit} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
      <div className={`upload-area ${dragActive ? 'drag-active' : ''}`} onClick={() => inputRef.current.click()}>
        <input 
            ref={inputRef} 
            type="file" 
            style={{ display: 'none' }} 
            onChange={handleChange}
            accept=".pdf,.docx,.txt,.csv,.xlsx,.jpg,.png,.jpeg,.json" 
        />
        <div className="upload-icon">
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
        </div>
        <h3>Drag & Drop your document here</h3>
        <p className="file-info">PDF, DOCX, TXT, CSV, XLSX, JPG, PNG up to 50MB.</p>
        
        {selectedFile && (
            <div style={{ marginTop: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                Selected: {selectedFile.name}
            </div>
        )}
        
        {errorMsg && <div className="error-msg" style={{marginTop: '1rem'}}>{errorMsg}</div>}
      </div>

      <div style={{ textAlign: 'center' }}>
          <button 
                type="submit" 
                className="upload-btn"
                disabled={!selectedFile}
            >
              Generate Quiz
          </button>
      </div>
    </form>
  )
}

export default FileUpload
