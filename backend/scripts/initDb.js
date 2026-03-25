import connectDB from '../db.js';
import User from '../models/User.js';
import Workout from '../models/Workout.js';
import Nutrition from '../models/Nutrition.js';
import Progress from '../models/Progress.js';
import Notification from '../models/Notification.js';
import Reminder from '../models/Reminder.js';

const initDatabase = async () => {
  try {
    await connectDB();

    // Create indexes (Mongoose handles this automatically based on schema definitions)
    console.log('Database indexes created successfully.');

    // Optional: Seed with sample data if needed
    // You can add seed data here if required

    console.log('Database initialized successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initDatabase();
