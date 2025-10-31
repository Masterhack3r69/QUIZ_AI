# Project Structure

## Root Organization

```
/
├── frontend/          # Next.js application (UI)
├── backend/           # Node.js + Express API server (planned)
└── .kiro/            # Kiro configuration and steering
```

## Frontend Structure

```
frontend/
├── app/              # Next.js App Router pages and layouts
│   ├── layout.tsx    # Root layout component
│   ├── page.tsx      # Home page
│   ├── globals.css   # Global styles
│   └── favicon.ico   # Site favicon
├── public/           # Static assets
├── node_modules/     # Dependencies
├── .next/            # Next.js build output (generated)
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
├── next.config.ts    # Next.js configuration
├── eslint.config.mjs # ESLint configuration
└── postcss.config.mjs # PostCSS configuration
```

## Key Conventions

- Use App Router (not Pages Router) for all routing
- Place page components in `app/` directory following Next.js conventions
- Use TypeScript for all new files (.ts, .tsx)
- Import paths can use `@/*` alias to reference frontend root
- Global styles in `app/globals.css`
- Static assets go in `public/` directory

## Application Architecture

### Frontend Pages (Planned)

- Teacher dashboard: Upload materials, create quizzes, view analytics
- Quiz configuration: Set title, timer, expiration, question count
- Student portal: Enter quiz code and school info
- Quiz interface: Randomized questions with countdown timer
- Results display: Scores and feedback

### Backend API (Planned)

- Authentication endpoints for teachers
- Quiz CRUD operations
- File upload and content extraction (PDF, DOCX, PPT)
- AI integration for question generation
- Quiz code validation
- Student submission and auto-grading
- Analytics and reporting

### Database Schema (Planned)

- Users (teachers)
- Quizzes (metadata, settings, access codes)
- Questions (generated from AI)
- Submissions (student answers and scores)
- Analytics (performance metrics)
