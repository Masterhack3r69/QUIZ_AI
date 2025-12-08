import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import OTP from '../models/OTP.postgres.js';
import User from '../models/User.postgres.js';

/**
 * Generate a cryptographically secure 6-digit OTP code
 */
export function generateOTP() {
  const code = crypto.randomInt(100000, 999999);
  return code.toString();
}

/**
 * Create and store a new OTP for the given email
 */
export async function createOTP(email) {
  await invalidatePreviousOTPs(email);
  
  const code = generateOTP();
  const hashedCode = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  
  const otp = await OTP.create({
    email: email.toLowerCase(),
    code: hashedCode,
    expiresAt
  });
  
  return { code, otp };
}

/**
 * Validate an OTP code for the given email
 */
export async function validateOTP(email, code) {
  const otp = await OTP.findOne({ email: email.toLowerCase() });
  
  if (!otp) {
    return { valid: false, otp: null };
  }
  
  if (otp.isExpired()) {
    return { valid: false, otp };
  }
  
  const isMatch = await bcrypt.compare(code, otp.code);
  return { valid: isMatch, otp };
}

/**
 * Invalidate all previous OTPs for the given email
 */
export async function invalidatePreviousOTPs(email) {
  await OTP.invalidateAll(email);
}

/**
 * Check if the user has exceeded the rate limit for OTP attempts
 */
export async function checkRateLimit(email) {
  const user = await User.findOne({ email: email.toLowerCase() });
  
  if (!user) {
    return { limited: false, user: null };
  }
  
  if (user.isOTPLocked()) {
    return { limited: true, user };
  }
  
  if (user.failedOTPAttempts >= 5) {
    user.otpLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    return { limited: true, user };
  }
  
  return { limited: false, user };
}
