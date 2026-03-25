import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  scheduled_time: {
    type: Date,
    required: true
  },
  recurrence: String,
  enabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
reminderSchema.index({ user_id: 1, scheduled_time: 1 });

const Reminder = mongoose.model('Reminder', reminderSchema);

export default Reminder;