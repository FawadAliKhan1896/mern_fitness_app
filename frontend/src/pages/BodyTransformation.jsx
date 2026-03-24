import { useEffect, useState } from 'react';
import { progress as progressApi } from '../api/client';
import BodyVisualizer from '../components/BodyVisualizer';
import './BodyTransformation.css';

export default function BodyTransformation() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch all historical progress to ensure the timeline slider has maximum data range
    progressApi.list()
      .then((res) => {
        // Handle pagination/list format if returned as { data: [...] }
        const progressArray = Array.isArray(res) ? res : res.data || [];
        setData(progressArray);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container transformation-loading">
        <div className="loading-spinner" />
        <p>Initializing Scan Engine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="transformation-error">
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            Retry Scan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container transformation-page">
      <header className="transformation-header">
        <div>
          <h1>Body Transformation Center</h1>
          <p className="dashboard-sub">Explore your full anatomical progress history</p>
        </div>
      </header>

      <section className="visualizer-wrapper">
        <BodyVisualizer progressData={data} />
      </section>
    </div>
  );
}
