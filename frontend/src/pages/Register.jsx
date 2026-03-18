import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import './Auth.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (username.trim().length < 3) errs.username = 'Username must be at least 3 characters';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email';
    if (password.length < 6) errs.password = 'Password must be at least 6 characters';
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
      await register(username, email, password, name || undefined);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card glass">
        <h1 className="auth-title">Join Fitness Tracker</h1>
        <p className="auth-sub">Create your account to start tracking workouts, nutrition, and progress</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}
          <div className="form-group">
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setFieldErrors((f) => ({ ...f, username: '' })); }}
              required
              minLength={3}
              autoComplete="username"
              autoFocus
              placeholder="Choose a username"
              className={fieldErrors.username ? 'input-error' : ''}
              aria-invalid={!!fieldErrors.username}
              aria-describedby={fieldErrors.username ? 'username-error' : undefined}
            />
            {fieldErrors.username && (
              <span id="username-error" className="field-error">{fieldErrors.username}</span>
            )}
            {username.length > 0 && username.length < 3 && (
              <span className="field-hint">{3 - username.length} more character(s) needed</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors((f) => ({ ...f, email: '' })); }}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={fieldErrors.email ? 'input-error' : ''}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            {fieldErrors.email && (
              <span id="email-error" className="field-error">{fieldErrors.email}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="reg-name">Name (optional)</label>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Your display name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors((f) => ({ ...f, password: '' })); }}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              className={fieldErrors.password ? 'input-error' : ''}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            />
            {fieldErrors.password && (
              <span id="password-error" className="field-error">{fieldErrors.password}</span>
            )}
            {password.length > 0 && password.length < 6 && (
              <span className="field-hint">{6 - password.length} more character(s) needed</span>
            )}
          </div>
          <button type="submit" className="btn btn-primary btn-block auth-submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
