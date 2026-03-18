import { useState, useEffect } from 'react';
import { progress as progressApi } from '../api/client';
import { format } from 'date-fns';

export default function ProgressForm({ initial, onSave, onCancel }) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [weight, setWeight] = useState('');
  const [body_fat, setBodyFat] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [biceps, setBiceps] = useState('');
  const [thighs, setThighs] = useState('');
  const [run_time_minutes, setRunTime] = useState('');
  const [lifting_weight, setLiftingWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) {
      setDate(initial.date);
      setWeight(initial.weight ?? '');
      setBodyFat(initial.body_fat ?? '');
      setChest(initial.chest ?? '');
      setWaist(initial.waist ?? '');
      setHips(initial.hips ?? '');
      setBiceps(initial.biceps ?? '');
      setThighs(initial.thighs ?? '');
      setRunTime(initial.run_time_minutes ?? '');
      setLiftingWeight(initial.lifting_weight ?? '');
      setNotes(initial.notes || '');
    }
  }, [initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      date: date + 'T12:00:00',
      weight: weight ? parseFloat(weight) : undefined,
      body_fat: body_fat ? parseFloat(body_fat) : undefined,
      chest: chest ? parseFloat(chest) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      hips: hips ? parseFloat(hips) : undefined,
      biceps: biceps ? parseFloat(biceps) : undefined,
      thighs: thighs ? parseFloat(thighs) : undefined,
      run_time_minutes: run_time_minutes ? parseFloat(run_time_minutes) : undefined,
      lifting_weight: lifting_weight ? parseFloat(lifting_weight) : undefined,
      notes: notes || undefined,
    };
    const hasAny = Object.entries(payload).some(([k, v]) => k !== 'date' && k !== 'notes' && v != null && v !== '');
    if (!hasAny) {
      setError('Add at least one metric');
      return;
    }
    setLoading(true);
    try {
      if (initial) {
        await progressApi.update(initial.id, payload);
      } else {
        await progressApi.create(payload);
      }
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      <div className="form-group">
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div className="progress-form-grid">
        <div className="form-group">
          <label>Weight (kg)</label>
          <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Body Fat (%)</label>
          <input type="number" step="0.1" value={body_fat} onChange={(e) => setBodyFat(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Chest (cm)</label>
          <input type="number" step="0.1" value={chest} onChange={(e) => setChest(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Waist (cm)</label>
          <input type="number" step="0.1" value={waist} onChange={(e) => setWaist(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Hips (cm)</label>
          <input type="number" step="0.1" value={hips} onChange={(e) => setHips(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Biceps (cm)</label>
          <input type="number" step="0.1" value={biceps} onChange={(e) => setBiceps(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Thighs (cm)</label>
          <input type="number" step="0.1" value={thighs} onChange={(e) => setThighs(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Run Time (min)</label>
          <input type="number" step="1" value={run_time_minutes} onChange={(e) => setRunTime(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Lifting Weight (kg)</label>
          <input type="number" step="0.5" value={lifting_weight} onChange={(e) => setLiftingWeight(e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : initial ? 'Update' : 'Save'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
