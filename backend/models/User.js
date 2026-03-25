import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password_hash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    trim: true
  },
  profile_picture: {
    type: String
  },
  settings: {
    units: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric'
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications_enabled: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;