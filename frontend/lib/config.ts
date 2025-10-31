// lib/config.ts - Environment variables configuration

/**
 * Application configuration
 */
export const config = {
  /**
   * Backend API URL
   */
  apiUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
  
  /**
   * Maximum file upload size (in bytes)
   */
  maxFileSize: 10 * 1024 * 1024, // 10MB
  
  /**
   * Allowed file types for quiz content upload
   */
  allowedFileTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
  ],
  
  /**
   * Allowed file extensions
   */
  allowedFileExtensions: ['.pdf', '.docx', '.doc', '.ppt', '.pptx', '.txt'],
  
  /**
   * Timer warning threshold (in seconds)
   */
  timerWarningThreshold: 5 * 60, // 5 minutes
  
  /**
   * Toast notification duration (in milliseconds)
   */
  toastDuration: 3000,
  
  /**
   * Pagination settings
   */
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  // Auth errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'An account with this email already exists',
  SESSION_EXPIRED: 'Your session has expired. Please log in again',
  UNAUTHORIZED: 'You must be logged in to access this page',
  
  // Quiz errors
  QUIZ_NOT_FOUND: 'Quiz not found',
  INVALID_CODE: 'Invalid quiz code',
  QUIZ_EXPIRED: 'This quiz has expired',
  QUIZ_NOT_STARTED: 'This quiz has not started yet',
  QUIZ_ALREADY_TAKEN: 'You have already taken this quiz',
  
  // File upload errors
  FILE_TOO_LARGE: 'File size exceeds 10MB limit',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload PDF, DOCX, PPT, or TXT',
  UPLOAD_FAILED: 'File upload failed. Please try again',
  
  // Submission errors
  SUBMISSION_FAILED: 'Failed to submit quiz. Please try again',
  INCOMPLETE_ANSWERS: 'Please answer all questions before submitting',
  
  // Network errors
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  UNKNOWN_ERROR: 'An unexpected error occurred',
  
  // Validation errors
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must be at least 6 characters',
  INVALID_DATE: 'Please select a valid date',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in',
  REGISTER_SUCCESS: 'Account created successfully',
  QUIZ_CREATED: 'Quiz created successfully',
  QUIZ_UPDATED: 'Quiz updated successfully',
  QUIZ_DELETED: 'Quiz deleted successfully',
  SUBMISSION_SUCCESS: 'Quiz submitted successfully',
  COPIED_TO_CLIPBOARD: 'Copied to clipboard',
  SETTINGS_SAVED: 'Settings saved successfully',
} as const;
