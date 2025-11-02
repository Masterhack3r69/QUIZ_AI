# API Endpoint Testing Guide

This guide provides curl commands to test the new content processing endpoints.

## Prerequisites

1. Start the backend server:
```bash
cd backend
pnpm dev
```

2. Create a teacher account and get a JWT token:
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Teacher","email":"teacher@test.com","password":"password123"}'

# Login (save the token from response)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@test.com","password":"password123"}'
```

3. Replace `YOUR_TOKEN_HERE` in the commands below with your actual JWT token.

## Test Commands

### 1. Process Topic Text

```bash
curl -X POST http://localhost:5000/api/quiz/process-topic \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "topicText": "Artificial Intelligence is the simulation of human intelligence processes by machines, especially computer systems. These processes include learning, reasoning, and self-correction. AI applications include expert systems, natural language processing, speech recognition and machine vision."
  }'
```

Expected response:
```json
{
  "content": "Artificial Intelligence is...",
  "contentLength": 234,
  "message": "Topic content validated successfully"
}
```

### 2. Process Video URL

```bash
curl -X POST http://localhost:5000/api/quiz/process-video \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "videoUrl": "https://www.youtube.com/watch?v=aircAruvnKk"
  }'
```

Note: This will only work if the video has captions/transcript available.

### 3. Process Web URL

```bash
curl -X POST http://localhost:5000/api/quiz/process-url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "webUrl": "https://en.wikipedia.org/wiki/Machine_learning"
  }'
```

Expected response:
```json
{
  "content": "Machine learning is a field of study...",
  "contentLength": 15234,
  "message": "Web content extracted successfully"
}
```

### 4. Generate Questions from Content

```bash
curl -X POST http://localhost:5000/api/quiz/generate-questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "content": "Photosynthesis is the process by which plants use sunlight, water and carbon dioxide to create oxygen and energy in the form of sugar. This process is essential for life on Earth as it provides oxygen for animals to breathe and serves as the foundation of the food chain."
  }'
```

Expected response:
```json
{
  "questions": [
    {
      "question": "What is photosynthesis?",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": 0
    }
  ],
  "questionCount": 20,
  "message": "Questions generated successfully"
}
```

### 5. Create Quiz with Topic

```bash
curl -X POST http://localhost:5000/api/quiz/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "sourceType": "topic",
    "textContent": "The water cycle describes how water evaporates from the surface of the earth, rises into the atmosphere, cools and condenses into rain or snow in clouds, and falls again to the surface as precipitation. The cycling of water in and out of the atmosphere is a significant aspect of the weather patterns on Earth.",
    "title": "Water Cycle Quiz",
    "duration": 20,
    "expiresAt": "2025-12-31T23:59:59Z",
    "questionsPerStudent": 10
  }'
```

### 6. Create Quiz with Video URL

```bash
curl -X POST http://localhost:5000/api/quiz/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "sourceType": "video",
    "videoUrl": "https://www.youtube.com/watch?v=aircAruvnKk",
    "title": "Neural Networks Quiz",
    "duration": 30,
    "expiresAt": "2025-12-31T23:59:59Z",
    "questionsPerStudent": 10
  }'
```

### 7. Create Quiz with Web URL

```bash
curl -X POST http://localhost:5000/api/quiz/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "sourceType": "url",
    "webUrl": "https://en.wikipedia.org/wiki/Quantum_computing",
    "title": "Quantum Computing Quiz",
    "duration": 25,
    "expiresAt": "2025-12-31T23:59:59Z",
    "questionsPerStudent": 10
  }'
```

## Error Testing

### Test Invalid Topic (Too Short)

```bash
curl -X POST http://localhost:5000/api/quiz/process-topic \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "topicText": "Too short"
  }'
```

Expected: 400 error with message "Topic text must be at least 50 characters long"

### Test Invalid Video URL

```bash
curl -X POST http://localhost:5000/api/quiz/process-video \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "videoUrl": "https://not-youtube.com/video"
  }'
```

Expected: 400 error with message about invalid YouTube URL

### Test Invalid Web URL

```bash
curl -X POST http://localhost:5000/api/quiz/process-url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "webUrl": "not-a-valid-url"
  }'
```

Expected: 400 error with message about invalid URL format

## Postman Collection

You can also import these requests into Postman for easier testing:

1. Create a new collection called "Quiz Content Processing"
2. Add environment variables:
   - `base_url`: http://localhost:5000
   - `token`: YOUR_JWT_TOKEN
3. Create requests for each endpoint above
4. Use `{{base_url}}` and `{{token}}` in your requests

## Notes

- All endpoints require authentication (JWT token in Authorization header)
- Video extraction only works for YouTube videos with available transcripts
- Web extraction works best with article-style content
- Topic text must be between 50 and 10,000 characters
- The AI question generation may fall back to mock questions if GEMINI_API_KEY is not set
