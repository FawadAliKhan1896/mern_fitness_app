import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import './Auth.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!username.trim()) errs.username = 'Username or email is required';
    if (!password) errs.password = 'Password is required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    if (!validate()) return;

    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card glass">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-sub">Log in to continue your fitness journey</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}
          <div className="form-group">
            <label htmlFor="login-username">Username or Email</label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setFieldErrors((f) => ({ ...f, username: '' })); }}
              onBlur={() => username.trim() === '' && setFieldErrors((f) => ({ ...f, username: '' }))}
              required
              autoComplete="username"
              autoFocus
              className={fieldErrors.username ? 'input-error' : ''}
              aria-invalid={!!fieldErrors.username}
              aria-describedby={fieldErrors.username ? 'username-error' : undefined}
            />
            {fieldErrors.username && (
              <span id="username-error" className="field-error">{fieldErrors.username}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors((f) => ({ ...f, password: '' })); }}
              required
              autoComplete="current-password"
              className={fieldErrors.password ? 'input-error' : ''}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            />
            {fieldErrors.password && (
              <span id="password-error" className="field-error">{fieldErrors.password}</span>
            )}
          </div>
          <button type="submit" className="btn btn-primary btn-block auth-submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
