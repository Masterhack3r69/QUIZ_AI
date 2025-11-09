import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

// User Schema (minimal version for migration)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isVerified: Boolean,
  verifiedAt: Date,
  failedOTPAttempts: Number,
  otpLockedUntil: Date
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function migrateExistingUsers() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Find all users that don't have isVerified field or have it set to false
    const usersToUpdate = await User.find({
      $or: [
        { isVerified: { $exists: false } },
        { isVerified: false, createdAt: { $lt: new Date() } }
      ]
    });

    console.log(`Found ${usersToUpdate.length} users to migrate`);

    if (usersToUpdate.length === 0) {
      console.log('No users need migration. All users are already verified.');
      await mongoose.connection.close();
      return;
    }

    // Update all existing users to be verified
    const result = await User.updateMany(
      {
        $or: [
          { isVerified: { $exists: false } },
          { isVerified: false, createdAt: { $lt: new Date() } }
        ]
      },
      {
        $set: {
          isVerified: true,
          verifiedAt: new Date(),
          failedOTPAttempts: 0,
          otpLockedUntil: null
        }
      }
    );

    console.log(`Migration completed successfully!`);
    console.log(`- Users updated: ${result.modifiedCount}`);
    console.log(`- Users matched: ${result.matchedCount}`);

    // Verify the migration
    const verifiedCount = await User.countDocuments({ isVerified: true });
    const totalCount = await User.countDocuments();
    console.log(`\nVerification:`);
    console.log(`- Total users: ${totalCount}`);
    console.log(`- Verified users: ${verifiedCount}`);

    // Close the connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the migration
migrateExistingUsers();
