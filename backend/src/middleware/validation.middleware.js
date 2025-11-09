/**
 * Input validation middleware
 * Provides validation and sanitization for request data
 */

import { validatePassword } from '../utils/password.validator.js';

/**
 * Sanitize string input
 * @param {string} input - Input to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized string
 */
function sanitizeString(input, maxLength = 255) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Basic XSS prevention
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  if (email.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }
  
  return { valid: true };
}

/**
 * Validate name format
 * @param {string} name - Name to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
function validateName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters long' };
  }
  
  if (trimmedName.length > 50) {
    return { valid: false, error: 'Name must not exceed 50 characters' };
  }
  
  // Allow letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
    return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { valid: true };
}

/**
 * Validate OTP code format
 * @param {string} code - OTP code to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
function validateOTPCode(code) {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Verification code is required' };
  }
  
  if (!/^\d{6}$/.test(code)) {
    return { valid: false, error: 'Verification code must be 6 digits' };
  }
  
  return { valid: true };
}

/**
 * Middleware: Validate registration input
 */
export const validateRegistration = (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate name
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return res.status(400).json({ message: nameValidation.error });
    }
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ message: emailValidation.error });
    }
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors 
      });
    }
    
    // Sanitize inputs
    req.body.name = sanitizeString(name, 50);
    req.body.email = email.toLowerCase().trim();
    
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid input data' });
  }
};

/**
 * Middleware: Validate login input
 */
export const validateLogin = (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password exists
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Sanitize email
    req.body.email = email.toLowerCase().trim();
    
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid input data' });
  }
};

/**
 * Middleware: Validate OTP verification input
 */
export const validateOTPVerification = (req, res, next) => {
  try {
    const { email, code } = req.body;
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ message: emailValidation.error });
    }
    
    // Validate OTP code
    const codeValidation = validateOTPCode(code);
    if (!codeValidation.valid) {
      return res.status(400).json({ message: codeValidation.error });
    }
    
    // Sanitize inputs
    req.body.email = email.toLowerCase().trim();
    req.body.code = code.trim();
    
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid input data' });
  }
};

/**
 * Middleware: Validate resend OTP input
 */
export const validateResendOTP = (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ message: emailValidation.error });
    }
    
    // Sanitize email
    req.body.email = email.toLowerCase().trim();
    
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid input data' });
  }
};

/**
 * Middleware: Validate password change input
 */
export const validatePasswordChange = (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Check current password exists
    if (!currentPassword || typeof currentPassword !== 'string') {
      return res.status(400).json({ message: 'Current password is required' });
    }
    
    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        message: 'New password does not meet requirements',
        errors: passwordValidation.errors 
      });
    }
    
    // Check passwords are different
    if (currentPassword === newPassword) {
      return res.status(400).json({ 
        message: 'New password must be different from current password' 
      });
    }
    
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid input data' });
  }
};

/**
 * Middleware: Validate profile update input
 */
export const validateProfileUpdate = (req, res, next) => {
  try {
    const { name } = req.body;
    
    // Validate name
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return res.status(400).json({ message: nameValidation.error });
    }
    
    // Sanitize name
    req.body.name = sanitizeString(name, 50);
    
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid input data' });
  }
};

/**
 * Prevent MongoDB injection by ensuring values are strings
 */
export const sanitizeMongoQuery = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        // If it's an object (potential injection), convert to string
        if (Object.keys(obj[key]).some(k => k.startsWith('$'))) {
          obj[key] = String(obj[key]);
        } else {
          sanitize(obj[key]);
        }
      }
    }
  };
  
  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  
  next();
};
