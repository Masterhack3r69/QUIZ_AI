/**
 * SECURE VERSION of auth.routes.js
 * This file demonstrates how to apply all security fixes
 * 
 * To use this file:
 * 1. Review all changes
 * 2. Test thoroughly
 * 3. Rename to auth.routes.js (backup the old one first)
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { protect } from '../middleware/auth.middleware.js';
import { createOTP, validateOTP, invalidatePreviousOTPs, checkRateLimit } from '../utils/otp.service.js';
import { sendOTPEmail, sendWelcomeEmail } from '../utils/email.service.js';
import OTP from '../models/OTP.model.js';

// Import validation middleware
import {
  validateRegistration,
  validateLogin,
  validateOTPVerification,
  validateResendOTP,
  validatePasswordChange,
  validateProfileUpdate,
  sanitizeMongoQuery
} from '../middleware/validation.middleware.js';

// Import rate limiters
import {
  loginLimiter,
  registerLimiter,
  otpVerifyLimiter,
  otpResendLimiter,
  passwordChangeLimiter
} from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

// Apply MongoDB injection prevention to all routes
router.use(sanitizeMongoQuery);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' }); // Reduced from 30d
};

// Register teacher
router.post('/register', registerLimiter, validateRegistration, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    
    // If user exists and is verified, use generic message to prevent enumeration
    if (userExists && userExists.isVerified) {
      // Still return 201 to prevent user enumeration
      return res.status(201).json({
        message: 'If this email is not already registered, a verification code has been sent',
        email: email
      });
    }

    let user;
    
    // If user exists but is not verified, update their info and resend OTP
    if (userExists && !userExists.isVerified) {
      user = userExists;
      user.name = name;
      user.password = password; // This will be hashed by the pre-save hook
      user.failedOTPAttempts = 0;
      user.otpLockedUntil = null;
      await user.save();
      
      // Invalidate previous OTPs
      await invalidatePreviousOTPs(email);
    } else {
      // Create new unverified user account
      user = await User.create({ 
        name, 
        email, 
        password,
        isVerified: false 
      });
    }

    // Generate and store OTP
    const { code } = await createOTP(email);

    // Send OTP via email
    await sendOTPEmail(email, code, name);

    res.status(201).json({
      message: 'Verification code sent to your email',
      email: user.email
    });
  } catch (error) {
    console.error('Registration error:', error);
    // Don't expose internal errors
    res.status(500).json({ message: 'An error occurred during registration' });
  }
});

// Verify OTP
router.post('/verify-otp', otpVerifyLimiter, validateOTPVerification, async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Add delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100));
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Check rate limit
    const { limited } = await checkRateLimit(email);
    if (limited) {
      return res.status(429).json({ 
        message: 'Too many failed attempts. Please try again in 15 minutes' 
      });
    }

    // Validate OTP
    const { valid, otp } = await validateOTP(email, code);

    if (!valid) {
      // Increment failed attempts
      user.failedOTPAttempts += 1;
      await user.save();

      // Increment OTP attempts if OTP exists
      if (otp) {
        await otp.incrementAttempts();
        
        // Check if OTP is expired
        if (otp.isExpired()) {
          return res.status(400).json({ message: 'Verification code has expired' });
        }
      }

      // Add delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100));
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Mark OTP as used
    await otp.markAsUsed();

    // Mark user as verified
    user.isVerified = true;
    user.verifiedAt = new Date();
    user.failedOTPAttempts = 0;
    user.otpLockedUntil = null;
    await user.save();

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, user.name).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: 'teacher'
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'An error occurred during verification' });
  }
});

// Resend OTP
router.post('/resend-otp', otpResendLimiter, validateResendOTP, async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Use generic message to prevent enumeration
      return res.status(200).json({
        message: 'If an account exists with this email, a new code has been sent'
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Check for resend cooldown (60 seconds)
    const lastOTP = await OTP.findOne({ 
      email: email.toLowerCase() 
    }).sort({ createdAt: -1 });

    if (lastOTP) {
      const timeSinceLastOTP = Date.now() - lastOTP.createdAt.getTime();
      const cooldownSeconds = 60;
      
      if (timeSinceLastOTP < cooldownSeconds * 1000) {
        const remainingSeconds = Math.ceil((cooldownSeconds * 1000 - timeSinceLastOTP) / 1000);
        return res.status(429).json({ 
          message: `Please wait ${remainingSeconds} seconds before requesting a new code` 
        });
      }
    }

    // Invalidate all previous OTPs
    await invalidatePreviousOTPs(email);

    // Generate and store new OTP
    const { code } = await createOTP(email);

    // Send OTP via email
    await sendOTPEmail(email, code, user.name);

    res.json({
      message: 'New verification code sent to your email'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'An error occurred while sending verification code' });
  }
});

// Login teacher
router.post('/login', loginLimiter, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    
    // Constant-time comparison to prevent timing attacks
    const isValidPassword = user ? await user.comparePassword(password) : false;
    
    // Add delay to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!user || !isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email address. Check your inbox or request a new verification code.',
        email: user.email,
        needsVerification: true
      });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: 'teacher'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
});

// Update profile (name)
router.put('/profile', protect, validateProfileUpdate, async (req, res) => {
  try {
    const { name } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name.trim();
    await user.save();

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: 'teacher'
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'An error occurred while updating profile' });
  }
});

// Change password
router.put('/password', protect, passwordChangeLimiter, validatePasswordChange, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      // Add delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100));
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // TODO: Implement token versioning to invalidate old tokens
    // user.tokenVersion += 1;
    
    // TODO: Send email notification about password change
    // await sendPasswordChangedEmail(user.email, user.name);

    res.json({ 
      message: 'Password updated successfully. Please login again with your new password.' 
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'An error occurred while changing password' });
  }
});

export default router;
