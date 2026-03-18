import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { dashboard as dashboardApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ClipBoardIcon, UtensilsIcon, ChartIcon } from '../components/Icons';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi.get()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="dashboard-error">
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { recentWorkouts, recentNutrition, recentProgress, unreadNotifications } = data;
  const displayName = user?.name || user?.username || 'there';

  return (
    <div className="container dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Welcome back, {displayName}</h1>
          <p className="dashboard-sub">Here&apos;s an overview of your fitness journey</p>
        </div>
      </header>

      <section className="quick-actions">
        <Link to="/workouts/new" className="quick-action-card">
          <span className="quick-action-icon"><ClipBoardIcon size={24} /></span>
          <span className="quick-action-label">Add Workout</span>
        </Link>
        <Link to="/nutrition" className="quick-action-card">
          <span className="quick-action-icon"><UtensilsIcon size={24} /></span>
          <span className="quick-action-label">Log Meal</span>
        </Link>
        <Link to="/progress" className="quick-action-card">
          <span className="quick-action-icon"><ChartIcon size={24} /></span>
          <span className="quick-action-label">Record Progress</span>
        </Link>
      </section>

      {unreadNotifications?.length > 0 && (
        <section className="dashboard-section notifications-preview">
          <div className="notifications-card">
            <h2>Notifications</h2>
            {unreadNotifications.slice(0, 3).map((n) => (
              <div key={n.id} className="notification-item">
                <strong>{n.title}</strong>
                {n.message && <span> — {n.message}</span>}
              </div>
            ))}
            <Link to="/notifications" className="link-more">View all</Link>
          </div>
        </section>
      )}

      <div className="dashboard-grid">
        <section className="dashboard-card">
          <div className="dashboard-card-header">
            <h2>Recent Workouts</h2>
            <Link to="/workouts" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div className="dashboard-card-body">
            {recentWorkouts?.length ? (
              <ul className="dashboard-list">
                {recentWorkouts.map((w) => (
                  <li key={w.id} className="dashboard-list-item">
                    <Link to={`/workouts/${w.id}`} className="list-item-link">
                      <strong>{w.name}</strong>
                      <span className="muted"> — {w.category} · {format(new Date(w.date), 'MMM d')}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <p>No workouts yet.</p>
                <Link to="/workouts/new" className="btn btn-primary btn-sm">Add your first workout</Link>
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-card">
          <div className="dashboard-card-header">
            <h2>Recent Nutrition</h2>
            <Link to="/nutrition" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div className="dashboard-card-body">
            {recentNutrition?.length ? (
              <ul className="dashboard-list">
                {recentNutrition.slice(0, 5).map((n) => (
                  <li key={n.id} className="dashboard-list-item">
                    <span className="meal-badge">{n.meal_type}</span>
                    {n.food_items} — {n.calories || 0} cal
                    <span className="muted"> · {format(new Date(n.date), 'MMM d')}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <p>No nutrition logs.</p>
                <Link to="/nutrition" className="btn btn-primary btn-sm">Log your first meal</Link>
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-card">
          <div className="dashboard-card-header">
            <h2>Recent Progress</h2>
            <Link to="/progress" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div className="dashboard-card-body">
            {recentProgress?.length ? (
              <ul className="dashboard-list">
                {recentProgress.map((p) => (
                  <li key={p.id} className="dashboard-list-item">
                    {p.weight && <span>Weight: {p.weight} kg</span>}
                    {p.run_time_minutes && <span>Run: {p.run_time_minutes} min</span>}
                    {p.lifting_weight && <span>Lift: {p.lifting_weight} kg</span>}
                    {!p.weight && !p.run_time_minutes && !p.lifting_weight && <span>Progress logged</span>}
                    <span className="muted"> · {format(new Date(p.date), 'MMM d')}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <p>No progress yet.</p>
                <Link to="/progress" className="btn btn-primary btn-sm">Record your first entry</Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
