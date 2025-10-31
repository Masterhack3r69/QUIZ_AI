# Design Document

## Overview

This design document outlines the architecture and implementation approach for completing the AI-Powered Quiz Generator and Assessment System. The backend API infrastructure is already in place with models, routes, and AI integration. This design focuses on building the complete frontend application using Next.js 16 with the App Router, implementing all teacher and student interfaces, and ensuring seamless integration with the existing backend.

### Current State
- ✅ Backend API with Express and MongoDB
- ✅ Database models (User, Quiz, Submission)
- ✅ Authentication middleware with JWT
- ✅ File upload and content extraction (PDF, DOCX, TXT)
- ✅ Google Gemini AI integration for question generation
- ✅ Basic test interface for AI upload
- ❌ Complete teacher dashboard
- ❌ Student quiz interface
- ❌ Analytics and reporting
- ❌ Full authentication flow on frontend

### Design Goals
1. Build a complete, production-ready frontend application
2. Implement all user flows for teachers and students
3. Create reusable UI components with Tailwind CSS
4. Ensure responsive design across all devices
5. Implement proper error handling and loading states
6. Integrate with existing backend API endpoints

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Public Pages          │  Teacher Pages (Protected)  │  │
│  │  - Landing             │  - Dashboard                 │  │
│  │  - Login/Register      │  - Create Quiz               │  │
│  │  - Join Quiz           │  - Quiz Management           │  │
│  │  - Quiz Lobby          │  - Analytics                 │  │
│  │  - Take Quiz           │  - Settings                  │  │
│  │  - Results             │                              │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Shared Components                                    │  │
│  │  - Button, Input, Card, Modal, Toast                 │  │
│  │  - Timer, QuestionCard, LoadingSpinner               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  State Management & API Layer                        │  │
│  │  - Auth Context (JWT token, user state)             │  │
│  │  - API utilities (fetch wrappers)                   │  │
│  │  - Local storage for quiz session                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Express)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes                                              │  │
│  │  - /api/auth (register, login)                      │  │
│  │  - /api/quiz (CRUD, validate, start)                │  │
│  │  - /api/submission (submit, analytics)              │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Middleware                                          │  │
│  │  - Authentication (JWT verification)                │  │
│  │  - File upload (Multer)                             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services                                            │  │
│  │  - Content extraction (PDF, DOCX)                   │  │
│  │  - AI question generation (Google Gemini)           │  │
│  │  - Access code generation                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Database (MongoDB)                        │
│  - Users (teachers)                                         │
│  - Quizzes (questions, settings, access codes)              │
│  - Submissions (answers, scores, analytics)                 │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Application Structure

```
frontend/
├── app/
│   ├── (auth)/                    # Auth layout group
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── register/
│   │       └── page.tsx          # Registration page
│   ├── (public)/                  # Public layout group
│   │   ├── join/
│   │   │   └── page.tsx          # Join quiz page
│   │   └── quiz/
│   │       └── [code]/
│   │           ├── start/
│   │           │   └── page.tsx  # Quiz lobby
│   │           ├── take/
│   │           │   └── page.tsx  # Quiz interface
│   │           └── results/
│   │               └── page.tsx  # Results page
│   ├── dashboard/                 # Protected teacher routes
│   │   ├── layout.tsx            # Dashboard layout with nav
│   │   ├── page.tsx              # Dashboard home
│   │   ├── create/
│   │   │   └── page.tsx          # Create quiz wizard
│   │   ├── quiz/
│   │   │   └── [quizId]/
│   │   │       ├── page.tsx      # Quiz management
│   │   │       └── results/
│   │   │           └── page.tsx  # Analytics page
│   │   └── settings/
│   │       └── page.tsx          # Account settings
│   ├── api/                       # API routes (proxies)
│   │   └── [...]/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                        # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Toast.tsx
│   ├── quiz/                      # Quiz-specific components
│   │   ├── QuestionCard.tsx
│   │   ├── Timer.tsx
│   │   └── QuizCard.tsx
│   └── layout/                    # Layout components
│       ├── Navbar.tsx
│       └── DashboardNav.tsx
├── lib/
│   ├── api.ts                     # API client utilities
│   ├── auth.ts                    # Auth helpers
│   └── utils.ts                   # General utilities
├── contexts/
│   └── AuthContext.tsx            # Authentication context
└── types/
    └── index.ts                   # TypeScript types
```

## Components and Interfaces

### Core UI Components

#### Button Component
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

#### Input Component
```typescript
interface InputProps {
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'file';
  label?: string;
  error?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}
```

#### Card Component
```typescript
interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}
```

#### Modal Component
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

#### Toast Component
```typescript
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onClose: () => void;
}
```

### Quiz Components

#### Timer Component
```typescript
interface TimerProps {
  duration: number; // in seconds
  onExpire: () => void;
  isActive: boolean;
}

// Features:
// - Displays MM:SS format
// - Updates every second
// - Changes color when < 5 minutes remaining
// - Auto-triggers onExpire when time reaches 0
// - Persists state in sessionStorage
```

#### QuestionCard Component
```typescript
interface QuestionCardProps {
  question: string;
  options: string[];
  selectedAnswer?: number;
  onSelectAnswer: (index: number) => void;
  questionNumber: number;
  totalQuestions: number;
  showCorrectAnswer?: boolean;
  correctAnswer?: number;
}
```

#### QuizCard Component (Dashboard)
```typescript
interface QuizCardProps {
  quiz: {
    _id: string;
    title: string;
    accessCode: string;
    status: 'active' | 'expired';
    submissionCount: number;
    createdAt: string;
  };
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}
```

### Authentication Context

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
}
```

### API Client Structure

```typescript
// lib/api.ts
class APIClient {
  private baseURL: string;
  private getAuthHeader(): HeadersInit;
  
  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse>;
  async register(name: string, email: string, password: string): Promise<AuthResponse>;
  
  // Quiz endpoints (teacher)
  async createQuiz(formData: FormData): Promise<Quiz>;
  async getMyQuizzes(): Promise<Quiz[]>;
  async getQuiz(quizId: string): Promise<Quiz>;
  async updateQuiz(quizId: string, data: Partial<Quiz>): Promise<Quiz>;
  async deleteQuiz(quizId: string): Promise<void>;
  
  // Quiz endpoints (student)
  async validateQuizCode(accessCode: string): Promise<QuizInfo>;
  async startQuiz(accessCode: string): Promise<QuizSession>;
  
  // Submission endpoints
  async submitQuiz(data: SubmissionData): Promise<SubmissionResult>;
  async getQuizSubmissions(quizId: string): Promise<Submission[]>;
  async getQuizAnalytics(quizId: string): Promise<Analytics>;
}
```

## Data Models

### Frontend TypeScript Types

```typescript
// types/index.ts

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'teacher';
}

export interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  _id: string;
  title: string;
  teacher: string;
  accessCode: string;
  questions: Question[];
  questionsPerStudent: number;
  duration: number; // in minutes
  expiresAt: string;
  status: 'active' | 'expired' | 'draft';
  sourceContent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizInfo {
  _id: string;
  title: string;
  duration: number;
  questionsPerStudent: number;
  expiresAt: string;
  status: string;
}

export interface QuizSession {
  quizId: string;
  title: string;
  duration: number;
  questions: {
    _id: string;
    question: string;
    options: string[];
  }[];
}

export interface Answer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

export interface Submission {
  _id: string;
  quiz: string;
  studentName: string;
  studentId: string;
  answers: Answer[];
  score: number;
  totalQuestions: number;
  timeTaken?: number;
  submittedAt: string;
}

export interface Analytics {
  summary: {
    totalSubmissions: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  };
  submissions: Submission[];
  questionStats: {
    questionId: string;
    question: string;
    correctCount: number;
    totalAttempts: number;
    accuracyRate: number;
  }[];
}

export interface SubmissionData {
  quizId: string;
  studentName: string;
  studentId: string;
  answers: {
    questionId: string;
    selectedAnswer: number;
  }[];
  timeTaken: number;
}

export interface SubmissionResult {
  score: number;
  totalQuestions: number;
  answers: Answer[];
}
```

## Error Handling

### Error Handling Strategy

1. **API Error Handling**
   - Wrap all API calls in try-catch blocks
   - Display user-friendly error messages via Toast component
   - Log detailed errors to console for debugging
   - Handle specific HTTP status codes (401, 403, 404, 500)

2. **Form Validation**
   - Client-side validation before API calls
   - Display inline error messages for invalid fields
   - Prevent submission until all required fields are valid

3. **Network Errors**
   - Detect offline status
   - Display "No internet connection" message
   - Retry mechanism for failed requests

4. **Session Management**
   - Detect expired JWT tokens (401 responses)
   - Automatically redirect to login page
   - Clear local storage on logout

### Error Types and Messages

```typescript
const ERROR_MESSAGES = {
  // Auth errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'An account with this email already exists',
  SESSION_EXPIRED: 'Your session has expired. Please log in again',
  
  // Quiz errors
  QUIZ_NOT_FOUND: 'Quiz not found',
  INVALID_CODE: 'Invalid quiz code',
  QUIZ_EXPIRED: 'This quiz has expired',
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
```

## Testing Strategy

### Testing Approach

1. **Manual Testing**
   - Test all user flows end-to-end
   - Verify responsive design on different screen sizes
   - Test error scenarios and edge cases
   - Verify timer functionality and auto-submission
   - Test file upload with different file types

2. **Component Testing** (Optional)
   - Test individual UI components in isolation
   - Verify component props and state management
   - Test user interactions (clicks, form inputs)

3. **Integration Testing** (Optional)
   - Test API integration with backend
   - Verify authentication flow
   - Test quiz creation and submission workflows

### Test Scenarios

#### Teacher Flow
1. Register new account → verify email validation
2. Login → verify token storage and redirect
3. Create quiz with file upload → verify AI generation
4. View quiz list → verify quiz cards display correctly
5. Copy access code → verify clipboard functionality
6. View analytics → verify calculations are correct
7. Delete quiz → verify confirmation modal and deletion

#### Student Flow
1. Enter quiz code → verify validation
2. View quiz lobby → verify quiz info display
3. Start quiz → verify timer starts
4. Answer questions → verify answer selection
5. Submit quiz → verify auto-grading
6. View results → verify score display
7. Timer expiry → verify auto-submission

#### Edge Cases
1. Expired quiz access attempt
2. Invalid quiz code entry
3. Network disconnection during quiz
4. Browser refresh during active quiz
5. File upload exceeding size limit
6. Concurrent quiz submissions

## Implementation Phases

### Phase 1: Authentication & Layout (Requirements 1, 9)
- Create AuthContext with JWT management
- Build login and registration pages
- Implement protected route wrapper
- Create dashboard layout with navigation
- Build landing page

### Phase 2: Teacher Dashboard (Requirements 2, 3, 9)
- Build dashboard home with quiz list
- Implement quiz card component
- Create quiz management page
- Add copy-to-clipboard functionality
- Implement quiz edit and delete

### Phase 3: Quiz Creation (Requirement 2)
- Build multi-step quiz creation wizard
- Implement file upload with preview
- Add quiz configuration form
- Integrate with AI generation endpoint
- Display generated questions for review

### Phase 4: Student Quiz Access (Requirements 4, 5)
- Build join page with code validation
- Create quiz lobby page
- Implement quiz start endpoint integration
- Build question randomization display

### Phase 5: Quiz Taking Interface (Requirements 5, 6, 7)
- Build quiz interface with timer
- Implement question navigation
- Add answer selection functionality
- Create auto-submission on timer expiry
- Build manual submission flow
- Create results display page

### Phase 6: Analytics & Reporting (Requirement 8)
- Build analytics dashboard
- Implement submission table
- Create question statistics display
- Add export functionality (PDF/Excel)
- Display summary statistics

### Phase 7: Polish & Optimization (Requirements 10, 11, 12)
- Implement loading states
- Add error handling and toasts
- Ensure responsive design
- Add quiz status management
- Implement form validation
- Add accessibility features

## Technical Decisions

### State Management
- **React Context** for global auth state
- **Local component state** for UI interactions
- **sessionStorage** for quiz session persistence (prevents loss on refresh)
- **localStorage** for JWT token storage

### Styling Approach
- **Tailwind CSS v4** for utility-first styling
- **Custom components** with consistent design system
- **Responsive breakpoints**: mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
- **Color scheme**: Primary (blue), Success (green), Danger (red), Warning (yellow)

### API Communication
- **Fetch API** with custom wrapper for error handling
- **JWT token** in Authorization header for protected routes
- **FormData** for file uploads
- **JSON** for all other requests/responses

### Timer Implementation
- **setInterval** for countdown updates
- **sessionStorage** to persist timer state across refreshes
- **useEffect** cleanup to prevent memory leaks
- **Visibility API** to pause timer when tab is inactive (optional)

### File Upload
- **Client-side validation** for file type and size
- **FormData** for multipart/form-data requests
- **Progress indicator** during upload
- **Preview** of uploaded file name

### Routing Strategy
- **App Router** (Next.js 16)
- **Route groups** for layout organization: (auth), (public), dashboard
- **Dynamic routes** for quiz codes and IDs: [code], [quizId]
- **Middleware** for authentication checks (optional)

### Performance Optimizations
- **React 19 Compiler** enabled for automatic optimizations
- **Lazy loading** for heavy components
- **Debouncing** for search/filter inputs
- **Pagination** for large quiz lists and submissions
- **Image optimization** with Next.js Image component

## Security Considerations

1. **Authentication**
   - JWT tokens with expiration
   - Secure token storage (httpOnly cookies preferred, but localStorage acceptable for this project)
   - Protected routes with auth checks

2. **Input Validation**
   - Client-side validation for all forms
   - Server-side validation (already implemented in backend)
   - Sanitize user inputs

3. **File Upload**
   - File type validation
   - File size limits (10MB)
   - Virus scanning (optional, not in scope)

4. **Quiz Access**
   - Access code validation
   - Expiration date checks
   - No answer exposure in API responses

5. **CORS**
   - Configured in backend for frontend URL
   - Credentials included in requests

## Accessibility

1. **Semantic HTML**
   - Proper heading hierarchy
   - Form labels and ARIA attributes
   - Button and link semantics

2. **Keyboard Navigation**
   - Tab order for all interactive elements
   - Enter/Space for button activation
   - Escape to close modals

3. **Screen Reader Support**
   - ARIA labels for icons
   - Status announcements for dynamic content
   - Error message associations

4. **Visual Accessibility**
   - Sufficient color contrast (WCAG AA)
   - Focus indicators
   - Text alternatives for images

## Deployment Considerations

1. **Environment Variables**
   - `NEXT_PUBLIC_API_URL` for backend URL
   - Different values for development and production

2. **Build Process**
   - `pnpm build` for production build
   - Static optimization where possible
   - Error handling for build failures

3. **Backend Deployment**
   - MongoDB Atlas for database
   - Environment variables for secrets
   - CORS configuration for production domain

4. **Frontend Deployment**
   - Vercel or similar platform
   - Automatic deployments from Git
   - Environment variable configuration
