import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { protect } from '../middleware/auth.middleware.js';
import { createOTP, validateOTP, invalidatePreviousOTPs, checkRateLimit } from '../utils/otp.service.js';
import { sendOTPEmail, sendWelcomeEmail } from '../utils/email.service.js';
import OTP from '../models/OTP.model.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register teacher
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    
    // If user exists and is verified, reject registration
    if (userExists && userExists.isVerified) {
      return res.status(400).json({ message: 'User already exists' });
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
    res.status(500).json({ message: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body;

    // Validate request body
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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
    res.status(500).json({ message: error.message });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate request body
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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
      message: `New code sent to ${email}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login teacher
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
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
    res.status(500).json({ message: error.message });
  }
});

// Update profile (name)
router.put('/profile', protect, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Name is required' });
    }

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
    res.status(500).json({ message: error.message });
  }
});

// Change password
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
