import { Link } from 'react-router-dom';
import './AuthLayout.css';

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-grid" />
      </div>
      <nav className="auth-nav">
        <Link to="/" className="auth-logo">Fitness Tracker</Link>
      </nav>
      <div className="auth-content">
        <div className="auth-card-wrap">
          {children}
        </div>
      </div>
    </div>
  );
}
