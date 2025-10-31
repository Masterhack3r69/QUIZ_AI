/**
 * Common error messages used throughout the application
 */
export const ERROR_MESSAGES = {
  // Auth errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'An account with this email already exists',
  SESSION_EXPIRED: 'Your session has expired. Please log in again',
  
  // Quiz errors
  QUIZ_NOT_FOUND: 'Quiz not found',
  INVALID_CODE: 'Invalid quiz code',
  QUIZ_EXPIRED: 'This quiz has expired and is no longer available',
  QUIZ_NOT_STARTED: 'This quiz has not started yet',
  
  // File upload errors
  FILE_TOO_LARGE: 'File size exceeds 10MB limit',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload PDF, DOCX, PPT, or TXT',
  
  // Submission errors
  SUBMISSION_FAILED: 'Failed to submit quiz. Please try again',
  
  // Network errors
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
};