# Implementation Plan

- [x] 1. Setup shadcn/ui foundation and install core dependencies






  - Install required packages: class-variance-authority, clsx, tailwind-merge, @radix-ui/react-slot
  - Initialize shadcn/ui with proper configuration for Tailwind CSS v4 and Next.js 16
  - Create lib/utils.ts with cn() utility function for class merging
  - Update globals.css with CSS variables for light and dark themes
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 2. Install Phase 1 shadcn/ui components (Foundation)





  - Install button, card, input, and label components via shadcn/ui CLI
  - Verify components are properly typed and compatible with React 19.2.0
  - Test basic rendering of each component
  - _Requirements: 3.1, 3.6_

- [x] 3. Install Phase 2 shadcn/ui components (Forms)





  - Install form, select, textarea, checkbox, radio-group, and switch components
  - Configure React Hook Form integration with form component
  - _Requirements: 3.2, 3.6_

- [x] 4. Install Phase 3 shadcn/ui components (Navigation)





  - Install navigation-menu, sheet, breadcrumb, separator, and tabs components
  - _Requirements: 3.3, 3.6_

- [x] 5. Install Phase 4 shadcn/ui components (Feedback)





  - Install alert, alert-dialog, toast, progress, and skeleton components
  - Configure toast provider in root layout
  - _Requirements: 3.4, 3.6_

- [x] 6. Install Phase 5 shadcn/ui components (Data Display)





  - Install table, badge, avatar, tooltip, dropdown-menu, and dialog components
  - _Requirements: 3.5, 3.6_

- [x] 7. Implement dark mode support





  - Install next-themes package
  - Create ThemeProvider component wrapping NextThemesProvider
  - Update root layout to include ThemeProvider with system default
  - Create ThemeToggle component with sun/moon icons
  - Test theme switching and persistence
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [x] 8. Create form validation schemas





  - Create lib/validations.ts file
  - Implement Zod schemas for login, registration, quiz join, and quiz configuration forms
  - Export typed form data interfaces
  - _Requirements: 19.1, 19.2, 19.5_

- [x] 9. Remove legacy UI components





  - Delete Button.tsx, Card.tsx, Input.tsx, Modal.tsx, Select.tsx, Tabs.tsx, and Toast.tsx from components/ui
  - Update components/ui/index.ts to remove deleted component exports
  - Clean up unused styles from globals.css while preserving accessibility utilities
  - _Requirements: 2.1, 2.2, 2.3, 2.4_


- [x] 10. Redesign landing page (/)





  - Update app/page.tsx with new hero section using gradient background
  - Implement features section with three shadcn/ui Card components in responsive grid
  - Add CTA section with secondary call-to-action buttons
  - Update button imports to use shadcn/ui button component
  - Ensure responsive layout for mobile, tablet, and desktop
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 11. Redesign authentication pages





- [x] 11.1 Create login page with shadcn/ui components


  - Create or update app/(auth)/login/page.tsx
  - Implement centered Card layout with Form component
  - Add email and password Input fields with Label components
  - Integrate loginSchema validation from lib/validations.ts
  - Add loading state to submit Button and error Alert display
  - Include link to registration page
  - _Requirements: 5.1, 5.2, 5.5_



- [x] 11.2 Create registration page with validation
  - Create or update app/(auth)/register/page.tsx
  - Implement Form with name, email, password, and confirm password fields
  - Integrate registerSchema with real-time validation feedback
  - Add password strength indicator
  - Display success Toast on registration
  - Include terms of service Checkbox
  - _Requirements: 5.3, 5.4, 5.5_

- [x] 12. Redesign student join page (/join)





  - Update app/join/page.tsx with centered Card layout
  - Create large, prominent quiz code Input with uppercase transformation
  - Add student information fields (name, ID, school) with Label components
  - Integrate joinQuizSchema validation
  - Implement error Alert for invalid/expired quiz codes
  - Add loading state to submit Button
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 13. Redesign quiz lobby page (/quiz/[code]/start)





  - Update app/quiz/[code]/start/page.tsx with centered Card
  - Display quiz title, description, and instructions
  - Add Badge components for time limit and question count
  - Implement large "Start Quiz" Button with loading state
  - Show Alert when quiz is not yet active
  - Add Separator between sections
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 14. Redesign quiz taking interface (/quiz/[code]/take)





  - Update app/quiz/[code]/take/page.tsx with full-screen layout
  - Create fixed header with Timer, Progress indicator, and question number
  - Implement question Card with RadioGroup for answer options
  - Add Previous and Next/Submit Button components in footer
  - Create AlertDialog for auto-submit when time expires
  - Ensure large touch targets for mobile devices
  - Implement prevention of accidental navigation
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [x] 15. Redesign quiz results page (/quiz/[code]/results)





  - Update app/quiz/[code]/results/page.tsx with centered Card
  - Display large score with celebratory styling
  - Add Progress bar showing correct/incorrect ratio
  - Implement Accordion for question review (if enabled)
  - Show encouraging message based on score with Badge components
  - Add exit Button
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 16. Create dashboard layout components




- [x] 16.1 Create desktop sidebar navigation


  - Create components/layout/dashboard-sidebar.tsx
  - Implement NavigationMenu with logo, user profile, and nav links
  - Add ThemeToggle component
  - Include logout button
  - _Requirements: 7.1, 7.2_

- [x] 16.2 Create mobile navigation


  - Create components/layout/mobile-nav.tsx
  - Implement hamburger menu button
  - Use Sheet component for slide-out navigation
  - Include same navigation items as desktop sidebar
  - _Requirements: 7.1, 14.4_

- [x] 16.3 Create dashboard layout wrapper


  - Create or update app/dashboard/layout.tsx
  - Integrate desktop sidebar and mobile navigation
  - Implement responsive layout switching at lg breakpoint
  - Add ProtectedRoute wrapper for authentication
  - _Requirements: 7.1, 14.1_

- [x] 17. Redesign teacher dashboard home (/dashboard)





  - Update app/dashboard/page.tsx with dashboard layout
  - Add page header with title and "Create Quiz" Button
  - Implement quiz grid with responsive columns (1/2/3 cols)
  - Create QuizCard component using shadcn/ui Card with title, Badge, and DropdownMenu
  - Add empty state message when no quizzes exist
  - Implement Skeleton loading states
  - Add AlertDialog for delete confirmation
  - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [x] 18. Redesign quiz creation wizard (/dashboard/create)





- [x] 18.1 Create wizard step indicator


  - Update app/dashboard/create/page.tsx
  - Implement Tabs component for 4-step wizard (Upload, Processing, Configure, Review)
  - Add step validation preventing progression with incomplete data
  - _Requirements: 8.1, 8.6_


- [x] 18.2 Implement upload step
  - Create file upload area with drag-and-drop support
  - Add file type validation and Badge display
  - Implement Progress component for upload status
  - Add alternative text input and URL input options
  - _Requirements: 8.2_


- [x] 18.3 Implement processing step
  - Display loading state with Progress indicator
  - Show status messages during AI processing
  - Use Skeleton components for questions being generated

  - _Requirements: 8.3_

- [x] 18.4 Implement configuration step
  - Create Form with quiz settings fields
  - Add Input for title, Select for timer, date picker for expiration
  - Implement number input for question count with validation
  - Add Switch for showing correct answers option

  - Integrate quizConfigSchema validation
  - _Requirements: 8.4_

- [x] 18.5 Implement review step
  - Display list of generated questions in Card components
  - Add edit Button opening Dialog for each question
  - Implement delete button with confirmation
  - Add final submit Button
  - _Requirements: 8.5_

- [x] 19. Redesign quiz management page (/dashboard/quiz/[quizId])





  - Update app/dashboard/quiz/[quizId]/page.tsx
  - Create quiz code display Card with large, prominent code
  - Add copy Button with Toast feedback on click
  - Display quiz details Card with title, status Badge, and dates
  - Create quick stats Cards for submissions, average score, completion rate
  - Add action Buttons: View Results (primary), Edit Settings, Delete Quiz (destructive)
  - Implement Dialog for edit settings and AlertDialog for delete confirmation
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 20. Redesign quiz analytics page (/dashboard/quiz/[quizId]/results)





  - Update app/dashboard/quiz/[quizId]/results/page.tsx
  - Create summary Cards grid (4 columns, responsive) for class average, highest, lowest, total submissions
  - Implement submissions Table with sortable columns
  - Add responsive table-to-cards transformation for mobile
  - Create question analytics section with Progress bars for accuracy rates
  - Add Badge highlighting most missed questions
  - Implement export DropdownMenu with PDF and Excel options
  - Add Skeleton loading states
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 21. Create settings page (/dashboard/settings)





  - Create app/dashboard/settings/page.tsx
  - Implement profile section Card with Avatar upload and name/email fields
  - Create security section Card with change password Form
  - Add preferences section Card with theme Switch and notification settings
  - Implement danger zone with delete account Button and AlertDialog confirmation
  - Add Separator between sections
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 22. Update all component imports throughout the application





  - Search for all imports of legacy components (Button, Card, Input, Modal, Select, Tabs, Toast)
  - Replace with shadcn/ui component imports
  - Update prop names to match shadcn/ui API (e.g., variant="primary" → variant="default")
  - Test each updated component for functionality
  - _Requirements: 2.5_

- [x] 23. Implement responsive design patterns





  - Audit all pages for mobile responsiveness (320px to 1920px)
  - Ensure touch targets are at least 44x44 pixels on mobile
  - Verify grid layouts collapse appropriately at breakpoints
  - Test navigation patterns on mobile devices
  - Verify table-to-card transformations work correctly
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 24. Implement accessibility features
  - Verify keyboard navigation works on all interactive elements
  - Test focus indicators are visible on all components
  - Add ARIA labels where needed for screen reader support
  - Verify color contrast ratios meet WCAG 2.1 AA standards
  - Test with screen reader (NVDA, JAWS, or VoiceOver)
  - Ensure error messages are announced to screen readers
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 25. Implement loading and error states





  - Add Skeleton components for all data loading scenarios
  - Implement loading states on Button components during actions
  - Create error Alert components for API failures
  - Add AlertDialog for network errors with retry option
  - Implement empty states for lists and tables
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [x] 26. Implement animations and transitions
  - Verify shadcn/ui component animations are working
  - Add hover and active state transitions to buttons
  - Test Dialog and Sheet animations
  - Ensure prefers-reduced-motion is respected
  - Verify animations are performant (use transforms and opacity)
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 27. Optimize performance





  - Implement code splitting for heavy components using dynamic imports
  - Add loading Skeleton for dynamically imported components
  - Verify Next.js Image optimization is used for all images
  - Test font loading with next/font
  - Run Lighthouse audit and achieve LCP < 2.5s, FID < 100ms, CLS < 0.1
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

- [x] 28. Create custom components






  - Create components/quiz/timer.tsx with countdown functionality and auto-submit
  - Create components/shared/quiz-card.tsx for dashboard quiz display
  - Create components/quiz/question-card.tsx for quiz taking and review
  - Create components/quiz/wizard-steps.tsx for multi-step form indicator
  - Create components/shared/analytics-chart.tsx for data visualization
  - Create components/quiz/file-upload.tsx with drag-and-drop support
  - Create components/shared/quiz-code-display.tsx for large code display
  - _Requirements: 7.3, 8.1, 8.2, 9.1, 12.1, 12.2_

- [ ]* 29. Test complete user flows
  - Test teacher registration and login flow
  - Test quiz creation from upload to completion
  - Test student join and quiz taking flow
  - Test quiz results viewing and export
  - Test theme switching across all pages
  - Test keyboard-only navigation
  - Test on mobile devices (iOS and Android)
  - _Requirements: 4.5, 5.5, 6.5, 14.5, 15.5, 16.5_

- [ ]* 30. Final polish and cleanup
  - Remove any unused imports and components
  - Verify all console errors and warnings are resolved
  - Ensure consistent spacing and typography across all pages
  - Verify all links and navigation work correctly
  - Test all forms with various input scenarios
  - Verify all error states display correctly
  - _Requirements: 2.4, 14.5, 17.5, 19.5_
