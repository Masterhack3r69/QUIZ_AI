# Technology Stack

## Core Framework
- Next.js 16.0.1 (App Router) - Frontend
- React 19.2.0 with React Compiler enabled
- TypeScript 5.x with strict mode

## Backend
- Node.js with Express - API server
- MongoDB - Database
- Mongoose ORM - Database modeling

## AI/ML
- NLP/LLM integration for text summarization and question generation
- Content extraction from PDF, DOCX, PPT files

## Styling
- Tailwind CSS v4
- PostCSS for CSS processing

## Build System
- Next.js built-in bundler
- pnpm for package management

## Code Quality
- ESLint with Next.js config
- TypeScript strict mode enabled

## Authentication
- Basic login system for teachers
- Quiz-code based access for students (no login required)

## Common Commands

Development:
```bash
pnpm dev
```

Build for production:
```bash
pnpm build
```

Start production server:
```bash
pnpm start
```

Lint code:
```bash
pnpm lint
```

## Configuration Notes
- React Compiler is enabled in next.config.ts
- Path alias `@/*` maps to the frontend root directory
- Target ES2017 for TypeScript compilation
