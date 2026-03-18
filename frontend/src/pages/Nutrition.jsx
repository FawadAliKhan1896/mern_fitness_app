import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { nutrition as nutritionApi } from '../api/client';
import NutritionForm from '../components/NutritionForm';
import './Nutrition.css';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks'];

export default function Nutrition() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [mealType, setMealType] = useState('');
  const [editing, setEditing] = useState(null);

  const fetchLogs = () => {
    const params = {};
    if (search) params.search = search;
    if (mealType) params.meal_type = mealType;
    nutritionApi.list(params).then(setLogs).finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    fetchLogs();
  }, [search, mealType]);

  const handleSave = () => {
    setShowForm(false);
    setEditing(null);
    setLoading(true);
    fetchLogs();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await nutritionApi.delete(id);
      setLogs((l) => l.filter((x) => x.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Nutrition</h1>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
          Log Meal
        </button>
      </div>

      <div className="filters">
        <input
          type="search"
          placeholder="Search food..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
          <option value="">All meals</option>
          {MEAL_TYPES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Entry' : 'Log Meal'}</h2>
            <NutritionForm
              initial={editing}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : logs.length === 0 ? (
        <div className="empty-card card">
          <p>No nutrition logs. <button className="link-btn" onClick={() => setShowForm(true)}>Log your first meal</button></p>
        </div>
      ) : (
        <div className="nutrition-list">
          {logs.map((log) => (
            <div key={log.id} className="nutrition-card card">
              <div className="nutrition-header">
                <span className="meal-badge">{log.meal_type}</span>
                <span className="nutrition-date">{format(new Date(log.date), 'MMM d, yyyy')}</span>
                <div className="nutrition-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(log); setShowForm(true); }}>Edit</button>
                  <button className="btn btn-ghost btn-sm danger" onClick={() => handleDelete(log.id)}>Delete</button>
                </div>
              </div>
              <p className="nutrition-food">{log.food_items}</p>
              <div className="nutrition-macros">
                {log.calories != null && <span>{log.calories} cal</span>}
                {log.protein != null && <span>P: {log.protein}g</span>}
                {log.carbs != null && <span>C: {log.carbs}g</span>}
                {log.fat != null && <span>F: {log.fat}g</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
