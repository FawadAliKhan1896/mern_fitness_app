import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { workouts as workoutsApi } from '../api/client';
import './Workouts.css';

const CATEGORIES = ['strength', 'cardio', 'flexibility', 'hiit', 'other'];

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    workoutsApi.list(params)
      .then(setWorkouts)
      .finally(() => setLoading(false));
  }, [search, category]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this workout?')) return;
    try {
      await workoutsApi.delete(id);
      setWorkouts((w) => w.filter((x) => x.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Workouts</h1>
        <Link to="/workouts/new" className="btn btn-primary">Add Workout</Link>
      </div>

      <div className="filters">
        <input
          type="search"
          placeholder="Search workouts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : workouts.length === 0 ? (
        <div className="empty-card card">
          <p>No workouts found. <Link to="/workouts/new">Create your first workout</Link></p>
        </div>
      ) : (
        <div className="workouts-list">
          {workouts.map((w) => (
            <div key={w.id} className="workout-card card">
              <div className="workout-header">
                <div>
                  <Link to={`/workouts/${w.id}`}><h3>{w.name}</h3></Link>
                  <span className="category-badge">{w.category}</span>
                  <span className="workout-date">{format(new Date(w.date), 'MMM d, yyyy')}</span>
                </div>
                <div className="workout-actions">
                  <Link to={`/workouts/${w.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                  <button onClick={() => handleDelete(w.id)} className="btn btn-ghost btn-sm danger">Delete</button>
                </div>
              </div>
              {w.exercises?.length > 0 && (
                <ul className="exercise-preview">
                  {w.exercises.slice(0, 3).map((ex) => (
                    <li key={ex.id}>
                      {ex.exercise_name} — {ex.sets}x{ex.reps || '?'} {ex.weight ? `@ ${ex.weight}kg` : ''}
                    </li>
                  ))}
                  {w.exercises.length > 3 && <li className="more">+{w.exercises.length - 3} more</li>}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
