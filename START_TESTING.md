# Quick Start Guide

## Prerequisites
- Node.js installed
- pnpm installed (`npm install -g pnpm`)
- MongoDB connection (already configured in backend/.env)

## Start Both Servers

### Terminal 1 - Backend
```bash
cd backend
pnpm install
pnpm dev
```
Wait for: "Server running on port 5000"

### Terminal 2 - Frontend  
```bash
cd frontend
pnpm install
pnpm dev
```
Wait for: "Ready on http://localhost:3000"

## Test the Application

1. Open browser: http://localhost:3000
2. Click "Test AI Upload"
3. Upload a PDF/DOCX/TXT file
4. Click "Upload & Generate Questions"
5. Wait 10-30 seconds for AI processing
6. View generated questions!

## Sample Test Files

Create a simple test file:

**test.txt**
```
Photosynthesis is the process by which plants convert light energy into chemical energy.
Plants use chlorophyll to absorb sunlight. The process occurs in the chloroplasts.
Carbon dioxide and water are converted into glucose and oxygen.
The chemical equation is: 6CO2 + 6H2O + light → C6H12O6 + 6O2
```

## Troubleshooting

- **Backend not starting**: Check MongoDB connection in backend/.env
- **AI not working**: Verify GEMINI_API_KEY in backend/.env
- **CORS errors**: Make sure both servers are running on correct ports
- **File upload fails**: Check file size (max 10MB) and format (PDF/DOCX/TXT)
