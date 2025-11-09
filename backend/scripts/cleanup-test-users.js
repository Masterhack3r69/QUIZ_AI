import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';
import User from '../src/models/User.model.js';
import OTP from '../src/models/OTP.model.js';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function cleanupTestUsers() {
  try {
    console.log('\n🧹 Test User Cleanup Tool\n');
    console.log('========================\n');

    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Get email to clean up
    const email = await question('Enter email address to clean up (or "all" to see all users): ');

    if (email.toLowerCase() === 'all') {
      // Show all users
      const users = await User.find({}).select('email name isVerified createdAt');
      console.log(`\n📋 Found ${users.length} users:\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Verified: ${user.isVerified ? '✅' : '❌'}`);
        console.log(`   Created: ${user.createdAt.toLocaleString()}\n`);
      });

      const emailToDelete = await question('\nEnter email to delete (or press Enter to cancel): ');
      if (!emailToDelete.trim()) {
        console.log('❌ Cancelled\n');
        return;
      }

      // Delete specific user
      const user = await User.findOne({ email: emailToDelete.toLowerCase() });
      if (!user) {
        console.log(`❌ User not found: ${emailToDelete}\n`);
        return;
      }

      await User.deleteOne({ email: emailToDelete.toLowerCase() });
      await OTP.deleteMany({ email: emailToDelete.toLowerCase() });
      console.log(`✅ Deleted user: ${emailToDelete}\n`);
    } else {
      // Check if user exists
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        console.log(`\n❌ User not found: ${email}\n`);
        
        // Check for OTPs
        const otps = await OTP.find({ email: email.toLowerCase() });
        if (otps.length > 0) {
          console.log(`⚠️  Found ${otps.length} OTP(s) for this email`);
          const deleteOTPs = await question('Delete OTPs? (y/n): ');
          if (deleteOTPs.toLowerCase() === 'y') {
            await OTP.deleteMany({ email: email.toLowerCase() });
            console.log('✅ OTPs deleted\n');
          }
        }
        return;
      }

      // Show user details
      console.log('\n📋 User Details:\n');
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Verified: ${user.isVerified ? '✅ Yes' : '❌ No'}`);
      console.log(`Created: ${user.createdAt.toLocaleString()}`);
      console.log(`Failed OTP Attempts: ${user.failedOTPAttempts}`);
      if (user.otpLockedUntil) {
        console.log(`Locked Until: ${user.otpLockedUntil.toLocaleString()}`);
      }

      // Check for OTPs
      const otps = await OTP.find({ email: email.toLowerCase() });
      console.log(`\nOTPs: ${otps.length} found`);
      if (otps.length > 0) {
        otps.forEach((otp, index) => {
          console.log(`  ${index + 1}. Created: ${otp.createdAt.toLocaleString()}`);
          console.log(`     Expires: ${otp.expiresAt.toLocaleString()}`);
          console.log(`     Used: ${otp.isUsed ? 'Yes' : 'No'}`);
          console.log(`     Expired: ${otp.isExpired() ? 'Yes' : 'No'}`);
        });
      }

      // Confirm deletion
      const confirm = await question('\n⚠️  Delete this user and all associated OTPs? (y/n): ');
      
      if (confirm.toLowerCase() === 'y') {
        await User.deleteOne({ email: email.toLowerCase() });
        await OTP.deleteMany({ email: email.toLowerCase() });
        console.log('\n✅ User and OTPs deleted successfully\n');
      } else {
        console.log('\n❌ Cancelled\n');
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log('👋 Disconnected from database\n');
    process.exit(0);
  }
}

cleanupTestUsers();
