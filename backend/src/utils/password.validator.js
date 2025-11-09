/**
 * Password validation utility
 * Enforces strong password requirements
 */

const COMMON_PASSWORDS = [
  'password', 'password123', '12345678', 'qwerty', 'abc123',
  'monkey', '1234567890', 'letmein', 'trustno1', 'dragon',
  'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
  'bailey', 'passw0rd', 'shadow', '123123', '654321'
];

/**
 * Validate password strength and requirements
 * @param {string} password - Password to validate
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
export function validatePassword(password) {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    return {
      valid: false,
      errors: ['Password is required']
    };
  }
  
  // Minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Maximum length (prevent DoS)
  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }
  
  // Lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Special character
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common passwords
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a stronger password');
  }
  
  // Check for sequential characters
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    errors.push('Password should not contain sequential characters');
  }
  
  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeated characters');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get password strength score (0-4)
 * @param {string} password - Password to evaluate
 * @returns {{score: number, feedback: string}} Strength score and feedback
 */
export function getPasswordStrength(password) {
  let score = 0;
  
  if (!password) {
    return { score: 0, feedback: 'No password provided' };
  }
  
  // Length bonus
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  
  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/.test(password)) score++;
  
  // Penalize common patterns
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) score = Math.max(0, score - 2);
  if (/(.)\1{2,}/.test(password)) score = Math.max(0, score - 1);
  
  // Normalize to 0-4 scale
  score = Math.min(4, Math.max(0, Math.floor(score / 2)));
  
  const feedback = [
    'Very weak - unacceptable',
    'Weak - needs improvement',
    'Fair - acceptable',
    'Strong - good',
    'Very strong - excellent'
  ][score];
  
  return { score, feedback };
}
