import { useState, useEffect } from 'react';
import { nutrition as nutritionApi } from '../api/client';
import { format } from 'date-fns';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks'];

export default function NutritionForm({ initial, onSave, onCancel }) {
  const [meal_type, setMealType] = useState('breakfast');
  const [food_items, setFoodItems] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [quantity, setQuantity] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) {
      setMealType(initial.meal_type);
      setFoodItems(initial.food_items);
      setDate(initial.date);
      setQuantity(initial.quantity || '');
      setCalories(initial.calories ?? '');
      setProtein(initial.protein ?? '');
      setCarbs(initial.carbs ?? '');
      setFat(initial.fat ?? '');
      setNotes(initial.notes || '');
    }
  }, [initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = {
      meal_type,
      food_items,
      date: date + 'T12:00:00',
      quantity: quantity || undefined,
      calories: calories ? parseFloat(calories) : undefined,
      protein: protein ? parseFloat(protein) : undefined,
      carbs: carbs ? parseFloat(carbs) : undefined,
      fat: fat ? parseFloat(fat) : undefined,
      notes: notes || undefined,
    };
    try {
      if (initial) {
        await nutritionApi.update(initial.id, payload);
      } else {
        await nutritionApi.create(payload);
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
        <label>Meal Type</label>
        <select value={meal_type} onChange={(e) => setMealType(e.target.value)} required>
          {MEAL_TYPES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Food Items</label>
        <input value={food_items} onChange={(e) => setFoodItems(e.target.value)} required placeholder="e.g. Chicken breast, rice, broccoli" />
      </div>
      <div className="form-group">
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Quantity (optional)</label>
        <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 200g, 1 cup" />
      </div>
      <div className="form-row-macros">
        <div className="form-group">
          <label>Calories</label>
          <input type="number" step="1" value={calories} onChange={(e) => setCalories(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Protein (g)</label>
          <input type="number" step="0.1" value={protein} onChange={(e) => setProtein(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Carbs (g)</label>
          <input type="number" step="0.1" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Fat (g)</label>
          <input type="number" step="0.1" value={fat} onChange={(e) => setFat(e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label>Notes (optional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : initial ? 'Update' : 'Log'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
