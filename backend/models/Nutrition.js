import mongoose from 'mongoose';

const nutritionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  meal_type: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snack']
  },
  food_items: {
    type: String,
    required: true
  },
  quantity: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  date: {
    type: Date,
    required: true
  },
  notes: String
}, {
  timestamps: true
});

// Indexes
nutritionSchema.index({ user_id: 1, date: -1 });

const Nutrition = mongoose.model('Nutrition', nutritionSchema);

export default Nutrition;