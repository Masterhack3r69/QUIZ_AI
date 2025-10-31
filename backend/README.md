# Quiz AI Backend

Backend API for the AI-Powered Quiz Generator and Assessment System.

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create `.env` file:

```bash
copy .env.example .env
```

3. Configure environment variables in `.env`:

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens (use a strong random string)
- `GEMINI_API_KEY`: Your Google Gemini API key (get it from https://aistudio.google.com/app/apikey)
- `PORT`: Server port (default: 5000)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:3000)
- `NODE_ENV`: Environment (development/production)

4. Create uploads directory:

```bash
mkdir uploads
```

5. Start development server:

```bash
pnpm dev
```

## API Endpoints

### Health Check

- `GET /api/health` - Server health check

### Authentication

- `POST /api/auth/register` - Register new teacher

  - Body: `{ name, email, password }`
  - Returns: `{ token, user }`

- `POST /api/auth/login` - Teacher login

  - Body: `{ email, password }`
  - Returns: `{ token, user }`

- `PUT /api/auth/profile` - Update teacher profile (Protected)

  - Body: `{ name }`
  - Returns: `{ user }`

- `PUT /api/auth/password` - Change password (Protected)
  - Body: `{ currentPassword, newPassword }`
  - Returns: `{ message }`

### Quiz Management (Protected)

- `POST /api/quiz/create` - Create new quiz with file upload

  - Body: FormData with `file`, `title`, `duration`, `expiresAt`, `questionsPerStudent`, `textContent`
  - Returns: Created quiz object with access code

- `GET /api/quiz/my-quizzes` - Get all quizzes for logged-in teacher

  - Returns: Array of quizzes with submission counts

- `GET /api/quiz/:quizId` - Get quiz details by ID

  - Returns: Full quiz object including questions

- `PUT /api/quiz/:quizId` - Update quiz settings

  - Body: Fields to update (title, duration, expiresAt, etc.)
  - Returns: Updated quiz object

- `DELETE /api/quiz/:quizId` - Delete quiz
  - Returns: `{ message }`

### Student Access (Public)

- `POST /api/quiz/validate` - Validate quiz access code

  - Body: `{ accessCode }`
  - Returns: Quiz metadata (title, duration, questionsPerStudent, expiresAt, status)

- `POST /api/quiz/start` - Get randomized questions for quiz
  - Body: `{ accessCode }`
  - Returns: Quiz with randomized questions (without correct answers)

### Submissions

- `POST /api/submission/submit` - Submit quiz answers (Public)

  - Body: `{ quizId, studentName, studentId, answers, timeTaken }`
  - Returns: `{ score, totalQuestions, submissionId, answers }`

- `GET /api/submission/quiz/:quizId` - Get all submissions for quiz (Protected)

  - Returns: Array of submissions

- `GET /api/submission/analytics/:quizId` - Get quiz analytics (Protected)
  - Returns: Analytics object with averages, question stats, and individual submissions

## AI Integration

The backend uses **Google Gemini AI** to automatically generate quiz questions from uploaded content.

Setup:

1. Get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add `GEMINI_API_KEY` to your `.env` file
3. The system will automatically generate 20 multiple-choice questions from any uploaded content

If the API key is not set, the system falls back to mock questions for testing.

## File Upload Support

Supported file types:

- PDF (.pdf)
- Word (.docx, .doc)
- PowerPoint (.ppt, .pptx)
- Text (.txt)

Max file size: 10MB

Content extraction libraries:

- `pdf-parse` for PDF files
- `mammoth` for Word documents

## Database Models

### User (Teacher)

- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed with bcrypt)
- `role`: String (default: 'teacher')

### Quiz

- `title`: String (required)
- `teacher`: ObjectId (ref: User)
- `accessCode`: String (unique, auto-generated)
- `questions`: Array of question objects
  - `question`: String
  - `options`: Array of strings
  - `correctAnswer`: String
- `questionsPerStudent`: Number (default: 10)
- `duration`: Number (minutes)
- `expiresAt`: Date
- `status`: String (active/expired)
- `sourceContent`: String (original content)

### Submission

- `quiz`: ObjectId (ref: Quiz)
- `studentName`: String (required)
- `studentId`: String (required)
- `answers`: Array of answer objects
  - `questionId`: ObjectId
  - `selectedAnswer`: String
  - `isCorrect`: Boolean
- `score`: Number
- `totalQuestions`: Number
- `timeTaken`: Number (seconds)
- `submittedAt`: Date (auto-generated)

## Features

- JWT-based authentication for teachers
- Automatic quiz expiration handling
- Question randomization for each student
- Automatic grading with detailed analytics
- Question-level statistics (accuracy rates)
- File upload and content extraction
- AI-powered question generation

## Development

Run with auto-reload:

```bash
pnpm dev
```

Production:

```bash
pnpm start
```

## Testing

Test AI question generation without authentication:

```bash
node test-ai.js
```

Or use the test endpoint:

```bash
POST /api/quiz/test-create
```
