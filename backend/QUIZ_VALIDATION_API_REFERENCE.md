# Quiz Validation API Reference

## Overview
This document describes the enhanced quiz validation endpoints that support start dates, maximum student limits, and automatic status management.

## Quiz Status Values

| Status | Description |
|--------|-------------|
| `scheduled` | Quiz has a start date in the future and hasn't started yet |
| `active` | Quiz is currently available for students to take |
| `full` | Quiz has reached its maximum number of participants |
| `expired` | Quiz expiration date has passed |
| `draft` | Quiz is being created (not currently used) |

## Enhanced Endpoints

### POST /api/quiz/create

Create a new quiz with optional start date and max students limit.

**Authentication**: Required (Teacher)

**Request Body**:
```json
{
  "title": "My Quiz",
  "duration": 30,
  "questionsPerStudent": 10,
  "totalQuestions": 20,
  "expiresAt": "2025-12-31T23:59:59Z",
  "startDate": "2025-11-10T09:00:00Z",  // Optional
  "maxStudents": 50,                     // Optional
  "subjects": ["Math", "Science"],       // Optional
  "textContent": "Content for quiz generation...",
  "questionDistribution": {
    "multipleChoice": 15,
    "trueFalse": 3,
    "fillInBlank": 2,
    "matching": 0
  }
}
```

**Response**:
```json
{
  "_id": "quiz_id",
  "title": "My Quiz",
  "accessCode": "ABC123",
  "status": "scheduled",  // or "active" if no startDate or startDate is in past
  "startDate": "2025-11-10T09:00:00Z",
  "expiresAt": "2025-12-31T23:59:59Z",
  "maxStudents": 50,
  "subjects": ["Math", "Science"],
  // ... other quiz fields
}
```

### POST /api/quiz/validate

Validate a quiz access code and check if quiz is available.

**Authentication**: Not required (Public)

**Request Body**:
```json
{
  "accessCode": "ABC123"
}
```

**Success Response** (200):
```json
{
  "_id": "quiz_id",
  "title": "My Quiz",
  "duration": 30,
  "questionsPerStudent": 10,
  "status": "active",
  "startDate": "2025-11-10T09:00:00Z",
  "expiresAt": "2025-12-31T23:59:59Z",
  "maxStudents": 50,
  "currentSubmissions": 25
}
```

**Error Responses**:

**Quiz Not Found** (404):
```json
{
  "message": "Invalid quiz code"
}
```

**Quiz Not Started** (400):
```json
{
  "message": "This quiz has not started yet",
  "startDate": "2025-11-10T09:00:00Z"
}
```

**Quiz Expired** (400):
```json
{
  "message": "This quiz has expired and is no longer available"
}
```

**Quiz Full** (400):
```json
{
  "message": "This quiz has reached its maximum number of participants",
  "maxStudents": 50,
  "currentSubmissions": 50
}
```

### POST /api/quiz/start

Get randomized questions for a student to start the quiz.

**Authentication**: Not required (Public)

**Request Body**:
```json
{
  "accessCode": "ABC123"
}
```

**Success Response** (200):
```json
{
  "quizId": "quiz_id",
  "title": "My Quiz",
  "duration": 30,
  "questions": [
    {
      "_id": "question_id",
      "type": "multipleChoice",
      "question": "What is 2+2?",
      "options": ["3", "4", "5", "6"]
    }
    // ... more questions
  ]
}
```

**Error Responses**: Same as `/api/quiz/validate`

### GET /api/quiz/my-quizzes

Get all quizzes for the authenticated teacher with automatic status updates.

**Authentication**: Required (Teacher)

**Response**:
```json
[
  {
    "_id": "quiz_id",
    "title": "My Quiz",
    "accessCode": "ABC123",
    "status": "active",
    "startDate": "2025-11-10T09:00:00Z",
    "expiresAt": "2025-12-31T23:59:59Z",
    "maxStudents": 50,
    "subjects": ["Math", "Science"],
    "submissionCount": 25,
    "createdAt": "2025-11-01T10:00:00Z",
    "updatedAt": "2025-11-02T15:30:00Z"
  }
  // ... more quizzes
]
```

**Note**: This endpoint automatically updates quiz statuses based on current time:
- Sets to `scheduled` if start date is in future
- Transitions to `active` if start date has arrived
- Sets to `full` if submission count >= maxStudents
- Sets to `expired` if expiration date has passed

### GET /api/quiz/:quizId

Get a specific quiz by ID with automatic status update.

**Authentication**: Required (Teacher)

**Response**: Same structure as quiz object in `/api/quiz/my-quizzes`

### POST /api/submission/submit

Submit a completed quiz with validation checks.

**Authentication**: Not required (Public)

**Request Body**:
```json
{
  "quizId": "quiz_id",
  "studentName": "John Doe",
  "studentId": "S12345",
  "answers": [
    {
      "questionId": "question_id",
      "questionType": "multipleChoice",
      "selectedAnswer": 1
    }
    // ... more answers
  ],
  "timeTaken": 1800
}
```

**Success Response** (201):
```json
{
  "score": 8,
  "totalQuestions": 10,
  "submissionId": "submission_id",
  "answers": [
    {
      "questionId": "question_id",
      "questionType": "multipleChoice",
      "selectedAnswer": 1,
      "isCorrect": true
    }
    // ... more graded answers
  ]
}
```

**Error Responses**:

**Quiz Expired** (400):
```json
{
  "message": "This quiz has expired and is no longer accepting submissions",
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

**Quiz Full** (400):
```json
{
  "message": "This quiz has reached its maximum number of participants",
  "maxStudents": 50,
  "currentSubmissions": 50
}
```

**Note**: This endpoint:
1. Checks if quiz has expired before accepting submission
2. Checks if quiz is full before accepting submission
3. After successful submission, updates quiz status to `full` if limit is reached

## Status Transition Flow

```
Creation with future startDate
    ↓
[scheduled] ──────────────────────────────────────┐
    ↓ (start date arrives)                        │
[active] ─────────────────────────────────────────┤
    ↓ (max students reached)                      │
[full] ───────────────────────────────────────────┤
    ↓ (expiration date passes)                    │
[expired] ←───────────────────────────────────────┘
```

**Priority Order**:
1. `scheduled` - Has future start date
2. `active` - Started and not full/expired
3. `full` - Reached max students (takes precedence over expired)
4. `expired` - Past expiration date

## Automatic Status Updates

Status is automatically checked and updated in these scenarios:

1. **Quiz Creation**: Initial status set based on start date
2. **Quiz Validation**: Before allowing student access
3. **Quiz Start**: Before providing questions
4. **Quiz Submission**: Before accepting submission and after successful submission
5. **Teacher Quiz List**: When fetching all quizzes
6. **Teacher Quiz View**: When fetching single quiz

## Frontend Integration Tips

### Displaying Quiz Status

```javascript
const statusConfig = {
  scheduled: {
    color: 'blue',
    icon: 'clock',
    message: 'Starts on {startDate}'
  },
  active: {
    color: 'green',
    icon: 'check',
    message: 'Available now'
  },
  full: {
    color: 'orange',
    icon: 'users',
    message: 'Maximum participants reached'
  },
  expired: {
    color: 'red',
    icon: 'x',
    message: 'Expired'
  }
};
```

### Handling Validation Errors

```javascript
try {
  const response = await axios.post('/api/quiz/validate', { accessCode });
  // Quiz is available, proceed to lobby
} catch (error) {
  if (error.response?.status === 400) {
    const { message, startDate } = error.response.data;
    
    if (message.includes('not started')) {
      // Show scheduled message with start date
      showError(`Quiz starts on ${formatDate(startDate)}`);
    } else if (message.includes('expired')) {
      // Show expired message
      showError('This quiz is no longer available');
    } else if (message.includes('maximum')) {
      // Show full message
      showError('This quiz has reached capacity');
    }
  }
}
```

### Displaying Submission Count

```javascript
// For quizzes with maxStudents
if (quiz.maxStudents) {
  const percentage = (quiz.submissionCount / quiz.maxStudents) * 100;
  
  return (
    <div>
      <ProgressBar value={percentage} />
      <span>{quiz.submissionCount} / {quiz.maxStudents} participants</span>
    </div>
  );
}
```

## Testing

Use the provided test script to verify all validation logic:

```bash
cd backend
node test-quiz-validation.js
```

Make sure you have:
- Backend server running on http://localhost:5000
- Test teacher account (email: teacher@test.com, password: password123)
