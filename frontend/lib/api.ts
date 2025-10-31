// lib/api.ts - API client utility with authentication and error handling

import { getAuthToken } from './auth';
import type {
  AuthResponse,
  Quiz,
  QuizInfo,
  QuizSession,
  Submission,
  SubmissionData,
  SubmissionResult,
  Analytics,
  APIError,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

/**
 * Custom error class for API errors
 */
export class APIRequestError extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'APIRequestError';
    this.status = status;
  }
}

/**
 * Get authentication headers
 */
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Get user-friendly error message based on status code
 */
function getErrorMessage(status: number, defaultMessage: string): string {
  switch (status) {
    case 400:
      return defaultMessage || 'Invalid request. Please check your input.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return defaultMessage || 'A conflict occurred. The resource may already exist.';
    case 422:
      return defaultMessage || 'Validation failed. Please check your input.';
    case 500:
      return 'A server error occurred. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'The server is temporarily unavailable. Please try again later.';
    default:
      return defaultMessage || 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Wrapper for fetch with network error handling
 */
async function fetchWithErrorHandling(
  url: string,
  options?: RequestInit
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    // Network errors (no internet, CORS, DNS failure, etc.)
    if (error instanceof TypeError) {
      throw new APIRequestError(
        'Network error. Please check your internet connection and try again.',
        0
      );
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Handle API response and errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    
    // Get user-friendly error message
    const friendlyMessage = getErrorMessage(response.status, errorMessage);
    
    // Handle session expiration (401 Unauthorized)
    if (response.status === 401) {
      // Trigger session expiration event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('session-expired'));
      }
    }
    
    throw new APIRequestError(friendlyMessage, response.status);
  }
  
  return response.json();
}

/**
 * API Client class
 */
class APIClient {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  
  // ==================== Auth Endpoints ====================
  
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetchWithErrorHandling(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      return handleResponse<AuthResponse>(response);
    } catch (error) {
      if (error instanceof APIRequestError) {
        throw error;
      }
      throw new APIRequestError('Login failed. Please try again.', 500);
    }
  }
  
  /**
   * Register a new teacher account
   */
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetchWithErrorHandling(`${this.baseURL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      return handleResponse<AuthResponse>(response);
    } catch (error) {
      if (error instanceof APIRequestError) {
        throw error;
      }
      throw new APIRequestError('Registration failed. Please try again.', 500);
    }
  }
  
  // ==================== Quiz Endpoints (Teacher) ====================
  
  /**
   * Create a new quiz with file upload
   */
  async createQuiz(formData: FormData): Promise<Quiz> {
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetchWithErrorHandling(`${this.baseURL}/api/quiz/create`, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      return handleResponse<Quiz>(response);
    } catch (error) {
      if (error instanceof APIRequestError) {
        throw error;
      }
      throw new APIRequestError('Failed to create quiz. Please try again.', 500);
    }
  }
  
  /**
   * Get all quizzes for the authenticated teacher
   */
  async getMyQuizzes(): Promise<Quiz[]> {
    try {
      const response = await fetchWithErrorHandling(`${this.baseURL}/api/quiz/my-quizzes`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      return handleResponse<Quiz[]>(response);
    } catch (error) {
      if (error instanceof APIRequestError) {
        throw error;
      }
      throw new APIRequestError('Failed to load quizzes. Please try again.', 500);
    }
  }
  
  /**
   * Get a specific quiz by ID
   */
  async getQuiz(quizId: string): Promise<Quiz> {
    try {
      const response = await fetchWithErrorHandling(`${this.baseURL}/api/quiz/${quizId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      return handleResponse<Quiz>(response);
    } catch (error) {
      if (error instanceof APIRequestError) {
        throw error;
      }
      throw new APIRequestError('Failed to load quiz. Please try again.', 500);
    }
  }
  
  /**
   * Update quiz settings
   */
  async updateQuiz(quizId: string, data: Partial<Quiz>): Promise<Quiz> {
    try {
      const response = await fetchWithErrorHandling(`${this.baseURL}/api/quiz/${quizId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      return handleResponse<Quiz>(response);
    } catch (error) {
      if (error instanceof APIRequestError) {
        throw error;
      }
      throw new APIRequestError('Failed to update quiz. Please try again.', 500);
    }
  }
  
  /**
   * Delete a quiz
   */
  async deleteQuiz(quizId: string): Promise<void> {
    try {
      const response = await fetchWithErrorHandling(`${this.baseURL}/api/quiz/${quizId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = getErrorMessage(
          response.status,
          errorData.message || 'Failed to delete quiz'
        );
        throw new APIRequestError(errorMessage, response.status);
      }
    } catch (error) {
      if (error instanceof APIRequestError) {
        throw error;
      }
      throw new APIRequestError('Failed to delete quiz. Please try again.', 500);
    }
  }
  
  // ==================== Quiz Endpoints (Student) ====================
  
  /**
   * Validate quiz access code and get quiz info
   */
  async validateQuizCode(accessCode: string): Promise<QuizInfo> {
    try {
      const response = await fetchWithErrorHandling(`${this.baseURL}/api/quiz/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode }),
      });
      
      return handleResponse<QuizInfo>(response);
    } catch (error) {
      if (error instanceof APIRequestError) {
        throw error;
      }
      throw new APIRequestError('Failed to validate quiz code. Please try again.', 500);
    }
  }
  
  /**
   * Start a quiz and get randomized questions
   */
  async startQuiz(accessCode: string): Promise<QuizSession> {
    try {
      const response = await fetchWithErrorHandling(`${this.baseURL}/api/quiz/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode }),
      });
      
      return handleResponse<QuizSession>(response);
    } catch (error) {
      if (error instanceof APIRequestError) {
        throw error;
      }
      throw new APIRequestError('Failed to start quiz. Please try again.', 500);
    }
  }
  
  // ==================== Submission Endpoints ====================
  
  /**
   * Submit quiz answers
   */
  async submitQuiz(data: SubmissionData): Promise<SubmissionResult> {
    try {
      const response = await fetchWithErrorHandling(`${this.baseURL}/api/submission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      return handleResponse<SubmissionResult>(response);
    } catch (error) {
      if (error instanceof APIRequestError) {
        throw error;
      }
      throw new APIRequestError('Failed to submit quiz. Please try again.', 500);
    }
  }
  
  /**
   * Get all submissions for a specific quiz
   */
  async getQuizSubmissions(quizId: string): Promise<Submission[]> {
    try {
      const response = await fetchWithErrorHandling(`${this.baseURL}/api/submission/quiz/${quizId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      return handleResponse<Submission[]>(response);
    } catch (error) {
      if (error instanceof APIRequestError) {
        throw error;
      }
      throw new APIRequestError('Failed to load submissions. Please try again.', 500);
    }
  }
  
  /**
   * Get analytics for a specific quiz
   */
  async getQuizAnalytics(quizId: string): Promise<Analytics> {
    try {
      const response = await fetchWithErrorHandling(`${this.baseURL}/api/submission/analytics/${quizId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      return handleResponse<Analytics>(response);
    } catch (error) {
      if (error instanceof APIRequestError) {
        throw error;
      }
      throw new APIRequestError('Failed to load analytics. Please try again.', 500);
    }
  }
}

// Export singleton instance
export const apiClient = new APIClient(API_BASE_URL);
