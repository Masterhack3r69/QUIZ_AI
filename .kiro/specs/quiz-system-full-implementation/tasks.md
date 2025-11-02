# Implementation Plan

- [x] 1. Set up project foundation and shared utilities





  - Create TypeScript types file with all interfaces (User, Quiz, Question types, Submission, Analytics, QuizTemplate)
  - Create API client utility with authentication headers and error handling
  - Create auth helper utilities for token management
  - Set up environment variables configuration
  - _Requirements: 1.1, 1.2, 1.3, 15.1, 15.2_

- [x] 2. Build core UI component library





  - Create Button component with variants (primary, secondary, danger, ghost) and loading states
  - Create Input component with label, error display, and validation states
  - Create Select component for dropdowns
  - Create Tabs component for tabbed interfaces
  - Create Card component for consistent content containers
  - Create Modal component with overlay and close functionality
  - Create Toast notification component with auto-dismiss
  - _Requirements: 15.1, 15.2, 15.4, 15.5, 16.1, 16.2, 16.3, 16.4_

- [x] 3. Implement authentication system
  - Create AuthContext with login, register, logout functions and user state
  - Create protected route wrapper component for dashboard routes
  - Build login page with email/password form and validation
  - Build registration page with name, email, password fields
  - Implement JWT token storage in localStorage and automatic header injection
  - Add session expiration handling with redirect to login
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 15.4_

- [x] 4. Create landing page and public layout
  - Build landing page with hero section and two CTAs (Teacher Login, Student Join)
  - Create responsive navigation bar for public pages
  - Add route to login page from landing page
  - Add route to join page from landing page
  - _Requirements: 14.1, 14.2, 16.1, 16.2, 16.3, 16.4_

- [x] 5. Build teacher dashboard layout and navigation





  - Create dashboard layout component with sidebar/top navigation
  - Add navigation links (Dashboard Home, Create Quiz, Templates, Settings, Logout)
  - Implement active route highlighting in navigation
  - Create dashboard home page displaying quiz grid/list
  - Add "Create New Quiz" button prominently at top
  - Implement logout functionality with session clearing
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 6. Extend backend data models for new features





- [x] 6.1 Update Quiz model schema


  - Add startDate field (optional Date)
  - Add maxStudents field (optional Number)
  - Add subjects field (Array of Strings)
  - Add questionDistribution field (Object with multipleChoice, trueFalse, fillInBlank, matching counts)
  - Add sourceContent field (Object with type and content)
  - Update status enum to include 'scheduled' and 'full'
  - _Requirements: 2.1, 6.1, 6.2, 6.3, 6.4, 6.5, 17.1, 17.2, 17.3, 17.4_

- [x] 6.2 Create QuizTemplate model


  - Define schema with teacher, name, type, questionCount, duration, questionDistribution, expirationPeriod, subjects
  - Add validation for template fields
  - Create indexes for efficient querying
  - _Requirements: 3.1, 3.2_

- [x] 6.3 Update Question schema for multiple types


  - Add type field (enum: multipleChoice, trueFalse, fillInBlank, matching)
  - Make options field optional (not needed for all types)
  - Add correctAnswer field with union type (number | boolean | string)
  - Add leftColumn, rightColumn, correctPairs fields for matching type
  - Add caseSensitive field for fillInBlank type
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [x] 6.4 Update Submission model


  - Update answers field to support multiple answer types
  - Add questionType to each answer object
  - Update grading logic to handle all question types
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 7. Implement backend template endpoints





- [x] 7.1 Create template CRUD routes


  - POST /api/templates - Create new template
  - GET /api/templates - Get all templates for logged-in teacher
  - GET /api/templates/:id - Get specific template
  - PUT /api/templates/:id - Update template
  - DELETE /api/templates/:id - Delete template
  - _Requirements: 3.1, 3.2, 3.7, 3.8_

- [x] 7.2 Implement template controller logic

  - Validate template data on creation/update
  - Ensure teacher can only access their own templates
  - Handle predefined templates (Short, Long, Exam)
  - _Requirements: 3.3, 3.4, 3.5, 3.6_

- [x] 8. Extend content processing capabilities





- [x] 8.1 Add video URL content extraction


  - Implement YouTube transcript extraction
  - Support other video platforms if possible
  - Extract and return text content from video
  - Handle errors for videos without transcripts
  - _Requirements: 2.1, 2.4, 2.6_

- [x] 8.2 Add web URL content extraction


  - Implement web scraping for article content
  - Extract main text content from HTML
  - Handle different website structures
  - Add error handling for inaccessible URLs
  - _Requirements: 2.1, 2.5, 2.6_

- [x] 8.3 Add topic-based content handling


  - Accept free-form topic text
  - Pass directly to AI for question generation
  - Validate minimum content length
  - _Requirements: 2.1, 2.3, 2.6_

- [x] 9. Update AI question generation for multiple types





- [x] 9.1 Extend AI prompt for question type distribution


  - Modify prompt to request specific question types
  - Include distribution requirements in prompt
  - Request proper format for each question type
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 9.2 Implement question type parsing


  - Parse AI response for multiple choice questions
  - Parse AI response for true/false questions
  - Parse AI response for fill-in-the-blank questions
  - Parse AI response for matching questions
  - Validate parsed questions match expected format
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 9.3 Add distribution validation and adjustment


  - Validate generated questions match requested distribution
  - Adjust distribution if AI cannot generate enough of a type
  - Ensure minimum 1 question per type if percentage > 0
  - _Requirements: 4.2, 4.3_

- [x] 10. Update quiz validation and status logic





- [x] 10.1 Implement start date validation


  - Check if quiz has started before allowing access
  - Return appropriate error for scheduled quizzes
  - Update quiz status to 'active' when start date arrives
  - _Requirements: 6.2, 6.5, 9.2, 9.4, 17.1, 17.2, 17.5_

- [x] 10.2 Implement max students validation


  - Track submission count against maxStudents
  - Prevent access when limit is reached
  - Update quiz status to 'full' when limit reached
  - Return appropriate error for full quizzes
  - _Requirements: 6.3, 6.5, 9.2, 9.6, 17.4, 17.7_

- [x] 10.3 Update expiration validation


  - Check expiration date on quiz access
  - Update status to 'expired' when expiration passes
  - Return appropriate error for expired quizzes
  - _Requirements: 9.2, 9.5, 17.3, 17.6_

- [x] 11. Build template management interface




- [x] 11.1 Create template list page


  - Fetch and display all teacher's templates
  - Show predefined templates (Short, Long, Exam)
  - Display custom templates with edit/delete options
  - Add "Create New Template" button
  - _Requirements: 3.2, 3.7, 3.8_

- [x] 11.2 Build template card component


  - Display template name, type, and key settings
  - Show question count, duration, and distribution
  - Add quick action buttons (edit, delete, duplicate)
  - Implement hover preview of template details
  - _Requirements: 3.2, 3.7_

- [x] 11.3 Create template creation/edit form


  - Build form with fields for name, type, questionCount, duration
  - Add question distribution configurator
  - Add expiration period input
  - Add subject selection
  - Implement form validation
  - Call API to create/update template
  - _Requirements: 3.1, 3.2, 3.7_

- [x] 12. Build ContentSourceSelector component





- [x] 12.1 Create tabbed interface for source types


  - Add tabs for File, Topic, Video, URL
  - Implement tab switching logic
  - Style active tab indicator
  - _Requirements: 2.1_

- [x] 12.2 Implement file upload tab

  - Add drag-and-drop file upload area
  - Support PDF, DOCX, PPT, TXT formats
  - Validate file type and size (max 10MB)
  - Display selected file name and size
  - _Requirements: 2.1, 2.2, 15.3_

- [x] 12.3 Implement topic input tab

  - Add large text area for topic description
  - Add character count indicator
  - Validate minimum content length
  - _Requirements: 2.1, 2.3_

- [x] 12.4 Implement video URL tab

  - Add URL input field
  - Validate YouTube or video platform URL format
  - Show preview of video if possible
  - _Requirements: 2.1, 2.4_

- [x] 12.5 Implement web URL tab

  - Add URL input field
  - Validate HTTP/HTTPS URL format
  - Add option to preview extracted content
  - _Requirements: 2.1, 2.5_

- [x] 13. Build QuestionDistribution component





- [x] 13.1 Create distribution input interface


  - Add slider or number input for each question type
  - Display percentage or count for each type
  - Show visual representation (pie chart or bars)
  - _Requirements: 4.2, 4.3_

- [x] 13.2 Implement distribution validation


  - Validate total equals 100% or specified question count
  - Show error if distribution is invalid
  - Ensure minimum 1 question per type if percentage > 0
  - _Requirements: 4.2, 4.3_


- [x] 13.3 Add preset distributions

  - Create preset buttons (All MC, Mixed, Balanced)
  - Apply preset distribution on button click
  - Allow customization after preset selection
  - _Requirements: 4.2, 4.5_

- [x] 14. Build TemplateSelector component





- [x] 14.1 Create template selection interface


  - Display grid of template cards
  - Show predefined templates prominently
  - List custom templates below
  - Add "No Template" option
  - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 14.2 Implement template selection logic


  - Handle template selection event
  - Pre-populate quiz settings with template values
  - Allow overriding template values
  - _Requirements: 3.7_

- [x] 15. Update quiz creation wizard with new features





- [x] 15.1 Add template selection step (Step 0)
  - Show TemplateSelector component
  - Allow skipping template selection
  - Pre-fill subsequent steps with template data
  - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7_


- [x] 15.2 Update Step 1: Content Source Selection
  - Replace simple file upload with ContentSourceSelector
  - Handle all source types (file, topic, video, URL)
  - Validate selected source before proceeding
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_


- [x] 15.3 Update Step 2: AI Processing
  - Process content based on source type
  - Call appropriate backend endpoint (file/video/URL/topic)
  - Generate questions with specified distribution
  - Show progress for each step
  - _Requirements: 2.6, 4.1, 4.2_


- [x] 15.4 Update Step 3: Configuration
  - Add QuestionDistribution component
  - Add start date/time picker
  - Add max students input
  - Add subject multi-select
  - Update form validation for new fields
  - _Requirements: 4.2, 4.3, 6.1, 6.2, 6.3, 6.4_


- [x] 15.5 Update Step 4: Question Review and Editing


  - Display all generated questions grouped by type
  - Add QuestionEditor for each question
  - Allow editing question text and answers
  - Allow deleting questions
  - Show question count by type
  - Validate distribution after edits
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [x] 16. Build QuestionEditor component





- [x] 16.1 Create editor for Multiple Choice questions


  - Edit question text
  - Edit all four options
  - Select correct answer with radio buttons
  - Validate all fields are filled
  - _Requirements: 5.3_

- [x] 16.2 Create editor for True/False questions

  - Edit question statement
  - Toggle correct answer (True/False)
  - _Requirements: 5.4_

- [x] 16.3 Create editor for Fill-in-the-Blank questions

  - Edit question text with blank indicator
  - Edit correct answer(s)
  - Toggle case-sensitive option
  - Support multiple acceptable answers
  - _Requirements: 5.5_

- [x] 16.4 Create editor for Matching questions

  - Edit left column items
  - Edit right column items
  - Define correct pairings
  - Validate all items have pairs
  - _Requirements: 5.6_

- [x] 16.5 Add common editor features

  - Preview question as students will see it
  - Delete question button with confirmation
  - Save/Cancel buttons
  - Form validation
  - _Requirements: 5.2, 5.7, 5.8_

- [x] 17. Update quiz list and filtering




- [x] 17.1 Add enhanced QuizCard component


  - Display status badge (scheduled, active, full, expired)
  - Show progress bar for submissions vs max students
  - Display subject tags
  - Show start date and expiration date
  - Add quick actions menu
  - _Requirements: 7.2, 7.3, 17.8_

- [x] 17.2 Implement quiz filtering


  - Add filter dropdown for status
  - Add filter dropdown for subject
  - Add date range filter
  - Apply filters to quiz list
  - _Requirements: 7.3_

- [x] 17.3 Implement quiz sorting


  - Add sort options (date created, title, status)
  - Apply sorting to quiz list
  - Persist sort preference
  - _Requirements: 7.2_

- [x] 18. Update quiz management page




- [x] 18.1 Display new quiz fields


  - Show start date if set
  - Show max students and current count
  - Display subjects as tags
  - Show question distribution breakdown
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.4_

- [x] 18.2 Update quiz edit functionality


  - Allow editing all new fields
  - Update validation for start date < expiration date
  - Handle status changes based on dates and student count
  - _Requirements: 7.5_

- [x] 18.3 Add question editing from management page


  - Add "Edit Questions" button
  - Navigate to question editing interface
  - Use QuestionEditor components
  - Save updated questions to quiz
  - _Requirements: 5.1, 5.2, 5.7_

- [x] 19. Update student quiz access validation





- [x] 19.1 Enhance join page validation


  - Check if quiz has started
  - Check if quiz is expired
  - Check if quiz is full
  - Display specific error messages for each case
  - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 19.2 Update quiz lobby page


  - Display start date if quiz is scheduled
  - Show remaining spots if max students is set
  - Update quiz info display
  - _Requirements: 9.7_

- [x] 20. Build multi-type QuestionCard component





- [x] 20.1 Implement Multiple Choice question display


  - Show question text and options
  - Render as radio buttons
  - Handle answer selection
  - _Requirements: 10.1, 10.2_

- [x] 20.2 Implement True/False question display

  - Show question statement
  - Render as two prominent buttons
  - Handle answer selection
  - _Requirements: 10.1, 10.2_

- [x] 20.3 Implement Fill-in-the-Blank question display

  - Show question text with blank indicator
  - Render text input field
  - Handle text input
  - _Requirements: 10.1, 10.2_

- [x] 20.4 Implement Matching question display

  - Show two columns of items
  - Implement drag-and-drop or dropdown interface
  - Handle pair selection
  - Validate all items are paired
  - _Requirements: 10.1, 10.2_

- [x] 20.5 Add question type indicator

  - Display question type badge
  - Style differently for each type
  - _Requirements: 10.2_

- [x] 21. Update quiz taking interface




- [x] 21.1 Update quiz session management


  - Store answers for all question types
  - Handle different answer formats
  - Persist answers in sessionStorage
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 21.2 Update navigation and progress


  - Show question type in progress indicator
  - Handle navigation between different question types
  - Validate answers before allowing submission
  - _Requirements: 10.1, 10.2_

- [x] 22. Update quiz submission and grading





- [x] 22.1 Implement multi-type answer submission


  - Format answers for all question types
  - Send correct answer format to backend
  - _Requirements: 12.1, 12.6_

- [x] 22.2 Update grading logic


  - Grade Multiple Choice answers (index comparison)
  - Grade True/False answers (boolean comparison)
  - Grade Fill-in-the-Blank answers (string comparison with case sensitivity)
  - Grade Matching answers (pair array comparison)
  - Calculate total score
  - _Requirements: 12.2, 12.3, 12.4, 12.5, 12.6_

- [x] 23. Update results page




- [x] 23.1 Display results for all question types


  - Show correct/incorrect for each question type
  - Display student's answer vs correct answer
  - Format display appropriately for each type
  - _Requirements: 12.7, 12.8_

- [x] 24. Update analytics dashboard





- [x] 24.1 Update summary statistics


  - Include question type breakdown in summary
  - Show average score by question type
  - _Requirements: 13.1_

- [x] 24.2 Update submissions table


  - Add columns for new quiz fields if relevant
  - _Requirements: 13.2_

- [x] 24.3 Update question statistics


  - Group statistics by question type
  - Calculate accuracy rate per type
  - Highlight most missed questions per type
  - _Requirements: 13.3, 13.4_

- [x] 24.4 Update export functionality


  - Include question type information in exports
  - Add question distribution to PDF/Excel
  - Include new quiz fields in exports
  - _Requirements: 13.5_

- [x] 25. Update quiz status management





- [x] 25.1 Implement scheduled status


  - Mark quizzes as scheduled if start date is in future
  - Display scheduled status in UI
  - Prevent student access to scheduled quizzes
  - _Requirements: 17.1, 17.5_

- [x] 25.2 Implement full status


  - Mark quizzes as full when max students reached
  - Display full status in UI
  - Prevent student access to full quizzes
  - _Requirements: 17.4, 17.7_

- [x] 25.3 Update status transitions


  - Auto-transition from scheduled to active on start date
  - Auto-transition to full when limit reached
  - Auto-transition to expired on expiration date
  - _Requirements: 17.2, 17.3, 17.8_

- [x] 26. Build Timer component
  - Create countdown timer displaying MM:SS format
  - Update timer every second using setInterval
  - Change timer color when less than 5 minutes remaining
  - Persist timer state in sessionStorage to survive page refresh
  - Trigger auto-submission callback when timer reaches zero
  - Clean up interval on component unmount
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
-

- [x] 27. Add comprehensive error handling




  - Implement global error boundary component
  - Add try-catch blocks around all API calls
  - Display Toast notifications for all errors
  - Handle 401 errors with automatic redirect to login
  - Handle 404 errors with "Not Found" message
  - Handle 500 errors with "Server Error" message
  - Handle network errors with "Connection Error" message
  - _Requirements: 15.1, 15.2_

- [x] 28. Implement loading states across application





  - Add loading spinners for all API requests
  - Display skeleton loaders for quiz lists and tables
  - Show progress indicators during file upload and content processing
  - Add loading state to all buttons during async operations
  - Disable form inputs during submission
  - _Requirements: 15.1_

- [x] 29. Ensure responsive design for all pages





  - Test all pages on mobile (< 640px), tablet (640-1024px), and desktop (> 1024px)
  - Adjust layouts using Tailwind responsive classes
  - Ensure navigation menu works on mobile (hamburger menu if needed)
  - Make tables responsive (horizontal scroll or stacked layout)
  - Test quiz taking interface on mobile devices for all question types
  - Ensure buttons and inputs are touch-friendly on mobile
  - Test drag-and-drop matching questions on touch devices
  - _Requirements: 16.1, 16.2, 16.3, 16.4_

- [x] 30. Add form validation across all forms




  - Implement email format validation on login/register
  - Add password strength validation (min 6 characters)
  - Validate required fields before form submission
  - Validate start date < expiration date
  - Validate question distribution totals
  - Display inline error messages for invalid fields
  - Prevent form submission until all validations pass
  - Add visual indicators for valid/invalid fields
  - _Requirements: 15.4_

- [ ] 31. Implement accessibility features
  - Add ARIA labels to all interactive elements
  - Ensure proper heading hierarchy (h1, h2, h3)
  - Add keyboard navigation support (Tab, Enter, Escape)
  - Ensure sufficient color contrast for text (WCAG AA)
  - Add focus indicators for all focusable elements
  - Test with screen reader for major user flows
  - Add alt text for any images or icons
  - Ensure drag-and-drop has keyboard alternative
  - _Requirements: 16.1, 16.2, 16.3, 16.4_

- [x] 32. Add account settings page
  - Create settings page layout
  - Display teacher profile information (name, email)
  - Add form to update name
  - Add form to change password
  - Implement update profile API call
  - Display success/error messages
  - _Requirements: 14.4_

- [x] 33. Add quiz session persistence
  - Store quiz session data in sessionStorage on quiz start
  - Restore quiz state on page refresh during active quiz
  - Restore timer state from sessionStorage
  - Restore selected answers from sessionStorage for all question types
  - Clear sessionStorage after quiz submission
  - _Requirements: 11.4_

- [ ]* 34. Add copy-to-clipboard functionality
  - Implement clipboard API wrapper utility
  - Add copy button next to access code displays
  - Show success toast message after copying
  - Handle clipboard API errors gracefully
  - Add fallback for browsers without clipboard API
  - _Requirements: 8.2_

- [ ]* 35. Optimize performance
  - Enable React 19 compiler optimizations
  - Implement lazy loading for heavy components (analytics charts, question editors)
  - Add debouncing for search/filter inputs
  - Optimize images using Next.js Image component
  - Minimize bundle size by checking dependencies
  - _Requirements: 16.1, 16.2, 16.3, 16.4_

- [ ]* 36. Add final polish and testing
  - Test complete teacher flow with all question types
  - Test template creation and usage
  - Test all content source types
  - Test question editing for all types
  - Test complete student flow with all question types
  - Test error scenarios (invalid codes, scheduled/full/expired quizzes)
  - Test timer functionality and auto-submission
  - Test grading for all question types
  - Test start date and max students functionality
  - Verify responsive design on actual devices
  - Test drag-and-drop on touch devices
  - Fix any remaining UI/UX issues
  - _Requirements: All_
