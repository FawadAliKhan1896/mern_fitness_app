import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { subDays, format } from 'date-fns';
import { analytics as analyticsApi } from '../api/client';
import './Analytics.css';

const COLORS = ['#ff4a9b', '#e63d8a', '#cc3480', '#b32b6f', '#99225e'];

export default function Analytics() {
  const [workoutData, setWorkoutData] = useState(null);
  const [nutritionData, setNutritionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  useEffect(() => {
    const to = format(new Date(), 'yyyy-MM-dd');
    const from = format(subDays(new Date(), range), 'yyyy-MM-dd');
    Promise.all([
      analyticsApi.workouts({ from, to }),
      analyticsApi.nutrition({ from, to }),
    ])
      .then(([w, n]) => {
        setWorkoutData(w);
        setNutritionData(n);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) return <div className="container"><p>Loading analytics...</p></div>;

  const categoryPieData = workoutData?.byCategory
    ? Object.entries(workoutData.byCategory).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="container">
      <h1>Analytics</h1>
      <div className="analytics-controls">
        <select value={range} onChange={(e) => setRange(Number(e.target.value))}>
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="analytics-grid">
        <section className="analytics-card card">
          <h3>Workouts by Category</h3>
          {categoryPieData.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {categoryPieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-chart">No workout data for this period</p>
          )}
          {workoutData && <p className="stat">Total workouts: {workoutData.totalWorkouts}</p>}
        </section>

        <section className="analytics-card card">
          <h3>Workout Frequency</h3>
          {workoutData?.byDate?.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={workoutData.byDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--accent)" name="Workouts" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-chart">No workout data for this period</p>
          )}
        </section>

        <section className="analytics-card card full-width">
          <h3>Calorie & Macronutrient Trends</h3>
          {nutritionData?.dailyTrends?.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={nutritionData.dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="calories" stroke="#ff4a9b" name="Calories" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="protein" stroke="#4a90d9" name="Protein (g)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="carbs" stroke="#50c878" name="Carbs (g)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="fat" stroke="#f5a623" name="Fat (g)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-chart">No nutrition data for this period</p>
          )}
        </section>

        {nutritionData?.totals && (
          <section className="analytics-card card">
            <h3>Total Intake (Period)</h3>
            <div className="totals-grid">
              <div className="total-item">
                <span className="total-value">{Math.round(nutritionData.totals.calories)}</span>
                <span className="total-label">Calories</span>
              </div>
              <div className="total-item">
                <span className="total-value">{Math.round(nutritionData.totals.protein)}g</span>
                <span className="total-label">Protein</span>
              </div>
              <div className="total-item">
                <span className="total-value">{Math.round(nutritionData.totals.carbs)}g</span>
                <span className="total-label">Carbs</span>
              </div>
              <div className="total-item">
                <span className="total-value">{Math.round(nutritionData.totals.fat)}g</span>
                <span className="total-label">Fat</span>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
