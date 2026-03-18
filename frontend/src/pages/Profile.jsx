import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await updateProfile({ name, email });
      setMessage('Profile updated successfully');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Profile</h1>
      <div className="profile-card card">
        <div className="profile-avatar">
          {user?.profile_picture ? (
            <img src={user.profile_picture} alt="" />
          ) : (
            <span className="avatar-placeholder large">
              {user?.name?.[0] || user?.username?.[0] || '?'}
            </span>
          )}
        </div>
        <p className="profile-username">@{user?.username}</p>
        <form onSubmit={handleSubmit} className="profile-form">
          {message && <div className={`profile-msg ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
          <div className="form-group">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
