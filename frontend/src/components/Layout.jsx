import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/workouts', label: 'Workouts' },
    { to: '/nutrition', label: 'Nutrition' },
    { to: '/progress', label: 'Progress' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/export', label: 'Export' },
  ];

  return (
    <div className="layout">
      <header className="header">
        <div className="container header-inner">
          <Link to="/dashboard" className="logo">
            <span className="logo-text">Fitness Tracker</span>
          </Link>
          <button className="burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
          <nav className={`nav ${menuOpen ? 'open' : ''}`}>
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}>
                {label}
              </NavLink>
            ))}
            <div className="nav-user">
              <Link to="/settings" onClick={() => setMenuOpen(false)}>Settings</Link>
              <Link to="/support" onClick={() => setMenuOpen(false)}>Support</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt="" className="avatar" />
                ) : (
                  <span className="avatar-placeholder">{user?.name?.[0] || user?.username?.[0] || '?'}</span>
                )}
                {user?.name || user?.username}
              </Link>
              <button className="btn btn-ghost logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </nav>
        </div>
      </header>
      <main className="main">{children}</main>
      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} Fitness Tracker. Build your perfect health growth.</p>
          <div className="footer-links">
            <Link to="/support">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
