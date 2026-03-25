import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  exercise_name: {
    type: String,
    required: true,
    trim: true
  },
  sets: {
    type: Number,
    default: 3,
    min: 1
  },
  reps: Number,
  weight: Number,
  notes: String
}, { _id: true });

const workoutSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  date: {
    type: Date,
    required: true
  },
  notes: String,
  exercises: [exerciseSchema]
}, {
  timestamps: true
});

// Indexes for better query performance
workoutSchema.index({ user_id: 1, date: -1 });
workoutSchema.index({ user_id: 1, category: 1 });

const Workout = mongoose.model('Workout', workoutSchema);

export default Workout;