# Implementation Plan

- [x] 1. Set up project foundation and shared utilities

  - Create TypeScript types file with all interfaces (User, Quiz, Question, Submission, Analytics)
  - Create API client utility with authentication headers and error handling
  - Create auth helper utilities for token management
  - Set up environment variables configuration
  - _Requirements: 1.1, 1.2, 1.3, 10.1, 10.2_

- [x] 2. Build core UI component library

  - Create Button component with variants (primary, secondary, danger, ghost) and loading states
  - Create Input component with label, error display, and validation states
  - Create Card component for consistent content containers
  - Create Modal component with overlay and close functionality
  - Create Toast notification component with auto-dismiss
  - _Requirements: 10.1, 10.2, 10.4, 10.5, 11.1, 11.2, 11.3, 11.4_

- [x] 3. Implement authentication system

  - Create AuthContext with login, register, logout functions and user state
  - Create protected route wrapper component for dashboard routes
  - Build login page with email/password form and validation
  - Build registration page with name, email, password fields
  - Implement JWT token storage in localStorage and automatic header injection
  - Add session expiration handling with redirect to login
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 10.4_

- [x] 4. Create landing page and public layout

  - Build landing page with hero section and two CTAs (Teacher Login, Student Join)
  - Create responsive navigation bar for public pages
  - Add route to login page from landing page
  - Add route to join page from landing page
  - _Requirements: 9.1, 9.2, 11.1, 11.2, 11.3, 11.4_

- [x] 5. Build teacher dashboard layout and navigation

  - Create dashboard layout component with sidebar/top navigation
  - Add navigation links (Dashboard Home, Create Quiz, Settings, Logout)
  - Implement active route highlighting in navigation
  - Create dashboard home page displaying quiz grid/list
  - Add "Create New Quiz" button prominently at top
  - Implement logout functionality with session clearing
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 6. Implement quiz list and quiz card components

  - Create QuizCard component displaying title, access code, status, submission count
  - Fetch and display all teacher's quizzes on dashboard home
  - Add loading state while fetching quizzes
  - Implement visual distinction between active and expired quizzes
  - Add click handler to navigate to quiz management page

  - Display empty state when no quizzes exist
  - _Requirements: 2.5, 9.1, 10.1, 12.3_

- [x] 7. Build quiz creation wizard - Step 1: File Upload

  - Create multi-step wizard layout with progress indicator
  - Build file upload interface with drag-and-drop support
  - Add file type validation (PDF, DOCX, PPT, TXT) before upload
  - Add file size validation (max 10MB) before upload
  - Display selected file name and size
  - Add text content input option as alternative to file upload
  - Implement "Next" button to proceed to AI processing
  - _Requirements: 2.1, 10.1, 10.3, 10.4_

- [x] 8. Build quiz creation wizard - Step 2: AI Processing

  - Display loading indicator during content extraction and AI generation
  - Call backend API to extract content and generate questions
  - Show progress message ("Extracting content...", "Generati5bn6ng questions...")
  - Handle API errors with user-friendly messages
  - Automatically proceed to configuration step when complete
  - _Requirements: 2.2, 10.1, 10.2_

- [x] 9. Build quiz creation wizard - Step 3: Configuration

  - Create form with fields for quiz title, duration (minutes), expiration date/time, questions per student
  - Add date/time picker for expiration field
  - Implement form validation for all required fields
  - Display inline error messages for invalid inputs
  - Add "Back" button to return to upload step
  - Add "Next" button to proceed to review step
  - _Requirements: 2.3, 10.4_

- [x] 10. Build quiz creation wizard - Step 4: Review and Save

  - Display quiz configuration summary (title, duration, expiration, question count)
  - Show preview of generated questions with options
  - Add "Edit" buttons to return to previous steps
  - Implement "Create Quiz" button to save quiz
  - Call backend API to create quiz with all data
  - Display generated access code prominently after creation
  - Show success message and option to copy access code
  - Add navigation to quiz management page or dashboard
  - _Requirements: 2.4, 2.5, 10.5_

- [x] 11. Build quiz management page

  - Fetch and display quiz details by ID
  - Display quiz title, access code, status, duration, expiration, question count
  - Create copy-to-clipboard button for access code with confirmation
  - Add "Edit Settings" button to open edit modal
  - Add "Delete Quiz" button with confirmation modal
  - Add "View Results" button to navigate to analytics page
  - Display quiz status badge (active/expired)
  - _Requirements: 2.6, 3.1, 3.2, 12.3_

- [x] 12. Implement quiz edit functionality

  - Create edit modal with form for title, duration, expiration date
  - Pre-populate form with current quiz values
  - Implement form validation
  - Call backend API to update quiz

  - Display success message on save
  - Refresh quiz details after update
  - _Requirements: 2.7, 10.4, 10.5_

- [x] 13. Implement quiz delete functionality

  - Create confirmation modal for delete action
  - Display warning message about permanent deletion
  - Call backend API to delete quiz
  - Display success message after deletion
  - Redirect to dashboard home after successful deletion
  - _Requirements: 2.8, 10.5_

- [x] 14. Build student join page

  - Create form with fields for student name, student ID, and quiz access code
  - Implement form validation for required fields
  - Add "Join Quiz" button to submit form
  - Call backend API to validate quiz code

  - Handle validation errors (invalid code, expired quiz)
  - Redirect to quiz lobby on successful validation
  - Store student info in sessionStorage for quiz session
  - _Requirements: 4.1, 4.2, 4.3, 10.4_

- [x] 15. Build quiz lobby page

  - Fetch quiz info using access code from URL parameter
  - Display quiz title, duration, and number of questions
  - Show quiz instructions and rules
  - Add "Start Quiz" button
  - Validate quiz is still active and not expired before allowing start
  - Call backend API to get randomized questions on start
  - Store quiz session data in sessionStorage
  - Navigate to quiz taking page on start
  - _Requirements: 4.4, 4.5, 5.1, 5.2_

- [x] 16. Build Timer component

  - Create countdown timer displaying MM:SS format
  - Update timer every second using setInterval
  - Change timer color when less than 5 minutes remaining
  - Persist timer state in sessionStorage to survive page refresh
  - Trigger auto-submission callback when timer reaches zero
  - Clean up interval on component unmount
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 17. Build QuestionCard component

  - Display question text and question number (e.g., "Question 1 of 10")
  - Render four answer options as selectable buttons/radio inputs
  - Highlight selected answer with visual feedback
  - Handle answer selection and update parent state
  - Support showing correct answer (for results page)
  - Ensure responsive layout for mobile devices
  - _Requirements: 5.3, 5.4, 11.1, 11.2, 11.3, 11.4_

- [x] 18. Build quiz taking interface

  - Display Timer component at top of page
  - Render current question using QuestionCard component
  - Add "Previous" and "Next" buttons for question navigation
  - Track all selected answers in component state
  - Display progress indicator (e.g., "Question 3 of 10")
  - Add "Submit Quiz" button (enabled only when all questions answered)
  - Implement browser navigation warning when quiz is active
  - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.2, 6.4_

- [x] 19. Implement quiz submission logic

  - Collect all answers with question IDs and selected options
  - Calculate time taken from quiz start to submission
  - Call backend API to submit quiz with student info and answers
  - Handle manual submission from "Submit Quiz" button
  - Handle automatic submission when timer expires
  - Display loading state during submission
  - Navigate to results page after successful submission
  - _Requirements: 6.5, 7.1, 7.2, 7.3, 10.1_

- [x] 20. Build quiz results page

  - Display student's score prominently (e.g., "8/10" or "80%")
  - Show completion message and time taken
  - Optionally display which questions were correct/incorrect
  - Add "Back to Home" button to return to join page
  - Prevent navigation back to quiz taking page
  - _Requirements: 7.4, 7.5_

- [x] 21. Build analytics dashboard - Summary statistics

  - Fetch quiz analytics from backend API
  - Display total submissions count
  - Calculate and display class average score

  - Display highest score achieved
  - Display lowest score achieved
  - Show statistics in card layout with icons
  - _Requirements: 8.1_

- [x] 22. Build analytics dashboard - Submissions table

  - Display table with columns: Student Name, Student ID, Score, Submission Time, Time Taken
  - Sort submissions by submission time (most recent first)
  - Implement responsive table layout (stack on mobile)
  - Add pagination if more than 20 submissions
  - Display empty state if no submissions yet
  - _Requirements: 8.2_

- [x] 23. Build analytics dashboard - Question statistics

  - Calculate accuracy rate for each question (correct answers / total attempts)
  - Display question statistics in table or card format
  - Show question text, accuracy rate, and attempt count
  - Highlight most missed questions (lowest accuracy) in red
  - Sort questions by accuracy rate (lowest first)
  - _Requirements: 8.3, 8.4_

- [x] 24. Implement analytics export functionality

  - Add "Export to PDF" button on analytics page
  - Add "Export to Excel" button on analytics page
  - Implement PDF generation with quiz title, statistics, and submissions table
  - Implement Excel generation with multiple sheets (summary, submissions, questions)
  - Trigger file download on export button click
  - Display loading state during export generation
  - _Requirements: 8.5, 10.1_

- [x] 25. Add comprehensive error handling

  - Implement global error boundary component
  - Add try-catch blocks around all API calls
  - Display Toast notifications for all errors
  - Handle 401 errors with automatic redirect to login
  - Handle 404 errors with "Not Found" message
  - Handle 500 errors with "Server Error" message
  - Handle network errors with "Connection Error" message
  - _Requirements: 10.1, 10.2_

- [x] 26. Implement loading states across application

  - Add loading spinners for all API requests
  - Display skeleton loaders for quiz lists and tables
  - Show progress indicators during file upload
  - Add loading state to all buttons during async operations
  - Disable form inputs during submission
  - _Requirements: 10.1_

- [x] 27. Ensure responsive design for all pages

  - Test all pages on mobile (< 640px), tablet (640-1024px), and desktop (> 1024px)
  - Adjust layouts using Tailwind responsive classes
  - Ensure navigation menu works on mobile (hamburger menu if needed)
  - Make tables responsive (horizontal scroll or stacked layout)
  - Test quiz taking interface on mobile devices
  - Ensure buttons and inputs are touch-friendly on mobile
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 28. Implement quiz status management

  - Add automatic status update check when quiz is accessed
  - Mark quiz as expired if current date > expiration date
  - Display expired status in quiz list and management page
  - Prevent students from accessing expired quizzes
  - Show appropriate error message for expired quiz access attempts
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 29. Add form validation across all forms

  - Implement email format validation on login/register
  - Add password strength validation (min 6 characters)
  - Validate required fields before form submission
  - Display inline error messages for invalid fields
  - Prevent form submission until all validations pass
  - Add visual indicators for valid/invalid fields
  - _Requirements: 10.4_

- [x] 30. Implement accessibility features

  - Add ARIA labels to all interactive elements
  - Ensure proper heading hierarchy (h1, h2, h3)
  - Add keyboard navigation support (Tab, Enter, Escape)
  - Ensure sufficient color contrast for text (WCAG AA)
  - Add focus indicators for all focusable elements
  - Test with screen reader for major user flows
  - Add alt text for any images or icons
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 31. Add account settings page

  - Create settings page layout
  - Display teacher profile information (name, email)
  - Add form to update name
  - Add form to change password
  - Implement update profile API call
  - Display success/error messages
  - _Requirements: 9.4_

- [x] 32. Add quiz session persistence

  - Store quiz session data in sessionStorage on quiz start
  - Restore quiz state on page refresh during active quiz
  - Restore timer state from sessionStorage
  - Restore selected answers from sessionStorage
  - Clear sessionStorage after quiz submission

  - _Requirements: 6.4_

- [ ]\* 33. Add copy-to-clipboard functionality

  - Implement clipboard API wrapper utility
  - Add copy button next to access code displays
  - Show success toast message after copying
  - Handle clipboard API errors gracefully
  - Add fallback for browsers without clipboard API
  - _Requirements: 3.2_

- [x] 34. Optimize performance


  - Enable React 19 compiler optimizations
  - Implement lazy loading for heavy components (analytics charts)
  - Add debouncing for search/filter inputs
  - Optimize images using Next.js Image component
  - Minimize bundle size by checking dependencies
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ]\* 35. Add final polish and testing
  - Test complete teacher flow end-to-end
  - Test complete student flow end-to-end
  - Test error scenarios (invalid codes, expired quizzes, network errors)
  - Test timer functionality and auto-submission
  - Test file upload with different file types
  - Verify responsive design on actual devices
  - Fix any remaining UI/UX issues
  - _Requirements: All_
