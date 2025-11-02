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
- ❌ Multiple content source support (topic, video, URL)
- ❌ Quiz template system
- ❌ Multiple question types (True/False, Fill-in-the-Blank, Matching)
- ❌ Question distribution configuration
- ❌ Question editing interface
- ❌ Advanced quiz settings (start date, max students, subjects)
- ❌ Complete teacher dashboard
- ❌ Student quiz interface
- ❌ Analytics and reporting
- ❌ Full authentication flow on frontend

### Design Goals
1. Build a complete, production-ready frontend application
2. Implement all user flows for teachers and students
3. Support multiple content sources and question types
4. Create a flexible template system for quiz configuration
5. Enable comprehensive question editing capabilities
6. Create reusable UI components with Tailwind CSS
7. Ensure responsive design across all devices
8. Implement proper error handling and loading states
9. Integrate with existing backend API endpoints

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
│   │   ├── templates/
│   │   │   ├── page.tsx          # Template management
│   │   │   └── [templateId]/
│   │   │       └── page.tsx      # Edit template
│   │   ├── quiz/
│   │   │   └── [quizId]/
│   │   │       ├── page.tsx      # Quiz management
│   │   │       ├── edit/
│   │   │       │   └── page.tsx  # Edit quiz & questions
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
│   │   ├── Select.tsx
│   │   ├── Tabs.tsx
│   │   └── Toast.tsx
│   ├── quiz/                      # Quiz-specific components
│   │   ├── QuestionCard.tsx
│   │   ├── QuestionEditor.tsx
│   │   ├── Timer.tsx
│   │   ├── QuizCard.tsx
│   │   ├── ContentSourceSelector.tsx
│   │   ├── QuestionDistribution.tsx
│   │   └── TemplateSelector.tsx
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
  question: Question;
  selectedAnswer?: any;
  onSelectAnswer: (answer: any) => void;
  questionNumber: number;
  totalQuestions: number;
  showCorrectAnswer?: boolean;
  isReview?: boolean;
}

// Supports all question types:
// - Multiple Choice: displays options as radio buttons
// - True/False: displays two buttons
// - Fill-in-the-Blank: displays text input
// - Matching: displays two columns with drag-and-drop or select
```

#### QuestionEditor Component
```typescript
interface QuestionEditorProps {
  question: Question;
  onSave: (question: Question) => void;
  onCancel: () => void;
  onDelete: () => void;
}

// Features:
// - Edit question text
// - Edit answer options based on question type
// - Mark correct answer(s)
// - Validate before saving
// - Preview question as students will see it
```

#### ContentSourceSelector Component
```typescript
interface ContentSourceSelectorProps {
  onSourceSelect: (source: ContentSource) => void;
  selectedSource?: 'file' | 'topic' | 'video' | 'url';
}

interface ContentSource {
  type: 'file' | 'topic' | 'video' | 'url';
  content: File | string;
}

// Features:
// - Tab interface for source selection
// - File upload with drag-and-drop
// - Text area for topic input
// - URL input with validation
// - Preview of selected content
```

#### QuestionDistribution Component
```typescript
interface QuestionDistributionProps {
  totalQuestions: number;
  distribution: QuestionDistribution;
  onChange: (distribution: QuestionDistribution) => void;
}

interface QuestionDistribution {
  multipleChoice: number;
  trueFalse: number;
  fillInBlank: number;
  matching: number;
}

// Features:
// - Slider or input for each question type
// - Real-time validation (sum = 100% or total count)
// - Visual representation (pie chart or bars)
// - Preset distributions (All MC, Mixed, etc.)
```

#### TemplateSelector Component
```typescript
interface TemplateSelectorProps {
  templates: QuizTemplate[];
  onSelect: (template: QuizTemplate) => void;
  onCreateNew: () => void;
}

interface QuizTemplate {
  _id: string;
  name: string;
  type: 'short' | 'long' | 'exam' | 'custom';
  questionCount: number;
  duration: number;
  distribution: QuestionDistribution;
  expirationPeriod: number; // in days
}

// Features:
// - Grid of template cards
// - Predefined templates (Short, Long, Exam)
// - Custom user templates
// - Template preview on hover
// - Quick actions (edit, delete, duplicate)
```

#### QuizCard Component (Dashboard)
```typescript
interface QuizCardProps {
  quiz: {
    _id: string;
    title: string;
    accessCode: string;
    status: 'scheduled' | 'active' | 'full' | 'expired';
    submissionCount: number;
    maxStudents?: number;
    subjects: string[];
    startDate?: string;
    expiresAt: string;
    createdAt: string;
  };
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// Features:
// - Status badge with color coding
// - Progress bar for submission count vs max students
// - Subject tags
// - Start/expiration date display
// - Quick actions menu
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
  async createQuiz(data: CreateQuizData): Promise<Quiz>;
  async getMyQuizzes(filters?: QuizFilters): Promise<Quiz[]>;
  async getQuiz(quizId: string): Promise<Quiz>;
  async updateQuiz(quizId: string, data: Partial<Quiz>): Promise<Quiz>;
  async updateQuizQuestions(quizId: string, questions: Question[]): Promise<Quiz>;
  async deleteQuiz(quizId: string): Promise<void>;
  
  // Template endpoints
  async createTemplate(data: Omit<QuizTemplate, '_id' | 'teacher' | 'createdAt' | 'updatedAt'>): Promise<QuizTemplate>;
  async getMyTemplates(): Promise<QuizTemplate[]>;
  async getTemplate(templateId: string): Promise<QuizTemplate>;
  async updateTemplate(templateId: string, data: Partial<QuizTemplate>): Promise<QuizTemplate>;
  async deleteTemplate(templateId: string): Promise<void>;
  
  // Content processing endpoints
  async uploadFile(file: File): Promise<{ content: string }>;
  async processURL(url: string): Promise<{ content: string }>;
  async processVideo(url: string): Promise<{ content: string }>;
  async generateQuestions(content: string, distribution: QuizDistribution, count: number): Promise<Question[]>;
  
  // Quiz endpoints (student)
  async validateQuizCode(accessCode: string): Promise<QuizInfo>;
  async startQuiz(accessCode: string, studentInfo: { name: string; id: string }): Promise<QuizSession>;
  
  // Submission endpoints
  async submitQuiz(data: SubmissionData): Promise<SubmissionResult>;
  async getQuizSubmissions(quizId: string): Promise<Submission[]>;
  async getQuizAnalytics(quizId: string): Promise<Analytics>;
}

interface CreateQuizData {
  title: string;
  sourceType: 'file' | 'topic' | 'video' | 'url';
  sourceContent: string | File;
  templateId?: string;
  questionCount: number;
  questionDistribution: QuizDistribution;
  duration: number;
  startDate?: string;
  expiresAt: string;
  maxStudents?: number;
  subjects: string[];
}

interface QuizFilters {
  status?: 'scheduled' | 'active' | 'full' | 'expired';
  subject?: string;
  startDate?: string;
  endDate?: string;
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

export type QuestionType = 'multipleChoice' | 'trueFalse' | 'fillInBlank' | 'matching';

export interface BaseQuestion {
  _id: string;
  type: QuestionType;
  question: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multipleChoice';
  options: string[];
  correctAnswer: number;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'trueFalse';
  correctAnswer: boolean;
}

export interface FillInBlankQuestion extends BaseQuestion {
  type: 'fillInBlank';
  correctAnswer: string;
  caseSensitive?: boolean;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  leftColumn: string[];
  rightColumn: string[];
  correctPairs: { left: number; right: number }[];
}

export type Question = 
  | MultipleChoiceQuestion 
  | TrueFalseQuestion 
  | FillInBlankQuestion 
  | MatchingQuestion;

export interface QuizDistribution {
  multipleChoice: number;
  trueFalse: number;
  fillInBlank: number;
  matching: number;
}

export interface Quiz {
  _id: string;
  title: string;
  teacher: string;
  accessCode: string;
  questions: Question[];
  questionsPerStudent: number;
  questionDistribution: QuizDistribution;
  duration: number; // in minutes
  startDate?: string;
  expiresAt: string;
  maxStudents?: number;
  subjects: string[];
  status: 'scheduled' | 'active' | 'full' | 'expired' | 'draft';
  sourceContent?: {
    type: 'file' | 'topic' | 'video' | 'url';
    content: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface QuizTemplate {
  _id: string;
  teacher: string;
  name: string;
  type: 'short' | 'long' | 'exam' | 'custom';
  questionCount: number;
  duration: number;
  questionDistribution: QuizDistribution;
  expirationPeriod: number; // in days
  subjects?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizInfo {
  _id: string;
  title: string;
  duration: number;
  questionsPerStudent: number;
  startDate?: string;
  expiresAt: string;
  maxStudents?: number;
  currentSubmissions: number;
  status: 'scheduled' | 'active' | 'full' | 'expired';
}

export interface QuizSession {
  quizId: string;
  title: string;
  duration: number;
  questions: Omit<Question, 'correctAnswer' | 'correctPairs'>[];
}

export interface Answer {
  questionId: string;
  questionType: QuestionType;
  selectedAnswer: number | boolean | string | { left: number; right: number }[];
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
    questionType: QuestionType;
    selectedAnswer: number | boolean | string | { left: number; right: number }[];
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

### Phase 1: Authentication & Layout (Requirements 1, 14)
- Create AuthContext with JWT management
- Build login and registration pages
- Implement protected route wrapper
- Create dashboard layout with navigation
- Build landing page

### Phase 2: Backend Extensions (Requirements 2, 3, 4, 5, 6)
- Extend Quiz model for new fields (startDate, maxStudents, subjects, questionDistribution)
- Create QuizTemplate model
- Update question schema to support multiple types
- Implement content processing for video and URL sources
- Update AI generation to support question type distribution
- Add template CRUD endpoints
- Update quiz validation logic for new status types

### Phase 3: Template System (Requirement 3)
- Build template management page
- Create template selector component
- Implement predefined templates (Short, Long, Exam)
- Add custom template creation/editing
- Build template card component

### Phase 4: Enhanced Quiz Creation (Requirements 2, 4, 5, 6)
- Build content source selector component
- Implement multi-source content upload (file, topic, video, URL)
- Create question distribution configurator
- Build question type editor for each type
- Implement question editing interface
- Add advanced settings form (start date, max students, subjects)
- Integrate template selection into wizard

### Phase 5: Teacher Dashboard (Requirements 7, 8, 14)
- Build dashboard home with enhanced quiz cards
- Implement filtering and sorting (status, subject, date)
- Add status badges (scheduled, active, full, expired)
- Create quiz management page with new fields
- Add copy-to-clipboard functionality
- Implement quiz edit and delete

### Phase 6: Student Quiz Access (Requirements 9, 10, 17)
- Build join page with enhanced validation
- Implement start date checking
- Add max students validation
- Create quiz lobby page with updated info
- Implement quiz start endpoint integration
- Build question randomization for all types

### Phase 7: Multi-Type Quiz Interface (Requirements 10, 11, 12)
- Build quiz interface with timer
- Implement question card for all types:
  - Multiple Choice (radio buttons)
  - True/False (two buttons)
  - Fill-in-the-Blank (text input)
  - Matching (drag-and-drop or select)
- Add answer selection functionality for each type
- Create auto-submission on timer expiry
- Build manual submission flow
- Create results display page

### Phase 8: Analytics & Reporting (Requirement 13)
- Build analytics dashboard
- Implement submission table with new fields
- Create question statistics by type
- Add export functionality (PDF/Excel)
- Display summary statistics

### Phase 9: Polish & Optimization (Requirements 15, 16, 17)
- Implement loading states
- Add error handling and toasts
- Ensure responsive design
- Add quiz status management (scheduled, active, full, expired)
- Implement form validation
- Add accessibility features
- Performance optimization

## Question Type Implementation Details

### Multiple Choice Questions
- Display question text with 4 options
- Render as radio buttons for single selection
- Randomize option order for each student
- Store selected index (0-3)
- Validate by comparing selected index with correctAnswer

### True or False Questions
- Display question statement
- Render as two prominent buttons (True/False)
- No randomization needed
- Store boolean value
- Validate by comparing with correctAnswer boolean

### Fill-in-the-Blank Questions
- Display question text with blank indicator
- Render as text input field
- Optional case-sensitive matching
- Store string value
- Validate by comparing trimmed, normalized string
- Support multiple acceptable answers (comma-separated)

### Matching Questions
- Display two columns of items
- Implementation options:
  1. Drag-and-drop interface (preferred for desktop)
  2. Dropdown selection for each left item (better for mobile)
- Store array of pairs: `[{left: 0, right: 2}, {left: 1, right: 0}, ...]`
- Validate by checking if all pairs match correctPairs
- Randomize right column order for each student

### Question Type Distribution Logic
- Teacher specifies count or percentage for each type
- AI generates questions according to distribution
- If AI cannot generate enough of a type, adjust distribution proportionally
- Minimum 1 question per type if percentage > 0
- Total must equal specified question count

### Grading Algorithm
```typescript
function gradeAnswer(question: Question, answer: any): boolean {
  switch (question.type) {
    case 'multipleChoice':
      return answer === question.correctAnswer;
    
    case 'trueFalse':
      return answer === question.correctAnswer;
    
    case 'fillInBlank':
      const normalized = answer.trim().toLowerCase();
      const correct = question.correctAnswer.toLowerCase();
      return question.caseSensitive 
        ? answer.trim() === question.correctAnswer
        : normalized === correct;
    
    case 'matching':
      return answer.every((pair: any) => 
        question.correctPairs.some(cp => 
          cp.left === pair.left && cp.right === pair.right
        )
      ) && answer.length === question.correctPairs.length;
  }
}
```

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
