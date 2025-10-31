# System Flow - AI Quiz Generator

## Complete System Architecture

This document explains how the entire quiz system works, from start to finish, in simple terms.

---

## Overview Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Teacher   │────────▶│    System    │◀────────│   Student   │
│  Dashboard  │         │   (Backend)  │         │    Portal   │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │                         │
      │                        │                         │
      ▼                        ▼                         ▼
  Create Quiz            Process & Store           Take Quiz
  View Results           Generate Questions        Get Score
```

---

## Part 1: Teacher Creates a Quiz

### Flow Steps

```
1. Teacher Login
   ↓
2. Upload Materials
   ↓
3. AI Processing
   ↓
4. Configure Settings
   ↓
5. Review Questions
   ↓
6. Publish Quiz
   ↓
7. Get Access Code
```

### Detailed Process

#### Step 1: Teacher Authentication
**What Happens:**
- Teacher goes to `/login` page
- Enters email and password
- System checks credentials against database
- If correct, creates secure session
- Redirects to `/dashboard`

**Technical Flow:**
```
User Input → Frontend Form → API Request → Backend Validation
→ Database Check → Password Comparison → Session Creation
→ JWT Token → Store in Cookie → Redirect to Dashboard
```

#### Step 2: Upload Materials
**What Happens:**
- Teacher clicks "Create New Quiz"
- Goes to `/dashboard/create` page
- Uploads file OR pastes text
- System validates file type and size
- File uploaded to server storage

**Technical Flow:**
```
File Selection → Frontend Validation (type, size)
→ FormData Creation → POST to /api/upload
→ Backend receives file → Save to /uploads folder
→ Extract text content → Return file ID
```

**Supported Formats:**
- PDF: Extract text using pdf-parse library
- DOCX: Extract text using mammoth library
- PPTX: Extract text using pptx-parser
- TXT: Read directly
- Pasted Text: Use as-is

#### Step 3: AI Processing
**What Happens:**
- System reads extracted text
- Sends to AI/LLM service
- AI analyzes content and generates questions
- Each question has 4 choices (A, B, C, D)
- One correct answer per question

**Technical Flow:**
```
Extracted Text → Clean and Format → Send to AI API
→ AI generates questions → Parse AI response
→ Validate question format → Store in temporary array
→ Return to frontend
```

**AI Prompt Structure:**
```
"Based on this content: [TEXT]
Generate [N] multiple-choice questions.
Each question should have:
- Clear question text
- 4 answer options
- 1 correct answer
- Appropriate difficulty level"
```

#### Step 4: Configure Quiz Settings
**What Happens:**
- Teacher sets quiz title
- Chooses time limit (minutes)
- Sets expiration date and time
- Selects questions per student
- Optionally edits generated questions

**Settings Stored:**
```javascript
{
  title: "Chapter 5 Quiz",
  timeLimit: 30, // minutes
  expiresAt: "2025-11-15T23:59:59Z",
  questionsPerStudent: 10,
  totalQuestions: 50, // in question pool
  showResults: true,
  allowRetake: false
}
```

#### Step 5: Save Quiz to Database
**What Happens:**
- System generates unique access code
- Saves quiz metadata
- Saves all questions to question pool
- Links questions to quiz
- Returns quiz ID and access code

**Database Structure:**
```javascript
Quiz Document:
{
  _id: ObjectId,
  teacherId: ObjectId,
  title: String,
  accessCode: String, // e.g., "ABC123"
  timeLimit: Number,
  expiresAt: Date,
  questionsPerStudent: Number,
  status: "active" | "expired",
  createdAt: Date
}

Question Documents:
{
  _id: ObjectId,
  quizId: ObjectId,
  questionText: String,
  options: [String, String, String, String],
  correctAnswer: Number, // 0-3 index
  difficulty: "easy" | "medium" | "hard"
}
```

#### Step 6: Share Quiz Code
**What Happens:**
- Teacher sees quiz management page
- Access code displayed prominently
- Copy-to-clipboard button available
- Teacher shares code with students

---

## Part 2: Student Takes Quiz

### Flow Steps

```
1. Enter Quiz Code
   ↓
2. Validate Code
   ↓
3. View Instructions
   ↓
4. Start Quiz
   ↓
5. Answer Questions
   ↓
6. Submit Answers
   ↓
7. View Results
```

### Detailed Process

#### Step 1: Access Quiz
**What Happens:**
- Student goes to `/join` page
- Enters name, student ID, and quiz code
- Clicks "Join Quiz"

**Frontend Form:**
```javascript
{
  studentName: "John Doe",
  studentId: "12345",
  quizCode: "ABC123"
}
```

#### Step 2: Code Validation
**What Happens:**
- System checks if code exists
- Verifies quiz is active (not expired)
- Checks if quiz has started
- Validates quiz has questions

**Technical Flow:**
```
POST /api/quiz/validate
→ Find quiz by accessCode
→ Check expiresAt > now
→ Check status === "active"
→ If valid: return quiz info
→ If invalid: return error message
```

**Validation Checks:**
```javascript
if (!quiz) return "Invalid quiz code"
if (quiz.expiresAt < now) return "Quiz has expired"
if (quiz.status !== "active") return "Quiz is not available"
if (quiz.questions.length === 0) return "Quiz has no questions"
```

#### Step 3: Quiz Lobby
**What Happens:**
- Student redirected to `/quiz/[code]/start`
- Sees quiz information:
  - Title
  - Time limit
  - Number of questions
  - Instructions
- Clicks "Start Quiz" button

**Display Information:**
```
Quiz Title: Chapter 5 Biology Test
Time Limit: 30 minutes
Questions: 10 questions
Instructions: Answer all questions. Quiz will auto-submit when time expires.
```

#### Step 4: Generate Student's Questions
**What Happens:**
- System randomly selects questions from pool
- Number selected = questionsPerStudent setting
- Questions shuffled for this student
- Answer options also shuffled
- Creates submission record

**Technical Flow:**
```
GET /api/quiz/[code]/start
→ Get all questions for quiz
→ Randomly select N questions
→ Shuffle question order
→ Shuffle answer options (track correct answer)
→ Create submission document
→ Return questions to frontend
```

**Randomization Example:**
```javascript
// Quiz has 50 questions total
// Student gets 10 random questions
const allQuestions = await Question.find({ quizId });
const shuffled = allQuestions.sort(() => Math.random() - 0.5);
const studentQuestions = shuffled.slice(0, 10);
```

#### Step 5: Taking the Quiz
**What Happens:**
- Student sees first question
- Timer starts counting down
- Student selects answer
- Clicks "Next" to move forward
- Can review previous answers
- Timer always visible

**Frontend State:**
```javascript
{
  currentQuestion: 0,
  totalQuestions: 10,
  timeRemaining: 1800, // seconds
  answers: {
    0: 2, // question index: selected option
    1: 1,
    2: 3,
    // ...
  },
  startTime: Date.now()
}
```

**Timer Logic:**
```javascript
// Count down every second
setInterval(() => {
  timeRemaining--;
  if (timeRemaining <= 0) {
    autoSubmitQuiz();
  }
}, 1000);
```

#### Step 6: Submit Quiz
**What Happens:**
- Student clicks "Submit" OR timer expires
- Confirmation dialog (if manual submit)
- Answers sent to backend
- System calculates score
- Saves submission to database

**Technical Flow:**
```
POST /api/quiz/[code]/submit
→ Receive student answers
→ Get correct answers from database
→ Compare answers
→ Calculate score
→ Calculate time taken
→ Save submission
→ Return results
```

**Grading Logic:**
```javascript
let correctCount = 0;
studentAnswers.forEach((answer, index) => {
  const question = questions[index];
  if (answer === question.correctAnswer) {
    correctCount++;
  }
});
const score = correctCount;
const percentage = (correctCount / totalQuestions) * 100;
```

**Submission Document:**
```javascript
{
  _id: ObjectId,
  quizId: ObjectId,
  studentName: "John Doe",
  studentId: "12345",
  answers: [2, 1, 3, 0, 1, 2, 3, 1, 0, 2],
  score: 8,
  totalQuestions: 10,
  percentage: 80,
  timeTaken: 1245, // seconds
  submittedAt: Date,
  ipAddress: "192.168.1.1"
}
```

#### Step 7: View Results
**What Happens:**
- Student redirected to `/quiz/[code]/results`
- Sees their score
- Sees percentage
- Sees time taken
- Confirmation message displayed

**Results Display:**
```
✓ Quiz Submitted Successfully!

Your Score: 8 out of 10 (80%)
Time Taken: 20 minutes 45 seconds

Thank you for completing the quiz!
```

---

## Part 3: Teacher Views Results

### Flow Steps

```
1. Go to Dashboard
   ↓
2. Select Quiz
   ↓
3. View Analytics
   ↓
4. Export Results
```

### Detailed Process

#### Step 1: Access Analytics
**What Happens:**
- Teacher clicks on quiz from dashboard
- Goes to `/dashboard/quiz/[quizId]/results`
- System loads all submissions
- Calculates statistics

**Technical Flow:**
```
GET /api/quiz/[quizId]/results
→ Find all submissions for quiz
→ Calculate statistics
→ Group by student
→ Analyze question performance
→ Return data to frontend
```

#### Step 2: Statistics Calculation
**What Happens:**
- System processes all submissions
- Calculates class metrics
- Identifies trends

**Calculations:**
```javascript
const submissions = await Submission.find({ quizId });

// Class Statistics
const totalSubmissions = submissions.length;
const scores = submissions.map(s => s.score);
const average = scores.reduce((a, b) => a + b) / scores.length;
const highest = Math.max(...scores);
const lowest = Math.min(...scores);

// Question Analysis
const questionStats = questions.map(q => {
  const correctCount = submissions.filter(s => 
    s.answers[q.index] === q.correctAnswer
  ).length;
  return {
    question: q.questionText,
    correctRate: (correctCount / totalSubmissions) * 100
  };
});
```

#### Step 3: Display Analytics
**What Happens:**
- Summary cards show key metrics
- Table lists all submissions
- Charts show performance distribution
- Question breakdown shows difficulty

**Display Sections:**

**Summary:**
```
Total Submissions: 25
Class Average: 78%
Highest Score: 10/10 (100%)
Lowest Score: 4/10 (40%)
```

**Submissions Table:**
```
| Student Name | Student ID | Score | Percentage | Time Taken | Submitted At |
|--------------|------------|-------|------------|------------|--------------|
| John Doe     | 12345      | 8/10  | 80%        | 20m 45s    | 2:30 PM      |
| Jane Smith   | 12346      | 9/10  | 90%        | 18m 12s    | 2:35 PM      |
```

**Question Analysis:**
```
Question 1: 92% correct (Easy)
Question 2: 68% correct (Medium)
Question 3: 44% correct (Hard)
```

#### Step 4: Export Results
**What Happens:**
- Teacher clicks "Export" button
- Chooses format (PDF or Excel)
- System generates file
- File downloads to computer

**Export Formats:**

**PDF:**
- Title page with quiz info
- Summary statistics
- Full submissions table
- Question analysis
- Generated timestamp

**Excel:**
- Sheet 1: Summary
- Sheet 2: All submissions
- Sheet 3: Question analysis
- Formatted with colors and charts

---

## Data Flow Summary

### Complete Request-Response Cycle

```
┌──────────┐
│  Client  │
│ (Browser)│
└────┬─────┘
     │
     │ HTTP Request
     ▼
┌──────────────┐
│   Frontend   │
│  (Next.js)   │
└────┬─────────┘
     │
     │ API Call
     ▼
┌──────────────┐
│   Backend    │
│  (Express)   │
└────┬─────────┘
     │
     │ Query/Save
     ▼
┌──────────────┐
│   Database   │
│  (MongoDB)   │
└──────────────┘
```

### Example: Student Submits Quiz

```
1. Student clicks "Submit"
   → Frontend validates all questions answered
   
2. Frontend sends POST request
   → URL: /api/quiz/ABC123/submit
   → Body: { studentName, studentId, answers: [...] }
   
3. Backend receives request
   → Validates quiz code
   → Retrieves correct answers
   → Compares student answers
   → Calculates score
   
4. Backend saves to database
   → Creates Submission document
   → Updates quiz statistics
   
5. Backend sends response
   → Returns: { score, percentage, timeTaken }
   
6. Frontend receives response
   → Redirects to results page
   → Displays score to student
```

---

## Security Flow

### Authentication Flow

```
Login Request
→ Hash password
→ Compare with stored hash
→ Generate JWT token
→ Set secure cookie
→ Return success

Protected Route Access
→ Check cookie exists
→ Verify JWT token
→ Extract user ID
→ Allow access
```

### Quiz Access Control

```
Student Access
→ Validate quiz code
→ Check expiration
→ Check status
→ Allow if valid

Teacher Access
→ Verify logged in
→ Check quiz ownership
→ Allow if owner
```

---

## Error Handling Flow

### Common Error Scenarios

**Invalid Quiz Code:**
```
Student enters code
→ Backend searches database
→ No quiz found
→ Return 404 error
→ Show "Invalid code" message
```

**Quiz Expired:**
```
Student enters valid code
→ Backend checks expiresAt
→ Current time > expiresAt
→ Return 403 error
→ Show "Quiz expired" message
```

**Network Error:**
```
Request sent
→ Network timeout
→ Catch error
→ Show retry button
→ Log error for debugging
```

---

## Performance Optimizations

### Caching Strategy

**Quiz Data:**
- Cache quiz metadata for 5 minutes
- Invalidate on quiz update
- Reduces database queries

**Question Pool:**
- Load once per quiz session
- Store in memory
- Reuse for multiple students

### Database Indexing

```javascript
// Indexes for fast queries
Quiz: { accessCode: 1 }  // Find by code
Question: { quizId: 1 }  // Find quiz questions
Submission: { quizId: 1, submittedAt: -1 }  // Recent submissions
```

---

## Monitoring and Logging

### What Gets Logged

**User Actions:**
- Login attempts
- Quiz creation
- Quiz access
- Submission events

**System Events:**
- API requests
- Database queries
- Error occurrences
- Performance metrics

**Example Log Entry:**
```json
{
  "timestamp": "2025-10-31T14:30:00Z",
  "level": "info",
  "event": "quiz_submitted",
  "quizId": "507f1f77bcf86cd799439011",
  "studentId": "12345",
  "score": 8,
  "duration": 1245
}
```

---

This system flow document provides a complete picture of how every part of the quiz system works together, from teacher creation to student submission to results analysis.
