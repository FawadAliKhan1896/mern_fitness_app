import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { workouts as workoutsApi } from '../api/client';
import './WorkoutDetail.css';

export default function WorkoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    workoutsApi.get(id)
      .then(setWorkout)
      .catch(() => setWorkout(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this workout?')) return;
    try {
      await workoutsApi.delete(id);
      navigate('/workouts');
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (!workout) return <div className="container"><p>Workout not found.</p></div>;

  return (
    <div className="container">
      <div className="workout-detail-header">
        <div>
          <h1>{workout.name}</h1>
          <span className="category-badge">{workout.category}</span>
          <span className="workout-date">{format(new Date(workout.date), 'MMMM d, yyyy')}</span>
        </div>
        <div className="workout-detail-actions">
          <Link to={`/workouts/${id}/edit`} className="btn btn-primary">Edit</Link>
          <button onClick={handleDelete} className="btn btn-outline danger">Delete</button>
        </div>
      </div>

      {workout.notes && (
        <div className="card workout-notes">
          <h3>Notes</h3>
          <p>{workout.notes}</p>
        </div>
      )}

      <div className="card">
        <h3>Exercises</h3>
        {workout.exercises?.length ? (
          <table className="exercise-table">
            <thead>
              <tr>
                <th>Exercise</th>
                <th>Sets</th>
                <th>Reps</th>
                <th>Weight</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {workout.exercises.map((ex) => (
                <tr key={ex.id}>
                  <td>{ex.exercise_name}</td>
                  <td>{ex.sets}</td>
                  <td>{ex.reps ?? '—'}</td>
                  <td>{ex.weight ? `${ex.weight} kg` : '—'}</td>
                  <td>{ex.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty">No exercises in this workout.</p>
        )}
      </div>
    </div>
  );
}
