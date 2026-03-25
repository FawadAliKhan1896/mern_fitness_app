import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { workouts as workoutsApi } from '../api/client';
import { format } from 'date-fns';
import './WorkoutForm.css';

const CATEGORIES = ['strength', 'cardio', 'flexibility', 'hiit', 'other'];
const CATEGORY_ICONS = {
  strength: '🏋️‍♂️',
  cardio: '🏃‍♂️',
  flexibility: '🧘‍♀️',
  hiit: '⚡',
  other: '🎯'
};

export default function WorkoutForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('strength');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState([{ exercise_name: '', sets: 3, reps: '', weight: '', notes: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      workoutsApi.get(id).then((w) => {
        setName(w.name);
        setCategory(w.category);
        setDate(w.date);
        setNotes(w.notes || '');
        setExercises(
          w.exercises?.length
            ? w.exercises.map((e) => ({
                exercise_name: e.exercise_name,
                sets: e.sets || 3,
                reps: e.reps ?? '',
                weight: e.weight ?? '',
                notes: e.notes || '',
              }))
            : [{ exercise_name: '', sets: 3, reps: '', weight: '', notes: '' }]
        );
      }).catch((e) => setError(e.message));
    }
  }, [id, isEdit]);

  const addExercise = () => {
    setExercises((e) => [...e, { exercise_name: '', sets: 3, reps: '', weight: '', notes: '' }]);
  };

  const updateExercise = (i, field, value) => {
    setExercises((e) => {
      const next = [...e];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const removeExercise = (i) => {
    if (exercises.length <= 1) return;
    setExercises((e) => e.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = {
      name,
      category,
      date: date + 'T12:00:00',
      notes,
      exercises: exercises.filter((ex) => ex.exercise_name.trim()),
    };
    try {
      if (isEdit) {
        await workoutsApi.update(id, payload);
        navigate(`/workouts/${id}`);
      } else {
        const w = await workoutsApi.create(payload);
        navigate(`/workouts/${w.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>{isEdit ? 'Edit Workout' : 'New Workout'}</h1>
      <div className="workout-form-layout">
        <form onSubmit={handleSubmit} className="workout-form card">
          {error && <div className="form-error">{error}</div>}
          <div className="form-row">
            <div className="form-group">
              <label>Workout Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>

        <div className="exercises-section">
          <div className="exercises-header">
            <h3>Exercises</h3>
            <button type="button" className="btn btn-outline btn-sm" onClick={addExercise}>Add Exercise</button>
          </div>
          {exercises.map((ex, i) => (
            <div key={i} className="exercise-row">
              <input
                placeholder="Exercise name"
                value={ex.exercise_name}
                onChange={(e) => updateExercise(i, 'exercise_name', e.target.value)}
              />
              <input type="number" placeholder="Sets" min={1} value={ex.sets} onChange={(e) => updateExercise(i, 'sets', +e.target.value || 3)} />
              <input type="number" placeholder="Reps" value={ex.reps} onChange={(e) => updateExercise(i, 'reps', e.target.value)} />
              <input type="number" step="0.5" placeholder="Weight (kg)" value={ex.weight} onChange={(e) => updateExercise(i, 'weight', e.target.value)} />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeExercise(i)}>Remove</button>
            </div>
          ))}
        </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
        <div className="category-visualizer glass-panel card">
           <div className="category-icon-wrapper" key={category}>
             {CATEGORY_ICONS[category]}
           </div>
           <h3>{category.charAt(0).toUpperCase() + category.slice(1)} Session</h3>
           <p className="muted">Log your sets, reps, and track your history carefully.</p>
        </div>
      </div>
    </div>
  );
}
