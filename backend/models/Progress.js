import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weight: Number,
  body_fat: Number,
  chest: Number,
  waist: Number,
  hips: Number,
  biceps: Number,
  thighs: Number,
  run_time_minutes: Number,
  lifting_weight: Number,
  metric_type: String,
  date: {
    type: Date,
    required: true
  },
  notes: String
}, {
  timestamps: true
});

// Indexes
progressSchema.index({ user_id: 1, date: -1 });

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;