import { useState } from 'react';
import './Support.css';

export default function Support() {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setMessage('');
  };

  return (
    <div className="container">
      <h1>Support</h1>
      <div className="support-card card">
        <p>Need help? Report an issue or send us feedback. We'll get back to you as soon as possible.</p>
        {submitted ? (
          <div className="support-success">
            Thank you for your message. We'll respond shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Your Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
                placeholder="Describe your issue or feedback..."
              />
            </div>
            <button type="submit" className="btn btn-primary">Send</button>
          </form>
        )}
      </div>
    </div>
  );
}
