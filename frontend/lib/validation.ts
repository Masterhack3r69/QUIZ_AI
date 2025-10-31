// lib/validation.ts - Centralized validation utilities

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
}

/**
 * Password validation
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }
  
  return { isValid: true };
}

/**
 * Password confirmation validation
 */
export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true };
}

/**
 * Required field validation
 */
export function validateRequired(value: string, fieldName: string = 'This field'): ValidationResult {
  if (!value || !value.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  return { isValid: true };
}

/**
 * Name validation
 */
export function validateName(name: string): ValidationResult {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (name.trim().length > 100) {
    return { isValid: false, error: 'Name must not exceed 100 characters' };
  }
  
  return { isValid: true };
}

/**
 * Quiz title validation
 */
export function validateQuizTitle(title: string): ValidationResult {
  if (!title || !title.trim()) {
    return { isValid: false, error: 'Quiz title is required' };
  }
  
  if (title.trim().length < 3) {
    return { isValid: false, error: 'Quiz title must be at least 3 characters' };
  }
  
  if (title.trim().length > 100) {
    return { isValid: false, error: 'Quiz title must not exceed 100 characters' };
  }
  
  return { isValid: true };
}

/**
 * Duration validation (in minutes)
 */
export function validateDuration(duration: number | string): ValidationResult {
  const durationNum = typeof duration === 'string' ? parseInt(duration) : duration;
  
  if (isNaN(durationNum)) {
    return { isValid: false, error: 'Duration must be a number' };
  }
  
  if (durationNum < 1) {
    return { isValid: false, error: 'Duration must be at least 1 minute' };
  }
  
  if (durationNum > 300) {
    return { isValid: false, error: 'Duration must not exceed 300 minutes (5 hours)' };
  }
  
  return { isValid: true };
}

/**
 * Expiration date validation
 */
export function validateExpirationDate(expiresAt: string): ValidationResult {
  if (!expiresAt) {
    return { isValid: false, error: 'Expiration date and time is required' };
  }
  
  const expirationDate = new Date(expiresAt);
  const now = new Date();
  
  if (isNaN(expirationDate.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }
  
  if (expirationDate <= now) {
    return { isValid: false, error: 'Expiration date must be in the future' };
  }
  
  return { isValid: true };
}

/**
 * Questions per student validation
 */
export function validateQuestionsPerStudent(
  questionsPerStudent: number | string,
  totalQuestions: number
): ValidationResult {
  const questionsNum = typeof questionsPerStudent === 'string' 
    ? parseInt(questionsPerStudent) 
    : questionsPerStudent;
  
  if (isNaN(questionsNum)) {
    return { isValid: false, error: 'Number of questions must be a number' };
  }
  
  if (questionsNum < 1) {
    return { isValid: false, error: 'Must have at least 1 question' };
  }
  
  if (questionsNum > totalQuestions) {
    return { isValid: false, error: `Cannot exceed ${totalQuestions} (total generated questions)` };
  }
  
  return { isValid: true };
}

/**
 * Access code validation
 */
export function validateAccessCode(code: string): ValidationResult {
  if (!code || !code.trim()) {
    return { isValid: false, error: 'Quiz access code is required' };
  }
  
  if (code.length !== 6) {
    return { isValid: false, error: 'Access code must be 6 characters' };
  }
  
  return { isValid: true };
}

/**
 * Student ID validation
 */
export function validateStudentId(studentId: string): ValidationResult {
  if (!studentId || !studentId.trim()) {
    return { isValid: false, error: 'Student ID is required' };
  }
  
  return { isValid: true };
}
