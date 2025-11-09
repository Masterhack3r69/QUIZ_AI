import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  code: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900 // Auto-delete after 15 minutes (TTL index)
  }
});

otpSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

otpSchema.methods.incrementAttempts = async function() {
  this.attempts += 1;
  await this.save();
};

otpSchema.methods.markAsUsed = async function() {
  this.isUsed = true;
  await this.save();
};

export default mongoose.model('OTP', otpSchema);
