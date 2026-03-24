import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
       setMessage('Please select an image file');
       return;
    }

    setAvatarLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await updateProfile({ profile_picture: reader.result });
        setMessage('Profile picture updated successfully');
      } catch (err) {
        setMessage(err.message);
      } finally {
        setAvatarLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

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
        <div className="profile-avatar-container">
          <label className={`profile-avatar ${avatarLoading ? 'loading' : ''}`}>
            <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={avatarLoading} hidden />
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt="" />
            ) : (
              <span className="avatar-placeholder large">
                {user?.name?.[0] || user?.username?.[0] || '?'}
              </span>
            )}
            <div className="avatar-overlay">
               <span>{avatarLoading ? 'Uploading...' : 'Change'}</span>
            </div>
          </label>
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
