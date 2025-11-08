# Design Document

## Overview

This design document outlines the comprehensive frontend redesign of the Quiz AI Application using shadcn/ui components. The redesign focuses on creating a modern, accessible, and performant user interface that leverages the latest shadcn/ui component library built on Radix UI primitives and Tailwind CSS v4.

### Design Goals

1. **Modern Aesthetics**: Implement a clean, professional design with contemporary UI patterns
2. **Consistency**: Establish a unified design system across all pages and components
3. **Accessibility**: Ensure WCAG 2.1 AA compliance with full keyboard navigation and screen reader support
4. **Performance**: Optimize for fast load times and smooth interactions
5. **Responsiveness**: Provide seamless experiences across mobile, tablet, and desktop devices
6. **Maintainability**: Use standardized shadcn/ui components to reduce custom code and improve long-term maintenance

### Technology Stack

- **UI Framework**: shadcn/ui (latest version)
- **Component Primitives**: Radix UI
- **Styling**: Tailwind CSS v4
- **Framework**: Next.js 16.0.1 with App Router
- **Type Safety**: TypeScript 5.x with strict mode
- **State Management**: React Context API for auth and toast notifications
- **Form Handling**: React Hook Form with Zod validation (via shadcn/ui form components)

## Architecture

### Component Architecture

The application follows a layered component architecture:

```
frontend/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   └── register/
│   ├── (public)/                 # Public route group
│   │   ├── page.tsx              # Landing page
│   │   └── join/
│   ├── dashboard/                # Protected teacher routes
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── create/
│   │   ├── quiz/[quizId]/
│   │   └── settings/
│   └── quiz/[code]/              # Student quiz routes
│       ├── start/
│       ├── take/
│       └── results/
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── site-header.tsx
│   │   ├── dashboard-nav.tsx
│   │   └── mobile-nav.tsx
│   ├── quiz/                     # Quiz-specific components
│   │   ├── question-card.tsx
│   │   ├── timer.tsx
│   │   └── wizard-steps.tsx
│   └── shared/                   # Shared business components
│       ├── quiz-card.tsx
│       └── analytics-chart.tsx
├── lib/
│   ├── utils.ts                  # cn() utility and helpers
│   └── validations.ts            # Zod schemas
└── styles/
    └── globals.css               # Global styles and CSS variables
```


### Design System Architecture

The design system is built on three foundational layers:

1. **Design Tokens Layer**: CSS variables defining colors, spacing, typography, and other design primitives
2. **Component Layer**: shadcn/ui components providing consistent, accessible UI elements
3. **Pattern Layer**: Composed components and page templates implementing common UI patterns

### Route Architecture

The application uses Next.js App Router with route groups for organization:

- **(auth)**: Authentication pages with centered card layouts
- **(public)**: Public-facing pages with full-width layouts
- **dashboard**: Protected teacher area with sidebar navigation
- **quiz/[code]**: Dynamic student quiz routes with minimal navigation

## Components and Interfaces

### Core shadcn/ui Components

The following shadcn/ui components will be installed and configured:

#### Form Components
- **button**: Primary interaction element with variants (default, destructive, outline, ghost, link)
- **input**: Text input with label integration and error states
- **textarea**: Multi-line text input for longer content
- **select**: Dropdown selection with search capability
- **checkbox**: Boolean selection with indeterminate state
- **radio-group**: Single selection from multiple options
- **switch**: Toggle for binary settings
- **slider**: Numeric input with visual range
- **form**: Form wrapper with validation and error handling
- **label**: Accessible form labels

#### Layout Components
- **card**: Container with header, content, and footer sections
- **separator**: Visual divider between content sections
- **tabs**: Tabbed interface for organizing related content
- **dialog**: Modal overlay for focused interactions
- **sheet**: Slide-out panel for mobile navigation
- **navigation-menu**: Hierarchical navigation structure
- **breadcrumb**: Path indicator for nested pages

#### Feedback Components
- **alert**: Informational messages with severity levels
- **alert-dialog**: Confirmation dialogs for critical actions
- **toast**: Temporary notifications for action feedback
- **progress**: Visual indicator for loading or completion
- **skeleton**: Loading placeholder matching content structure
- **badge**: Status indicators and labels
- **tooltip**: Contextual help on hover/focus

#### Data Display Components
- **table**: Structured data display with sorting and pagination
- **avatar**: User profile images with fallback
- **dropdown-menu**: Contextual action menus


### Custom Components

These specialized components will be preserved or created:

#### Preserved Components
- **LoadingSpinner**: Animated spinner for loading states
- **ProgressBar**: Custom progress visualization for quiz completion
- **SkeletonLoader**: Enhanced skeleton patterns for complex layouts
- **Icon**: SVG icon wrapper with size and color variants
- **OptimizedImage**: Next.js Image wrapper with default optimizations

#### New Custom Components
- **Timer**: Countdown timer for quiz interface with auto-submit
- **QuizCard**: Dashboard card displaying quiz information
- **QuestionCard**: Quiz question display with answer options
- **WizardSteps**: Multi-step form progress indicator
- **AnalyticsChart**: Data visualization for quiz analytics
- **FileUpload**: Drag-and-drop file upload with preview
- **QuizCodeDisplay**: Large, copyable quiz code component

### Component Interfaces

#### Button Component (shadcn/ui)
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
  loading?: boolean
}
```

#### Card Component (shadcn/ui)
```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
```

#### Form Component (shadcn/ui with React Hook Form)
```typescript
interface FormFieldProps {
  control: Control<any>
  name: string
  render: (field: ControllerRenderProps) => React.ReactElement
}

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}
interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}
interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {}
interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}
```

#### Timer Component (Custom)
```typescript
interface TimerProps {
  duration: number // seconds
  onExpire: () => void
  autoSubmit?: boolean
  showWarning?: boolean
  warningThreshold?: number // seconds
}
```

#### QuizCard Component (Custom)
```typescript
interface QuizCardProps {
  quiz: {
    id: string
    title: string
    status: 'active' | 'expired' | 'draft'
    submissionCount: number
    createdAt: Date
    expiresAt: Date
  }
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onShare: (id: string) => void
}
```

#### QuestionCard Component (Custom)
```typescript
interface QuestionCardProps {
  question: {
    id: string
    text: string
    options: string[]
    correctAnswer?: number
    studentAnswer?: number
  }
  mode: 'take' | 'review' | 'edit'
  onAnswer?: (answer: number) => void
  onEdit?: (question: Question) => void
  showCorrectAnswer?: boolean
}
```


## Data Models

### Design Tokens

The design system uses CSS variables for theming:

```css
:root {
  /* Colors */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
  
  /* Typography */
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 48%;
}
```

### Typography Scale

```typescript
const typography = {
  h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
  h2: 'scroll-m-20 text-3xl font-semibold tracking-tight',
  h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
  h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
  p: 'leading-7 [&:not(:first-child)]:mt-6',
  lead: 'text-xl text-muted-foreground',
  large: 'text-lg font-semibold',
  small: 'text-sm font-medium leading-none',
  muted: 'text-sm text-muted-foreground',
}
```

### Spacing System

Tailwind CSS v4 spacing scale (based on 0.25rem = 4px):
- 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96

### Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large desktop
}
```

### Form Validation Schemas

Using Zod for type-safe validation:

```typescript
// Login Form
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// Registration Form
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Quiz Join Form
const joinQuizSchema = z.object({
  quizCode: z.string()
    .length(6, 'Quiz code must be 6 characters')
    .regex(/^[A-Z0-9]+$/, 'Quiz code must contain only uppercase letters and numbers'),
  studentName: z.string().min(2, 'Name must be at least 2 characters'),
  studentId: z.string().optional(),
  school: z.string().min(2, 'School name is required'),
})

// Quiz Configuration Form
const quizConfigSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  duration: z.number().min(5, 'Duration must be at least 5 minutes').max(180, 'Duration cannot exceed 180 minutes'),
  expiresAt: z.date().min(new Date(), 'Expiration date must be in the future'),
  questionCount: z.number().min(5, 'Must have at least 5 questions').max(50, 'Cannot exceed 50 questions'),
  showCorrectAnswers: z.boolean().default(false),
})
```


## Page Designs

### Landing Page (/)

**Layout**: Full-width public layout with header and footer

**Sections**:
1. **Hero Section**
   - Gradient background (blue-600 to indigo-700)
   - Large heading with value proposition
   - Two prominent CTAs (Teacher Login, Student Join)
   - Responsive: Stack CTAs vertically on mobile

2. **Features Section**
   - Three-column grid (stacks on mobile)
   - shadcn/ui Card components for each feature
   - Icons, headings, and bullet points
   - Hover effects for interactivity

3. **CTA Section**
   - Gray background for visual separation
   - Centered content with secondary CTAs
   - Responsive button layout

**Components Used**: Button, Card

### Authentication Pages (/login, /register)

**Layout**: Centered card on gradient background

**Login Page**:
- shadcn/ui Card with header, content, footer
- Form with email and password inputs
- "Remember me" checkbox
- Submit button with loading state
- Link to registration page
- Error alerts for failed authentication

**Registration Page**:
- Similar layout to login
- Additional fields: name, confirm password
- Real-time password strength indicator
- Terms of service checkbox
- Success toast on registration

**Components Used**: Card, Form, Input, Label, Button, Checkbox, Alert, Toast

### Student Join Page (/join)

**Layout**: Centered card with focus on quiz code entry

**Design**:
- Large, prominent quiz code input (uppercase, 6 characters)
- Student information fields (name, ID, school)
- Clear validation messages
- Submit button with loading state
- Error handling for invalid/expired codes

**Components Used**: Card, Form, Input, Label, Button, Alert

### Quiz Lobby (/quiz/[code]/start)

**Layout**: Centered card with quiz information

**Design**:
- Quiz title and description
- Key information badges (time limit, question count)
- Instructions list
- Large "Start Quiz" button
- Warning alert if quiz not yet active

**Components Used**: Card, Badge, Button, Alert, Separator

### Quiz Taking Interface (/quiz/[code]/take)

**Layout**: Full-screen with fixed header

**Design**:
- **Header**: Timer (left), Progress indicator (center), Question number (right)
- **Main Content**: 
  - Question card with large, readable text
  - Radio group for answer options
  - Large touch targets for mobile
- **Footer**: Previous and Next/Submit buttons
- **Auto-submit Dialog**: Alert dialog when time expires

**Components Used**: Card, RadioGroup, Button, Progress, AlertDialog

### Quiz Results (/quiz/[code]/results)

**Layout**: Centered card with results display

**Design**:
- Large score display with celebratory styling
- Progress bar showing correct/incorrect ratio
- Accordion for question review (if enabled)
- Encouraging message based on score
- Exit button

**Components Used**: Card, Progress, Accordion, Badge, Button


### Teacher Dashboard (/dashboard)

**Layout**: Sidebar navigation with main content area

**Design**:
- **Sidebar** (Desktop): 
  - Logo and user profile
  - Navigation menu with icons
  - Theme toggle
  - Logout button
- **Mobile Navigation**: 
  - Hamburger menu opening Sheet component
  - Same navigation items
- **Main Content**:
  - Page header with title and "Create Quiz" button
  - Quiz grid (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
  - Each quiz as a Card with:
    - Title and status badge
    - Submission count
    - Dropdown menu for actions (View, Edit, Share, Delete)
  - Empty state when no quizzes exist
  - Loading skeletons during data fetch

**Components Used**: NavigationMenu, Sheet, Card, Badge, Button, DropdownMenu, Skeleton, AlertDialog (for delete confirmation)

### Quiz Creation Wizard (/dashboard/create)

**Layout**: Full-width with step indicator

**Design**:
- **Step Indicator**: Tabs component showing 4 steps
- **Step 1 - Upload**:
  - File upload area with drag-and-drop
  - File type badges
  - Upload progress bar
  - Alternative: Text input or URL input
- **Step 2 - Processing**:
  - Loading state with progress indicator
  - Status messages
  - Skeleton loaders for questions being generated
- **Step 3 - Configure**:
  - Form with quiz settings
  - Date/time picker for expiration
  - Number inputs with validation
  - Toggle for showing correct answers
- **Step 4 - Review**:
  - List of generated questions
  - Edit button opening Dialog for each question
  - Delete button with confirmation
  - Final submit button

**Navigation**: Next/Previous buttons, validation before progression

**Components Used**: Tabs, Card, Form, Input, Textarea, Select, Button, Progress, Dialog, Badge, Alert

### Quiz Management (/dashboard/quiz/[quizId])

**Layout**: Standard dashboard layout with sidebar

**Design**:
- **Quiz Code Section**:
  - Large, prominent display of quiz code
  - Copy button with toast feedback
  - QR code (optional)
- **Quiz Details Card**:
  - Title, status, dates
  - Edit button opening inline form or dialog
- **Quick Stats Cards**:
  - Total submissions
  - Average score
  - Completion rate
- **Actions**:
  - View Results button (primary)
  - Edit Settings button
  - Delete Quiz button (destructive)

**Components Used**: Card, Button, Badge, Toast, Dialog, AlertDialog

### Quiz Analytics (/dashboard/quiz/[quizId]/results)

**Layout**: Standard dashboard layout with sidebar

**Design**:
- **Summary Cards** (4-column grid, responsive):
  - Class average
  - Highest score
  - Lowest score
  - Total submissions
- **Submissions Table**:
  - Sortable columns
  - Responsive: Converts to cards on mobile
  - Pagination if many submissions
- **Question Analytics**:
  - List of questions with accuracy rates
  - Progress bars for visual representation
  - Badge highlighting most missed questions
- **Export Section**:
  - Dropdown menu with PDF and Excel options
  - Loading state during export

**Components Used**: Card, Table, Badge, Progress, Button, DropdownMenu, Skeleton

### Settings Page (/dashboard/settings)

**Layout**: Standard dashboard layout with sidebar

**Design**:
- **Profile Section**:
  - Avatar with upload capability
  - Name and email fields
  - Save button
- **Security Section**:
  - Change password form
  - Current password, new password, confirm password
- **Preferences Section**:
  - Theme toggle (light/dark/system)
  - Notification preferences
- **Danger Zone**:
  - Delete account button with confirmation

**Components Used**: Card, Form, Input, Button, Avatar, Switch, AlertDialog, Separator


## Error Handling

### Error Handling Strategy

1. **Form Validation Errors**
   - Display inline below each field using shadcn/ui Form error messages
   - Show field-level errors immediately on blur
   - Show form-level errors on submit attempt
   - Use red color with sufficient contrast (destructive variant)

2. **API Errors**
   - Display toast notifications for transient errors
   - Show Alert components for persistent errors
   - Provide retry buttons where appropriate
   - Log errors to console for debugging

3. **Network Errors**
   - Show AlertDialog for critical network failures
   - Provide offline indicator in header
   - Queue actions for retry when connection restored
   - Display user-friendly messages (avoid technical jargon)

4. **Authentication Errors**
   - Redirect to login page with return URL
   - Show Alert on login page explaining session expiration
   - Clear sensitive data from state
   - Provide clear re-authentication flow

5. **Not Found Errors**
   - Custom 404 page with navigation options
   - Breadcrumb trail showing where user is
   - Search functionality or sitemap
   - Link back to dashboard or home

6. **Permission Errors**
   - Show 403 page with explanation
   - Provide link to request access
   - Clear indication of required permissions
   - Contact information for support

### Error Component Patterns

```typescript
// Form Field Error
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage /> {/* Displays validation error */}
    </FormItem>
  )}
/>

// API Error Alert
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Failed to load quiz data. Please try again.
  </AlertDescription>
</Alert>

// Network Error Dialog
<AlertDialog open={networkError}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Connection Lost</AlertDialogTitle>
      <AlertDialogDescription>
        Unable to connect to the server. Please check your internet connection.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogAction onClick={retry}>Retry</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

// Success Toast
toast({
  title: "Quiz created successfully",
  description: "Your quiz code is ABC123",
})

// Error Toast
toast({
  variant: "destructive",
  title: "Uh oh! Something went wrong.",
  description: "There was a problem with your request.",
})
```


## Testing Strategy

### Component Testing

**Unit Tests**:
- Test individual shadcn/ui component integrations
- Verify custom component logic (Timer, QuizCard, etc.)
- Test utility functions (cn(), validation helpers)
- Mock external dependencies

**Integration Tests**:
- Test form submission flows
- Verify navigation between pages
- Test authentication flows
- Verify data fetching and display

**Tools**:
- Jest for test runner
- React Testing Library for component testing
- MSW (Mock Service Worker) for API mocking

### Visual Testing

**Approach**:
- Manual testing across breakpoints (320px, 768px, 1024px, 1920px)
- Browser testing (Chrome, Firefox, Safari, Edge)
- Device testing (iOS Safari, Android Chrome)
- Dark mode verification

**Checklist**:
- Layout integrity at all breakpoints
- Typography readability
- Color contrast ratios
- Interactive state visibility (hover, focus, active)
- Animation smoothness
- Loading state appearance

### Accessibility Testing

**Automated Testing**:
- axe-core for automated accessibility checks
- Lighthouse accessibility audit
- WAVE browser extension

**Manual Testing**:
- Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Focus indicator visibility
- ARIA attribute correctness
- Color contrast verification

**Checklist**:
- All interactive elements keyboard accessible
- Proper heading hierarchy (h1 → h2 → h3)
- Form labels associated with inputs
- Error messages announced to screen readers
- Skip navigation link functional
- No keyboard traps

### Performance Testing

**Metrics**:
- Largest Contentful Paint (LCP) < 2.5s
- First Input Delay (FID) < 100ms
- Cumulative Layout Shift (CLS) < 0.1
- Time to Interactive (TTI) < 3.5s

**Tools**:
- Lighthouse performance audit
- Chrome DevTools Performance panel
- WebPageTest for real-world testing
- Next.js built-in analytics

**Optimization Strategies**:
- Code splitting by route
- Lazy loading below-the-fold content
- Image optimization with Next.js Image
- Font optimization with next/font
- Minimize JavaScript bundle size

### User Acceptance Testing

**Scenarios**:
1. Teacher creates quiz from PDF upload
2. Teacher shares quiz code with students
3. Student joins quiz and completes it
4. Teacher views analytics and exports results
5. User switches between light and dark mode
6. User navigates with keyboard only
7. User accesses site on mobile device

**Success Criteria**:
- All user flows complete without errors
- UI is intuitive and requires no explanation
- Performance feels fast and responsive
- No accessibility barriers encountered
- Visual design is consistent and professional


## Implementation Details

### shadcn/ui Installation and Configuration

**Step 1: Install Dependencies**
```bash
pnpm add class-variance-authority clsx tailwind-merge
pnpm add @radix-ui/react-slot
pnpm add -D @types/node
```

**Step 2: Initialize shadcn/ui**
```bash
npx shadcn@latest init
```

Configuration options:
- Style: Default
- Base color: Slate
- CSS variables: Yes
- Tailwind CSS v4: Yes
- React Server Components: Yes
- Path aliases: @/* (already configured)

**Step 3: Create lib/utils.ts**
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Step 4: Update globals.css**
```css
@import "tailwindcss";

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ... other CSS variables ... */
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... other CSS variables ... */
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Component Installation Order

Install components in dependency order:

**Phase 1: Foundation**
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
```

**Phase 2: Forms**
```bash
npx shadcn@latest add form
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add switch
```

**Phase 3: Navigation**
```bash
npx shadcn@latest add navigation-menu
npx shadcn@latest add sheet
npx shadcn@latest add breadcrumb
npx shadcn@latest add separator
npx shadcn@latest add tabs
```

**Phase 4: Feedback**
```bash
npx shadcn@latest add alert
npx shadcn@latest add alert-dialog
npx shadcn@latest add toast
npx shadcn@latest add progress
npx shadcn@latest add skeleton
```

**Phase 5: Data Display**
```bash
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add tooltip
npx shadcn@latest add dropdown-menu
npx shadcn@latest add dialog
```

### Legacy Component Migration

**Components to Remove**:
1. `components/ui/Button.tsx` → Use shadcn/ui button
2. `components/ui/Card.tsx` → Use shadcn/ui card
3. `components/ui/Input.tsx` → Use shadcn/ui input
4. `components/ui/Modal.tsx` → Use shadcn/ui dialog
5. `components/ui/Select.tsx` → Use shadcn/ui select
6. `components/ui/Tabs.tsx` → Use shadcn/ui tabs
7. `components/ui/Toast.tsx` → Use shadcn/ui toast

**Migration Process**:
1. Install shadcn/ui equivalent
2. Update imports in consuming components
3. Adjust props to match shadcn/ui API
4. Test functionality
5. Delete legacy component

**Example Migration**:
```typescript
// Before (legacy)
import { Button } from '@/components/ui/Button'
<Button variant="primary" onClick={handleClick}>Click me</Button>

// After (shadcn/ui)
import { Button } from '@/components/ui/button'
<Button variant="default" onClick={handleClick}>Click me</Button>
```

### Dark Mode Implementation

**Step 1: Install next-themes**
```bash
pnpm add next-themes
```

**Step 2: Create ThemeProvider**
```typescript
// components/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

**Step 3: Wrap app in ThemeProvider**
```typescript
// app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Step 4: Create Theme Toggle**
```typescript
// components/theme-toggle.tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

### Responsive Design Patterns

**Mobile-First Approach**:
```typescript
// Base styles for mobile, then add breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

**Responsive Navigation**:
```typescript
// Desktop: Sidebar
// Mobile: Sheet (slide-out)
<div className="hidden lg:block">
  <Sidebar />
</div>
<div className="lg:hidden">
  <MobileNav />
</div>
```

**Responsive Tables**:
```typescript
// Desktop: Table
// Mobile: Cards
<div className="hidden md:block">
  <Table>
    {/* Table content */}
  </Table>
</div>
<div className="md:hidden space-y-4">
  {data.map(item => (
    <Card key={item.id}>
      {/* Card content */}
    </Card>
  ))}
</div>
```

### Performance Optimization

**Code Splitting**:
```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic'

const AnalyticsChart = dynamic(() => import('@/components/analytics-chart'), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false
})
```

**Image Optimization**:
```typescript
import Image from 'next/image'

<Image
  src="/hero-image.jpg"
  alt="Description"
  width={1200}
  height={600}
  priority // For above-the-fold images
  placeholder="blur"
/>
```

**Font Optimization**:
```typescript
// Already configured in layout.tsx
import { Geist, Geist_Mono } from "next/font/google"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // Prevent FOIT
})
```

### Accessibility Implementation

**Focus Management**:
```typescript
// Trap focus in dialogs
<Dialog>
  <DialogContent>
    {/* Focus automatically managed by Radix UI */}
  </DialogContent>
</Dialog>

// Restore focus after modal close
const buttonRef = useRef<HTMLButtonElement>(null)
const handleClose = () => {
  setOpen(false)
  buttonRef.current?.focus()
}
```

**Keyboard Navigation**:
```typescript
// All shadcn/ui components have built-in keyboard support
// Custom components should follow ARIA patterns
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  Custom Button
</div>
```

**Screen Reader Support**:
```typescript
// Use semantic HTML
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
  </ul>
</nav>

// Provide context for icons
<Button>
  <Trash className="h-4 w-4" />
  <span className="sr-only">Delete quiz</span>
</Button>

// Announce dynamic content
<div role="status" aria-live="polite">
  {message}
</div>
```

## Conclusion

This design provides a comprehensive blueprint for redesigning the Quiz AI Application frontend with shadcn/ui. The implementation will result in a modern, accessible, and performant user interface that maintains consistency across all pages while providing an excellent user experience for both teachers and students.

The design leverages industry-standard components and patterns, ensuring long-term maintainability and ease of future enhancements. By following this design document, developers can systematically implement each page and component with confidence that they align with the overall vision and requirements.
