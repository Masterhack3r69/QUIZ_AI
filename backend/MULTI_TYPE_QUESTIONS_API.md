# Multi-Type Questions API Documentation

This document describes the updated API endpoints that support multiple question types (Multiple Choice, True/False, Fill-in-the-Blank, and Matching).

## Question Types

### 1. Multiple Choice
```json
{
  "type": "multipleChoice",
  "question": "What is AI?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0
}
```

### 2. True/False
```json
{
  "type": "trueFalse",
  "question": "AI can learn from data.",
  "correctAnswer": true
}
```

### 3. Fill-in-the-Blank
```json
{
  "type": "fillInBlank",
  "question": "Machine learning is a subset of _____.",
  "correctAnswer": "artificial intelligence",
  "caseSensitive": false
}
```

### 4. Matching
```json
{
  "type": "matching",
  "question": "Match the AI concepts:",
  "leftColumn": ["ML", "NLP", "CV", "DL"],
  "rightColumn": ["Language", "Vision", "Neural Networks", "Learning"],
  "correctPairs": [
    {"left": 0, "right": 3},
    {"left": 1, "right": 0},
    {"left": 2, "right": 1},
    {"left": 3, "right": 2}
  ]
}
```

## API Endpoints

### 1. Generate Questions with Distribution

**Endpoint:** `POST /api/quiz/generate-questions`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Your educational content here...",
  "questionDistribution": {
    "multipleChoice": 10,
    "trueFalse": 5,
    "fillInBlank": 3,
    "matching": 2
  },
  "totalQuestions": 20
}
```

**Response:**
```json
{
  "questions": [
    {
      "type": "multipleChoice",
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": 0
    },
    {
      "type": "trueFalse",
      "question": "...",
      "correctAnswer": true
    }
  ],
  "questionCount": 20,
  "message": "Questions generated successfully"
}
```

### 2. Create Quiz with Question Distribution

**Endpoint:** `POST /api/quiz/create`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data (if uploading file)
Content-Type: application/json (if using other sources)
```

**Request Body (with file):**
```
title: "My Quiz"
duration: 30
expiresAt: "2024-12-31T23:59:59Z"
questionsPerStudent: 10
file: <file upload>
questionDistribution: {"multipleChoice": 7, "trueFalse": 2, "fillInBlank": 1}
totalQuestions: 20
```

**Request Body (with topic):**
```json
{
  "title": "AI Basics Quiz",
  "duration": 30,
  "expiresAt": "2024-12-31T23:59:59Z",
  "questionsPerStudent": 10,
  "sourceType": "topic",
  "textContent": "Artificial Intelligence is...",
  "questionDistribution": {
    "multipleChoice": 5,
    "trueFalse": 3,
    "fillInBlank": 2,
    "matching": 0
  },
  "totalQuestions": 10
}
```

**Response:**
```json
{
  "_id": "...",
  "title": "AI Basics Quiz",
  "accessCode": "ABC123",
  "questions": [...],
  "questionDistribution": {
    "multipleChoice": 5,
    "trueFalse": 3,
    "fillInBlank": 2,
    "matching": 0
  },
  "questionsPerStudent": 10,
  "duration": 30,
  "expiresAt": "2024-12-31T23:59:59Z",
  "status": "active"
}
```

### 3. Start Quiz (Student)

**Endpoint:** `POST /api/quiz/start`

**Request Body:**
```json
{
  "accessCode": "ABC123"
}
```

**Response:**
```json
{
  "quizId": "...",
  "title": "AI Basics Quiz",
  "duration": 30,
  "questions": [
    {
      "_id": "...",
      "type": "multipleChoice",
      "question": "What is AI?",
      "options": ["Option A", "Option B", "Option C", "Option D"]
    },
    {
      "_id": "...",
      "type": "trueFalse",
      "question": "AI can learn from data."
    },
    {
      "_id": "...",
      "type": "fillInBlank",
      "question": "Machine learning is a subset of _____.",
      "caseSensitive": false
    },
    {
      "_id": "...",
      "type": "matching",
      "question": "Match the AI concepts:",
      "leftColumn": ["ML", "NLP", "CV", "DL"],
      "rightColumn": ["Vision", "Language", "Neural Networks", "Learning"]
    }
  ]
}
```

## Distribution Validation and Adjustment

The system automatically validates and adjusts the question distribution if the AI cannot generate enough questions of a specific type:

1. **Requested Distribution:** What you ask for
2. **Generated Distribution:** What the AI actually produces
3. **Adjusted Distribution:** Final distribution after validation

### Example Scenario:

**Requested:**
```json
{
  "multipleChoice": 10,
  "trueFalse": 5,
  "fillInBlank": 3,
  "matching": 2
}
```

**If AI only generates 2 matching questions instead of 2:**
- The system will log a warning
- Redistribute the shortfall to other types with capacity
- Ensure minimum 1 question per type if requested > 0

**Adjusted:**
```json
{
  "multipleChoice": 11,
  "trueFalse": 5,
  "fillInBlank": 3,
  "matching": 1
}
```

## Testing

### Test with Mock Questions (No API Key)

```bash
cd backend
node test-multi-type-questions.js
```

### Test with Real API

1. Set your Gemini API key:
```bash
export GEMINI_API_KEY=your_api_key_here
```

2. Run the test:
```bash
node test-multi-type-questions.js
```

## Notes

- If no `questionDistribution` is provided, all questions default to Multiple Choice
- The `totalQuestions` parameter determines the total number of questions to generate
- Questions are randomized when sent to students
- For Multiple Choice questions, options are shuffled
- For Matching questions, the right column is shuffled
- Correct answers are never sent to students during quiz taking
