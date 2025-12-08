import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['teacher'],
    default: 'teacher'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  failedOTPAttempts: {
    type: Number,
    default: 0
  },
  otpLockedUntil: {
    type: Date
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isOTPLocked = function() {
  if (!this.otpLockedUntil) return false;
  return new Date() < this.otpLockedUntil;
};

userSchema.methods.resetOTPLock = function() {
  this.failedOTPAttempts = 0;
  this.otpLockedUntil = null;
};

export default mongoose.model('User', userSchema);
