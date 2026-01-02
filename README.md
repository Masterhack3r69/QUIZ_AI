# AI Quiz Generator

An AI-powered platform that automatically generates high-quality quiz questions from various content sources (PDFs, videos, web pages, text). Teachers create and manage quizzes in minutes; students take assessments with randomized questions and get instant feedback.

## Quick Links
- **Frontend**: `frontend/` - Next.js React app
- **Backend**: `backend/` - Node.js Express API
- **Docs**: `docs/` - Implementation guides

## Key Features

- **Multi-Source Content Processing**: Upload PDFs, Word docs, PowerPoint slides, YouTube videos, web pages, or paste text
- **AI-Powered Question Generation**: Multi-agent pipeline with content extraction, question creation, quality validation, and improvement
- **Multiple Question Types**: Multiple choice, true/false, fill-in-the-blank, matching
- **Fair Testing**: Randomized questions per student, shuffled answer options
- **Two-Step Verification**: Quiz code entry + student information
- **Instant Grading**: Automatic scoring with immediate feedback
- **Analytics Dashboard**: Class performance, question difficulty, individual student tracking
- **Quiz Scheduling**: Set start dates, expiration times, and participant limits

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe code
- **Tailwind CSS 4** - Utility-first styling
- **Radix UI & Shadcn/ui** - Accessible components
- **React Hook Form + Zod** - Form validation
- **Framer Motion** - Animations

### Backend
- **Node.js + Express** - Server framework
- **MongoDB + Mongoose** - NoSQL database
- **JWT** - Authentication
- **Multer** - File uploads
- **Nodemailer** - Email verification

### AI & Processing
- **Google Gemini** - Fast question generation
- **OpenAI GPT-4** - High-quality analysis
- **Anthropic Claude** - Complex reasoning
- **Groq** - Ultra-fast processing
- **Ollama** - Local AI development
- **Google Cloud Platform (GCP)** - Cloud storage for AI agent prompts

### Content Processing
- **pdf-parse** - PDF extraction
- **mammoth** - Word document parsing
- **youtubei.js** - YouTube transcripts
- **cheerio + axios** - Web scraping

## How It Works

### Teacher Workflow (4 Steps)
1. **Upload Content**: Choose from PDF, Word, PowerPoint, YouTube, web page, or paste text
2. **AI Processing**: Multi-agent pipeline extracts content and generates questions (45-60 seconds)
3. **Configure Quiz**: Set title, duration, start/expiration dates, student limits, info requirements
4. **Share**: Get unique access code, distribute to students

### Student Workflow
1. **Enter Code**: Submit quiz code (e.g., "ABC123")
2. **Student Info**: Provide required information
3. **Take Quiz**: Answer randomized questions with visible timer
4. **Submit**: Auto-grade and instant feedback with score

## AI Processing Pipeline

**Stage 1**: Content extraction and key concept identification  
**Stage 2**: AI-generated questions with educational distractors  
**Stage 3** (Optional): Quality validation on 100-point scale  
**Stage 4** (Optional): Enhancement of low-scoring questions  

## Getting Started

### Installation & Setup

```bash
# Clone repository
git clone <repo-url>
cd quiz_ai

# Backend setup
cd backend
pnpm install
# Configure .env with MongoDB URI and API keys

# Frontend setup  
cd ../frontend
pnpm install
# Configure environment variables

# Start development
pnpm dev
```

### System Requirements
- **Node.js** 18+ with pnpm
- **MongoDB** database
- **Modern browser** (Chrome, Firefox, Safari, Edge)
- Internet connection for AI providers

## Project Structure

```
quiz_ai/
├── frontend/          # Next.js React application
│   ├── src/app/      # App router pages
│   ├── src/components/
│   ├── src/services/ # API client
│   └── src/lib/      # Utilities
├── backend/          # Node.js Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── services/
│   ├── config/       # AI task routing
│   └── scripts/      # Utility scripts
└── docs/            # Documentation
```

## Key Concepts

### Multi-Agent AI Pipeline
Questions are generated through specialized AI agents:
- **Content Extraction**: Identifies key topics and concepts
- **Question Generation**: Creates questions with educational distractors
- **Validation** (Optional): Grades questions (0-100 scale)
- **Improvement** (Optional): Enhances low-scoring questions

### Question Types
- **Multiple Choice**: 4 options with smart distractors
- **True/False**: Binary choice
- **Fill-in-Blank**: Short answer text input
- **Matching**: Pair items from two columns

### Security Features
- Email verification for teachers
- Quiz code validation
- Randomized questions per student
- One-time quiz access per student
- Timer enforcement
- Bcrypt password encryption

## FAQ

**How long does it take to create a quiz?**  
2-3 minutes total (45-60 seconds for AI processing)

**Can I edit questions after generation?**  
No, but you can regenerate with different settings

**What content sources are supported?**  
PDF, Word (.docx), PowerPoint (.pptx), YouTube videos, web pages, plain text

**Can quizzes be scheduled?**  
Yes, set start/expiration dates and maximum participants

**Are questions randomized?**  
Yes, each student gets different questions from the pool with shuffled options

**What happens if a student's internet disconnects?**  
Progress may be lost; quiz is saved when submitted or timer expires

## Planned Features
- Question editing interface
- Reusable question bank
- Multi-language support (Spanish, French, etc.)
- LMS integration (Canvas, Moodle, Google Classroom)
- Adaptive difficulty based on performance
- Mobile app for iOS/Android
- Bulk student import from CSV

## License & Support

For issues, questions, or contributions, please check the [documentation](docs/) or contact the development team.
