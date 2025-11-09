import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import OTP from '../models/OTP.model.js';
import User from '../models/User.model.js';

/**
 * Generate a cryptographically secure 6-digit OTP code
 * @returns {string} 6-digit OTP code
 */
export function generateOTP() {
  const code = crypto.randomInt(100000, 999999);
  return code.toString();
}

/**
 * Create and store a new OTP for the given email
 * @param {string} email - User's email address
 * @returns {Promise<{code: string, otp: Object}>} Generated OTP code and OTP document
 */
export async function createOTP(email) {
  // Invalidate any previous OTPs for this email
  await invalidatePreviousOTPs(email);
  
  // Generate new OTP code
  const code = generateOTP();
  
  // Hash the code before storing
  const hashedCode = await bcrypt.hash(code, 10);
  
  // Set expiration to 10 minutes from now
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  
  // Create OTP document
  const otp = await OTP.create({
    email: email.toLowerCase(),
    code: hashedCode,
    expiresAt,
    attempts: 0,
    isUsed: false
  });
  
  return { code, otp };
}

/**
 * Validate an OTP code for the given email
 * @param {string} email - User's email address
 * @param {string} code - OTP code to validate
 * @returns {Promise<{valid: boolean, otp: Object|null}>} Validation result and OTP document
 */
export async function validateOTP(email, code) {
  // Find the most recent unused OTP for this email
  const otp = await OTP.findOne({
    email: email.toLowerCase(),
    isUsed: false
  }).sort({ createdAt: -1 });
  
  if (!otp) {
    return { valid: false, otp: null };
  }
  
  // Check if OTP is expired
  if (otp.isExpired()) {
    return { valid: false, otp };
  }
  
  // Compare the provided code with the hashed code
  const isMatch = await bcrypt.compare(code, otp.code);
  
  return { valid: isMatch, otp };
}

/**
 * Invalidate all previous OTPs for the given email
 * @param {string} email - User's email address
 * @returns {Promise<void>}
 */
export async function invalidatePreviousOTPs(email) {
  await OTP.updateMany(
    { email: email.toLowerCase(), isUsed: false },
    { $set: { isUsed: true } }
  );
}

/**
 * Check if the user has exceeded the rate limit for OTP attempts
 * @param {string} email - User's email address
 * @returns {Promise<{limited: boolean, user: Object|null}>} Rate limit status and user document
 */
export async function checkRateLimit(email) {
  const user = await User.findOne({ email: email.toLowerCase() });
  
  if (!user) {
    return { limited: false, user: null };
  }
  
  // Check if user is currently locked
  if (user.isOTPLocked()) {
    return { limited: true, user };
  }
  
  // Check if user has exceeded max attempts (5)
  if (user.failedOTPAttempts >= 5) {
    // Lock the user for 15 minutes
    user.otpLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    return { limited: true, user };
  }
  
  return { limited: false, user };
}
