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

**Email Service Configuration (Required for OTP Verification):**

- `EMAIL_HOST`: SMTP server hostname (e.g., smtp.gmail.com)
- `EMAIL_PORT`: SMTP server port (587 for TLS, 465 for SSL)
- `EMAIL_SECURE`: Use SSL (false for TLS on port 587, true for SSL on port 465)
- `EMAIL_USER`: Your email address for sending OTP emails
- `EMAIL_PASSWORD`: Your email password or app-specific password
- `EMAIL_FROM`: Display name and email for outgoing emails (e.g., "Quiz AI <noreply@quizai.com>")

**OTP Configuration:**

- `OTP_EXPIRY_MINUTES`: OTP code expiration time in minutes (default: 10)
- `OTP_MAX_ATTEMPTS`: Maximum failed verification attempts before lockout (default: 5)
- `OTP_LOCKOUT_MINUTES`: Account lockout duration after max attempts (default: 15)
- `OTP_RESEND_COOLDOWN_SECONDS`: Cooldown period between OTP resend requests (default: 60)

4. Create uploads directory:

```bash
mkdir uploads
```

5. Start development server:

```bash
pnpm dev
```

## Email Service Setup

The OTP verification system requires an email service to send verification codes to users. Here's how to set it up:

### Using Gmail

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Select "2-Step Verification"
   - Scroll to "App passwords" and click it
   - Select "Mail" and "Other (Custom name)"
   - Enter "Quiz AI" as the name
   - Click "Generate"
   - Copy the 16-character password

3. **Configure `.env` file**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   EMAIL_FROM="Quiz AI <your.email@gmail.com>"
   ```

### Using Other SMTP Services

**SendGrid:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM="Quiz AI <noreply@yourdomain.com>"
```

**Mailgun:**
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your-mailgun-smtp-password
EMAIL_FROM="Quiz AI <noreply@yourdomain.com>"
```

**AWS SES:**
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-ses-smtp-username
EMAIL_PASSWORD=your-ses-smtp-password
EMAIL_FROM="Quiz AI <noreply@yourdomain.com>"
```

### Testing Email Configuration

After configuring your email service, you can test it by:

1. Starting the server: `pnpm dev`
2. Registering a new teacher account
3. Checking if the OTP email is received

If emails are not being sent, check:
- Email credentials are correct
- SMTP host and port are correct
- Firewall/network allows outbound SMTP connections
- Check server logs for error messages

### Development Mode

In development, OTP codes are also logged to the console for testing purposes. Check your terminal output when an OTP is generated.

## Database Migration

### OTP Verification Migration

If you're upgrading to the OTP verification system and have existing users in your database, you need to run a migration to mark them as verified:

```bash
pnpm migrate:verify-users
```

This script will:
- Update all existing users to set `isVerified: true`
- Set `verifiedAt` to the current timestamp
- Reset OTP-related fields (`failedOTPAttempts`, `otpLockedUntil`)

**Important:** Run this migration **before** deploying the OTP verification feature to production to ensure existing users can continue logging in without email verification.

The migration is idempotent and safe to run multiple times.

## API Endpoints

### Health Check

- `GET /api/health` - Server health check

### Authentication

- `POST /api/auth/register` - Register new teacher

  - Body: `{ name, email, password }`
  - Returns: `{ message, email }` (sends OTP to email)

- `POST /api/auth/verify-otp` - Verify OTP code

  - Body: `{ email, code }`
  - Returns: `{ token, user }`

- `POST /api/auth/resend-otp` - Resend OTP code

  - Body: `{ email }`
  - Returns: `{ message }`

- `POST /api/auth/login` - Teacher login

  - Body: `{ email, password }`
  - Returns: `{ token, user }` (requires verified email)

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
