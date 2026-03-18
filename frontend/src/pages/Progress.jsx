import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { progress as progressApi } from '../api/client';
import ProgressForm from '../components/ProgressForm';
import './Progress.css';

export default function Progress() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchEntries = () => {
    progressApi.list({ limit: 50 }).then(setEntries).finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    fetchEntries();
  }, []);

  const handleSave = () => {
    setShowForm(false);
    setEditing(null);
    setLoading(true);
    fetchEntries();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await progressApi.delete(id);
      setEntries((e) => e.filter((x) => x.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Progress</h1>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
          Record Progress
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Entry' : 'Record Progress'}</h2>
            <ProgressForm
              initial={editing}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : entries.length === 0 ? (
        <div className="empty-card card">
          <p>No progress entries. <button className="link-btn" onClick={() => setShowForm(true)}>Record your first entry</button></p>
        </div>
      ) : (
        <div className="progress-list">
          {entries.map((entry) => (
            <div key={entry.id} className="progress-card card">
              <div className="progress-header">
                <span className="progress-date">{format(new Date(entry.date), 'MMM d, yyyy')}</span>
                <div className="progress-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(entry); setShowForm(true); }}>Edit</button>
                  <button className="btn btn-ghost btn-sm danger" onClick={() => handleDelete(entry.id)}>Delete</button>
                </div>
              </div>
              <div className="progress-metrics">
                {entry.weight != null && <div className="metric"><span className="label">Weight</span><span className="value">{entry.weight} kg</span></div>}
                {entry.body_fat != null && <div className="metric"><span className="label">Body Fat</span><span className="value">{entry.body_fat}%</span></div>}
                {entry.chest != null && <div className="metric"><span className="label">Chest</span><span className="value">{entry.chest} cm</span></div>}
                {entry.waist != null && <div className="metric"><span className="label">Waist</span><span className="value">{entry.waist} cm</span></div>}
                {entry.hips != null && <div className="metric"><span className="label">Hips</span><span className="value">{entry.hips} cm</span></div>}
                {entry.biceps != null && <div className="metric"><span className="label">Biceps</span><span className="value">{entry.biceps} cm</span></div>}
                {entry.thighs != null && <div className="metric"><span className="label">Thighs</span><span className="value">{entry.thighs} cm</span></div>}
                {entry.run_time_minutes != null && <div className="metric"><span className="label">Run Time</span><span className="value">{entry.run_time_minutes} min</span></div>}
                {entry.lifting_weight != null && <div className="metric"><span className="label">Lift</span><span className="value">{entry.lifting_weight} kg</span></div>}
              </div>
              {entry.notes && <p className="progress-notes">{entry.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
