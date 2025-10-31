# Application Routes & Pages

## 🌎 Public & General Pages

### `/` - Landing Page
- Homepage explaining the system
- Two CTAs: Teacher login and Student quiz access
- Accessible to everyone

### `/login` - Teacher Login
- Authentication form for teachers
- Redirects to `/dashboard` on success

### `/register` - Teacher Registration
- Sign-up form for new teachers
- Creates teacher account

### `/join` - Student Access Page
- Simple form: student name/ID + quiz code
- Validates code and redirects to quiz lobby
- Alternative: Can be integrated into landing page

## 🎓 Student Flow Pages

### `/quiz/[code]/start` - Quiz Lobby/Instructions
- Displays after valid code entry
- Shows: quiz title, time limit, number of questions
- "Start Quiz" button to begin
- Validates quiz is active and not expired

### `/quiz/[code]/take` - Quiz Interface
- Active countdown timer (auto-submit on expiry)
- Randomized questions with multiple-choice options
- "Submit Quiz" button
- Prevents navigation away during quiz

### `/quiz/[code]/results` - Submission Confirmation
- Shown after submission or timer expiry
- Displays student's score (e.g., "8/10")
- Confirmation message
- Optional: Show correct answers if enabled

### `/quiz/error` - Quiz Error Page
- Handles various error states:
  - Invalid quiz code
  - Quiz expired
  - Quiz not started yet
  - Quiz already taken (if applicable)

## 👨‍🏫 Teacher Dashboard Pages

### `/dashboard` - Dashboard Home
- Protected route (requires teacher login)
- Grid/list of all created quizzes
- Shows: title, status, submission count
- "Create New Quiz" button

### `/dashboard/create` - Create Quiz Page
- Multi-step wizard:
  - **Step 1: Upload** - Upload files (PDF, DOCX, PPT) or paste text/link
  - **Step 2: AI Processing** - System extracts content and generates questions
  - **Step 3: Configure** - Set title, timer, expiration date, number of questions per student
  - **Step 4: Review** - Preview generated questions, edit if needed
- Saves quiz and generates unique access code

### `/dashboard/quiz/[quizId]` - Quiz Management
- Displays unique quiz access code prominently
- Copy-to-clipboard functionality
- Edit quiz settings (title, expiration, timer)
- View quiz status (active/expired)
- Delete quiz option
- Link to results/analytics

### `/dashboard/quiz/[quizId]/results` - Quiz Analytics
- **Summary Statistics:**
  - Class average score
  - Highest score
  - Lowest score
  - Total submissions
- **Submissions Table:**
  - Student name/ID
  - Score
  - Submission time
  - Time taken
- **Question Analytics:**
  - Accuracy rate per question
  - Most missed questions
- **Export Options:**
  - Export to PDF
  - Export to Excel

### `/dashboard/settings` - Account Settings
- Teacher profile management
- Change password
- Account preferences
- Notification settings

## Route Protection

### Public Routes
- `/`, `/login`, `/register`, `/join`
- `/quiz/[code]/*` (student pages)
- `/quiz/error`

### Protected Routes (Teacher Auth Required)
- `/dashboard`
- `/dashboard/create`
- `/dashboard/quiz/[quizId]`
- `/dashboard/quiz/[quizId]/results`
- `/dashboard/settings`

## Dynamic Route Parameters

- `[code]` - Unique quiz access code (e.g., "ABC123")
- `[quizId]` - MongoDB ObjectId or unique quiz identifier

## Navigation Patterns

### Student Journey
1. `/` or `/join` → Enter code
2. `/quiz/[code]/start` → Read instructions
3. `/quiz/[code]/take` → Complete quiz
4. `/quiz/[code]/results` → View score

### Teacher Journey
1. `/login` → Authenticate
2. `/dashboard` → View quizzes
3. `/dashboard/create` → Create new quiz
4. `/dashboard/quiz/[quizId]` → Share code
5. `/dashboard/quiz/[quizId]/results` → View analytics
