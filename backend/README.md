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
- `JWT_SECRET`: Secret key for JWT tokens
- `GEMINI_API_KEY`: Your Google Gemini API key (get it from https://aistudio.google.com/app/apikey)
- `PORT`: Server port (default: 5000)
- `FRONTEND_URL`: Frontend URL for CORS

4. Create uploads directory:

```bash
mkdir uploads
```

5. Start development server:

```bash
pnpm dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new teacher
- `POST /api/auth/login` - Teacher login

### Quiz Management (Protected)

- `POST /api/quiz/create` - Create new quiz with file upload
- `GET /api/quiz/my-quizzes` - Get all quizzes for logged-in teacher
- `GET /api/quiz/:quizId` - Get quiz details
- `PUT /api/quiz/:quizId` - Update quiz
- `DELETE /api/quiz/:quizId` - Delete quiz

### Student Access (Public)

- `POST /api/quiz/validate` - Validate quiz access code
- `POST /api/quiz/start` - Get randomized questions for quiz

### Submissions

- `POST /api/submission/submit` - Submit quiz answers (student)
- `GET /api/submission/quiz/:quizId` - Get all submissions for quiz (teacher)
- `GET /api/submission/analytics/:quizId` - Get quiz analytics (teacher)

## AI Integration

The backend uses **Google Gemini AI** (gemini-2.0-flash-exp) to automatically generate quiz questions from uploaded content.

Setup:

1. Get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add `GEMINI_API_KEY` to your `.env` file
3. The system will automatically generate 20 questions from any uploaded content

If the API key is not set, the system falls back to mock questions for testing.

## File Upload Support

Supported file types:

- PDF (.pdf)
- Word (.docx, .doc)
- PowerPoint (.ppt, .pptx)
- Text (.txt)

Max file size: 10MB

## Database Models

### User (Teacher)

- name, email, password, role

### Quiz

- title, teacher, accessCode, questions, duration, expiresAt, status

### Submission

- quiz, studentName, studentId, answers, score, timeTaken

## Development

Run with auto-reload:

```bash
pnpm dev
```

Production:

```bash
pnpm start
```
