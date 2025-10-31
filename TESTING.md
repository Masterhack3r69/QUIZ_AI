# Testing the AI Quiz Generator

## Setup

### 1. Start the Backend
```bash
cd backend
pnpm install
pnpm dev
```

Backend will run on http://localhost:5000

### 2. Start the Frontend
```bash
cd frontend
pnpm install
pnpm dev
```

Frontend will run on http://localhost:3000

## Testing the AI Upload Feature

1. Open http://localhost:3000 in your browser
2. Click on "Test AI Upload" card
3. Upload a PDF, DOCX, or TXT file (max 10MB)
4. Click "Upload & Generate Questions"
5. Wait for the AI to process (may take 10-30 seconds)
6. View the results:
   - Extracted content summary
   - Generated quiz questions with correct answers marked
   - Quiz access code

## What to Test

- Upload different file types (PDF, DOCX, TXT)
- Check if content is extracted correctly
- Verify AI generates relevant questions
- Confirm questions have 4 options each
- Check that correct answers are marked

## Notes

- The test route doesn't save to database
- No authentication required for testing
- Uses Google Gemini AI (gemini-2.0-flash-exp)
- Falls back to mock questions if API fails
