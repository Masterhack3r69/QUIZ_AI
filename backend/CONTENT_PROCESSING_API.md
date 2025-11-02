# Content Processing API Documentation

This document describes the new content processing endpoints added to support multiple content sources for quiz generation.

## Overview

The quiz system now supports four content source types:
1. **File Upload** - PDF, DOCX, PPT, TXT files
2. **Topic Text** - Free-form text describing a subject
3. **Video URL** - YouTube videos with transcripts
4. **Web URL** - Articles and web pages

## API Endpoints

### 1. Process Video URL

Extract transcript content from YouTube videos.

**Endpoint:** `POST /api/quiz/process-video`

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Supported URL Formats:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

**Success Response (200):**
```json
{
  "content": "Extracted transcript text...",
  "contentLength": 5432,
  "message": "Video transcript extracted successfully"
}
```

**Error Responses:**
- `400` - Invalid YouTube URL format
- `400` - No transcript available for this video
- `400` - Transcript content is too short

---

### 2. Process Web URL

Extract main content from web pages and articles.

**Endpoint:** `POST /api/quiz/process-url`

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "webUrl": "https://example.com/article"
}
```

**Success Response (200):**
```json
{
  "content": "Extracted article text...",
  "contentLength": 8765,
  "message": "Web content extracted successfully"
}
```

**Error Responses:**
- `400` - Invalid URL format (must start with http:// or https://)
- `400` - Could not connect to the URL
- `400` - Request timed out
- `400` - Could not extract sufficient content from the webpage

**Notes:**
- Automatically removes scripts, styles, navigation, headers, and footers
- Attempts to extract main content from article containers
- 10-second timeout for requests
- Minimum 100 characters required

---

### 3. Process Topic Text

Validate free-form topic text for quiz generation.

**Endpoint:** `POST /api/quiz/process-topic`

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "topicText": "Your topic description here..."
}
```

**Success Response (200):**
```json
{
  "content": "Validated topic text...",
  "contentLength": 234,
  "message": "Topic content validated successfully"
}
```

**Error Responses:**
- `400` - Topic text is required
- `400` - Topic text must be at least 50 characters long
- `400` - Topic text must not exceed 10,000 characters

---

### 4. Generate Questions

Generate quiz questions from any content source.

**Endpoint:** `POST /api/quiz/generate-questions`

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "content": "Content text to generate questions from..."
}
```

**Success Response (200):**
```json
{
  "questions": [
    {
      "question": "What is...?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0
    }
  ],
  "questionCount": 20,
  "message": "Questions generated successfully"
}
```

**Error Responses:**
- `400` - Content is required
- `500` - AI generation failed

---

### 5. Create Quiz (Enhanced)

The existing create quiz endpoint now supports all content source types.

**Endpoint:** `POST /api/quiz/create`

**Authentication:** Required (JWT token)

**Request Body (File Upload):**
```
Content-Type: multipart/form-data

file: [PDF/DOCX/PPT/TXT file]
title: "Quiz Title"
duration: 30
expiresAt: "2024-12-31T23:59:59Z"
questionsPerStudent: 10
```

**Request Body (Video URL):**
```json
{
  "sourceType": "video",
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "title": "Quiz Title",
  "duration": 30,
  "expiresAt": "2024-12-31T23:59:59Z",
  "questionsPerStudent": 10
}
```

**Request Body (Web URL):**
```json
{
  "sourceType": "url",
  "webUrl": "https://example.com/article",
  "title": "Quiz Title",
  "duration": 30,
  "expiresAt": "2024-12-31T23:59:59Z",
  "questionsPerStudent": 10
}
```

**Request Body (Topic Text):**
```json
{
  "sourceType": "topic",
  "textContent": "Your topic description...",
  "title": "Quiz Title",
  "duration": 30,
  "expiresAt": "2024-12-31T23:59:59Z",
  "questionsPerStudent": 10
}
```

**Success Response (201):**
```json
{
  "_id": "quiz_id",
  "title": "Quiz Title",
  "accessCode": "ABC123",
  "questions": [...],
  "questionsPerStudent": 10,
  "duration": 30,
  "expiresAt": "2024-12-31T23:59:59Z",
  "sourceContent": {
    "type": "video",
    "content": "https://www.youtube.com/watch?v=VIDEO_ID"
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## Implementation Details

### Video Content Extraction

Uses the `youtube-transcript` package to fetch video transcripts:
- Supports multiple YouTube URL formats
- Extracts and combines all transcript segments
- Requires minimum 100 characters of content
- Throws error if no transcript is available

### Web Content Extraction

Uses `axios` and `cheerio` for web scraping:
- Fetches HTML content with proper User-Agent header
- Removes non-content elements (scripts, styles, navigation)
- Attempts to find main content using common selectors
- Cleans up whitespace and formatting
- 10-second timeout to prevent hanging requests

### Topic Validation

Simple validation for free-form text:
- Minimum 50 characters required
- Maximum 10,000 characters allowed
- Trims whitespace
- Returns validated content

## Error Handling

All endpoints include comprehensive error handling:
- Input validation errors (400)
- Network errors (400)
- Timeout errors (400)
- Content extraction failures (400)
- Server errors (500)

Error messages are user-friendly and actionable.

## Testing

A test file is provided at `backend/test-content-extraction.js`:

```bash
node test-content-extraction.js
```

This tests:
- Topic validation (short and valid topics)
- Video extraction (with sample YouTube URL)
- Web extraction (with Wikipedia article)
- Invalid URL handling

## Dependencies

New packages added:
- `youtube-transcript` - YouTube transcript extraction
- `cheerio` - HTML parsing and manipulation
- `axios` - HTTP client for web requests

Install with:
```bash
pnpm add youtube-transcript cheerio axios
```

## Usage Examples

### Frontend Integration

```javascript
// Process video URL
const response = await fetch('/api/quiz/process-video', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    videoUrl: 'https://www.youtube.com/watch?v=VIDEO_ID'
  })
});

const { content } = await response.json();

// Generate questions from content
const questionsResponse = await fetch('/api/quiz/generate-questions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ content })
});

const { questions } = await questionsResponse.json();
```

## Future Enhancements

Potential improvements:
- Support for more video platforms (Vimeo, Dailymotion)
- PDF extraction from web URLs
- Content caching to avoid re-extraction
- Rate limiting for external requests
- Content quality scoring
- Language detection and translation
