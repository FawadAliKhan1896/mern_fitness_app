import { useState } from 'react';
import { format, subDays } from 'date-fns';
import './Export.css';

export default function Export() {
  const [formatType, setFormatType] = useState('json');
  const [dataType, setDataType] = useState('all');
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    const to = format(new Date(), 'yyyy-MM-dd');
    const from = format(subDays(new Date(), days), 'yyyy-MM-dd');
    setLoading(true);
    try {
      const res = await fetch(`/api/export/report?${new URLSearchParams({ format: formatType, type: dataType, from, to })}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fitness-report.${formatType}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Export Report</h1>
      <div className="export-card card">
        <p>Generate a report of your fitness data for the selected period.</p>
        <div className="export-form">
          <div className="form-group">
            <label>Format</label>
            <select value={formatType} onChange={(e) => setFormatType(e.target.value)}>
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          <div className="form-group">
            <label>Data Type</label>
            <select value={dataType} onChange={(e) => setDataType(e.target.value)}>
              <option value="all">All</option>
              <option value="workouts">Workouts</option>
              <option value="nutrition">Nutrition</option>
              <option value="progress">Progress</option>
            </select>
          </div>
          <div className="form-group">
            <label>Period (days)</label>
            <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleDownload} disabled={loading}>
          {loading ? 'Preparing...' : 'Download Report'}
        </button>
      </div>
    </div>
  );
}
