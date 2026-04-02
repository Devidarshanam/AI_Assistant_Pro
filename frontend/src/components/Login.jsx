import { useState } from 'react';

function Login({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd) => {
      const hasUpper = /[A-Z]/.test(pwd);
      const hasLower = /[a-z]/.test(pwd);
      const hasNum = /[0-9]/.test(pwd);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(pwd);
      return hasUpper && hasLower && hasNum && hasSpecial;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    // Validation
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isRegistering) {
        if (!username) {
            setError('Please enter a username.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!validatePassword(password)) {
            setError('Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.');
            return;
        }
    }
    
    setLoading(true);
    
    try {
        const url = isRegistering 
            ? '/api/auth/register' 
            : '/api/auth/login';
            
        const body = isRegistering 
            ? { username, email, password }
            : { email, password };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Authentication failed');
        }

        if (isRegistering) {
            // Show popup as requested
            alert("Successfully registered!");
            
            // Toggle back to login UI mode
            setIsRegistering(false);
            setSuccessMsg("Successfully registered! Please login.");
            setPassword('');
            setConfirmPassword('');
        } else {
            // Actually login the user
            localStorage.setItem('token', data.token);
            onLoginSuccess(data.token);
        }
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const toggleMode = () => {
      setIsRegistering(!isRegistering);
      setError('');
      setSuccessMsg('');
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <div className="login-icon">🔐</div>
        <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
        <p>{isRegistering ? 'Register to access AI Assistant Pro' : 'Login to access AI Assistant Pro'}</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        {error && <div className="error-msg" style={{ marginTop: 0, marginBottom: '1rem' }}>{error}</div>}
        {successMsg && <div className="error-msg" style={{ marginTop: 0, marginBottom: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>{successMsg}</div>}
        
        {isRegistering && (
            <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
                type="text"
                id="username"
                className="modern-input"
                placeholder="StudyMaster"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            </div>
        )}

        <div className="input-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            className="modern-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="modern-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {isRegistering && (
            <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
                type="password"
                id="confirmPassword"
                className="modern-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
            </div>
        )}

        <button type="submit" className="upload-btn login-btn" disabled={loading}>
          {loading ? 'Processing...' : isRegistering ? 'Register' : 'Access Platform'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button type="button" onClick={toggleMode} className="retry-btn" style={{ border: 'none', color: 'var(--primary)', marginTop: 0 }}>
                {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
        </div>

      </form>
    </div>
  );
}

export default Login;
