import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.model.js';

dotenv.config();

const cleanupUnverifiedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete unverified users older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: twentyFourHoursAgo }
    });

    console.log(`Deleted ${result.deletedCount} unverified users older than 24 hours`);
    
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

cleanupUnverifiedUsers();
