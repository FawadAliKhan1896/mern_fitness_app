import { useEffect, useState } from 'react';
import { settings as settingsApi } from '../api/client';
import './Settings.css';

export default function Settings() {
  const [units, setUnits] = useState('metric');
  const [theme, setTheme] = useState('light');
  const [notifications_enabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    settingsApi.get().then((s) => {
      setUnits(s.units || 'metric');
      setTheme(s.theme || 'light');
      setNotificationsEnabled(s.notifications_enabled !== 0);
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      await settingsApi.update({
        units,
        theme,
        notifications_enabled,
      });
      setSaved(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Settings</h1>
      <form onSubmit={handleSubmit} className="settings-form card">
        <div className="form-group">
          <label>Units</label>
          <select value={units} onChange={(e) => setUnits(e.target.value)}>
            <option value="metric">Metric (kg, cm)</option>
            <option value="imperial">Imperial (lb, in)</option>
          </select>
        </div>
        <div className="form-group">
          <label>Theme</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={notifications_enabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
            />
            Enable notifications
          </label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
        {saved && <span className="saved-msg">Saved!</span>}
      </form>
    </div>
  );
}
