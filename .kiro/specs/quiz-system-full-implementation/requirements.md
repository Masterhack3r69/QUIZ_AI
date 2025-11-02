# Requirements Document

## Introduction

This document specifies the requirements for completing the AI-Powered Quiz Generator and Assessment System. The system enables teachers to create AI-generated quizzes from uploaded materials and allows students to take randomized quizzes with automatic grading. The backend API structure exists, but the complete frontend implementation (teacher dashboard, student quiz interface, and analytics) needs to be built.

## Glossary

- **Quiz System**: The complete AI-Powered Quiz Generator and Assessment System
- **Teacher Portal**: The authenticated section of the application where teachers manage quizzes
- **Student Portal**: The public section where students access and take quizzes using access codes
- **Quiz Pool**: The complete set of AI-generated questions for a quiz
- **Randomized Questions**: A subset of questions from the quiz pool, different for each student
- **Access Code**: A unique alphanumeric code that grants students access to a specific quiz
- **Quiz Session**: An active instance of a student taking a quiz with a countdown timer
- **Submission**: A completed quiz attempt by a student with recorded answers and score
- **Analytics Dashboard**: The interface displaying quiz performance metrics and statistics
- **Quiz Template**: A saved configuration of quiz settings that can be reused for creating new quizzes
- **Question Type**: The format of a question (Multiple Choice, True or False, Fill-in-the-Blank, or Matching)
- **Question Distribution**: The ratio or percentage of each question type in a quiz
- **Content Source**: The origin of quiz content (file upload, topic text, video URL, or web URL)
- **Start Date**: The date and time when a quiz becomes available to students
- **Maximum Students**: The cap on the number of participants allowed to take a quiz
- **Subject**: A category or topic assigned to a quiz for organizational purposes
- **Quiz Status**: The current state of a quiz (scheduled, active, full, or expired)

## Requirements

### Requirement 1: Teacher Authentication

**User Story:** As a teacher, I want to register and log in to the system, so that I can securely manage my quizzes and view student results.

#### Acceptance Criteria

1. WHEN a teacher navigates to the registration page, THE Quiz System SHALL display a form with fields for name, email, and password
2. WHEN a teacher submits valid registration data, THE Quiz System SHALL create a new teacher account and redirect to the login page
3. WHEN a teacher submits login credentials, THE Quiz System SHALL validate the credentials and grant access to the Teacher Portal
4. WHEN a teacher's session expires, THE Quiz System SHALL redirect the teacher to the login page
5. WHILE a teacher is not authenticated, THE Quiz System SHALL prevent access to protected teacher routes

### Requirement 2: Quiz Content Source Management

**User Story:** As a teacher, I want to provide content from multiple sources (file upload, topic, video, or URL), so that I can create quizzes from diverse learning materials.

#### Acceptance Criteria

1. WHEN a teacher creates a quiz, THE Quiz System SHALL provide options to input content via file upload, topic text, video URL, or web URL
2. WHEN a teacher uploads a file, THE Quiz System SHALL accept PDF, DOCX, PPT, or TXT formats up to 10MB
3. WHEN a teacher provides a topic, THE Quiz System SHALL accept free-form text input describing the subject matter
4. WHEN a teacher provides a video URL, THE Quiz System SHALL accept YouTube or similar video platform URLs
5. WHEN a teacher provides a web URL, THE Quiz System SHALL accept valid HTTP/HTTPS URLs
6. WHEN content is provided, THE Quiz System SHALL extract or process the content and send it to the AI service for question generation

### Requirement 3: Quiz Template System

**User Story:** As a teacher, I want to create and use custom quiz templates, so that I can quickly configure quizzes with my preferred settings.

#### Acceptance Criteria

1. WHEN a teacher creates a custom template, THE Quiz System SHALL accept inputs for template name, default duration, default question count, default question type distribution, and default expiration period
2. WHEN a teacher saves a template, THE Quiz System SHALL store the template configuration for future use
3. WHEN a teacher creates a new quiz, THE Quiz System SHALL provide options to select from predefined templates: Short Quiz, Long Quiz, or Exam
4. WHERE the Short Quiz template is selected, THE Quiz System SHALL configure the quiz with 10-15 questions
5. WHERE the Long Quiz template is selected, THE Quiz System SHALL configure the quiz with 20-30 questions
6. WHERE the Exam template is selected, THE Quiz System SHALL configure the quiz with 40-60 questions
7. WHEN a teacher selects a custom template, THE Quiz System SHALL pre-populate quiz settings with the template's default values
8. WHEN a teacher views their templates, THE Quiz System SHALL display all saved templates with options to edit or delete

### Requirement 4: Question Type Configuration

**User Story:** As a teacher, I want to specify the types and distribution of questions in my quiz, so that I can create diverse assessments that match my teaching objectives.

#### Acceptance Criteria

1. WHEN the AI generates questions, THE Quiz System SHALL support four question types: Multiple Choice, True or False, Fill-in-the-Blank, and Matching
2. WHEN a teacher configures question distribution, THE Quiz System SHALL accept percentage or count inputs for each question type
3. WHEN a teacher sets question type ratios, THE Quiz System SHALL validate that the total equals 100% or the specified total question count
4. WHEN the AI generates questions, THE Quiz System SHALL produce questions according to the specified distribution (e.g., 70% Multiple Choice, 20% True/False, 10% Fill-in-the-Blank)
5. WHERE no distribution is specified, THE Quiz System SHALL default to 100% Multiple Choice questions

### Requirement 5: Question Editing and Customization

**User Story:** As a teacher, I want to edit AI-generated questions and their answers, so that I can ensure accuracy and relevance to my curriculum.

#### Acceptance Criteria

1. WHEN a teacher reviews generated questions, THE Quiz System SHALL display all questions with their options and correct answers
2. WHEN a teacher selects a question to edit, THE Quiz System SHALL allow modification of the question text, answer options, and correct answer designation
3. WHEN a teacher edits a Multiple Choice question, THE Quiz System SHALL allow modification of all four options and selection of the correct answer
4. WHEN a teacher edits a True or False question, THE Quiz System SHALL allow modification of the statement and toggling the correct answer
5. WHEN a teacher edits a Fill-in-the-Blank question, THE Quiz System SHALL allow modification of the question text and the correct answer(s)
6. WHEN a teacher edits a Matching question, THE Quiz System SHALL allow modification of both columns and their correct pairings
7. WHEN a teacher saves edited questions, THE Quiz System SHALL update the quiz with the modified questions
8. WHEN a teacher deletes a question, THE Quiz System SHALL remove it from the quiz and adjust the total question count

### Requirement 6: Advanced Quiz Configuration

**User Story:** As a teacher, I want to configure advanced quiz settings including start date, student limit, and subject categorization, so that I have better control over quiz availability and organization.

#### Acceptance Criteria

1. WHEN a teacher configures quiz settings, THE Quiz System SHALL accept inputs for title, duration (in minutes), start date/time, expiration date/time, maximum number of students, and subject categories
2. WHEN a teacher sets a start date, THE Quiz System SHALL prevent student access before the specified date/time
3. WHEN a teacher sets a maximum number of students, THE Quiz System SHALL track the number of submissions and prevent access once the limit is reached
4. WHEN a teacher assigns subjects, THE Quiz System SHALL allow selection of one or more subject categories from a predefined list
5. WHEN a teacher saves quiz settings, THE Quiz System SHALL validate that the start date is before the expiration date
6. WHERE no start date is specified, THE Quiz System SHALL make the quiz immediately available upon creation

### Requirement 7: Quiz Management and Organization

**User Story:** As a teacher, I want to view and manage my quizzes with filtering and sorting options, so that I can easily find and organize my assessments.

#### Acceptance Criteria

1. WHEN a teacher saves a new quiz, THE Quiz System SHALL generate a unique 6-character alphanumeric access code
2. WHEN a teacher views their quiz list, THE Quiz System SHALL display all quizzes with title, access code, status, subject, submission count, and start/expiration dates
3. WHEN a teacher filters quizzes, THE Quiz System SHALL provide options to filter by status (active, scheduled, expired), subject, and date range
4. WHEN a teacher selects a quiz, THE Quiz System SHALL display quiz details with options to edit, delete, or view results
5. WHEN a teacher updates quiz settings, THE Quiz System SHALL save the changes and maintain the same access code
6. WHEN a teacher deletes a quiz, THE Quiz System SHALL remove the quiz and all associated submissions from the database

### Requirement 8: Quiz Access Code Management

**User Story:** As a teacher, I want to easily share quiz access codes with students, so that they can quickly access the quiz.

#### Acceptance Criteria

1. WHEN a teacher views a quiz, THE Quiz System SHALL display the access code prominently with a copy-to-clipboard button
2. WHEN a teacher clicks the copy button, THE Quiz System SHALL copy the access code to the clipboard and display a confirmation message
3. WHEN a quiz is created, THE Quiz System SHALL ensure the generated access code is unique across all active quizzes

### Requirement 9: Student Quiz Access

**User Story:** As a student, I want to enter a quiz code and my information, so that I can access and take the quiz.

#### Acceptance Criteria

1. WHEN a student navigates to the join page, THE Quiz System SHALL display a form requesting student name, student ID, and quiz access code
2. WHEN a student submits a valid access code, THE Quiz System SHALL validate that the quiz exists, has started, is active, and has not expired
3. IF a quiz code is invalid, THEN THE Quiz System SHALL display an error message indicating the code is not valid
4. IF a quiz has not started yet, THEN THE Quiz System SHALL display an error message with the start date/time
5. IF a quiz has expired, THEN THE Quiz System SHALL display an error message indicating the quiz is no longer available
6. IF the maximum number of students has been reached, THEN THE Quiz System SHALL display an error message indicating the quiz is full
7. WHEN validation succeeds, THE Quiz System SHALL redirect the student to the quiz lobby page showing quiz title, duration, and question count
8. WHEN a student clicks "Start Quiz", THE Quiz System SHALL begin the quiz session and start the countdown timer

### Requirement 10: Randomized Question Delivery

**User Story:** As a student, I want to receive a randomized set of questions, so that each student has a unique quiz experience while maintaining fairness.

#### Acceptance Criteria

1. WHEN a student starts a quiz, THE Quiz System SHALL randomly select N questions from the quiz pool (where N is configured by the teacher)
2. WHEN questions are selected, THE Quiz System SHALL include questions of all configured types according to the specified distribution
3. WHEN Multiple Choice or True/False questions are displayed, THE Quiz System SHALL randomize the order of answer options
4. WHEN multiple students take the same quiz, THE Quiz System SHALL ensure each student receives a different random selection of questions
5. WHILE maintaining randomization, THE Quiz System SHALL ensure all students have access to the same correct answers for their respective questions

### Requirement 11: Quiz Timer and Auto-Submission

**User Story:** As a student, I want a visible countdown timer during the quiz, so that I know how much time remains and the quiz auto-submits when time expires.

#### Acceptance Criteria

1. WHEN a quiz session starts, THE Quiz System SHALL display a countdown timer showing remaining time in MM:SS format
2. WHILE the quiz is active, THE Quiz System SHALL update the timer display every second
3. WHEN the timer reaches zero, THE Quiz System SHALL automatically submit the quiz with all current answers
4. WHEN a student attempts to navigate away during an active quiz, THE Quiz System SHALL display a warning message
5. WHEN a student manually submits before time expires, THE Quiz System SHALL record the actual time taken

### Requirement 12: Quiz Submission and Grading

**User Story:** As a student, I want my quiz to be automatically graded upon submission, so that I can immediately see my score.

#### Acceptance Criteria

1. WHEN a student submits a quiz, THE Quiz System SHALL compare submitted answers against correct answers from the quiz pool for all question types
2. WHEN grading Multiple Choice and True/False questions, THE Quiz System SHALL mark answers as correct if they match the designated correct option
3. WHEN grading Fill-in-the-Blank questions, THE Quiz System SHALL mark answers as correct if they match the expected answer (case-insensitive)
4. WHEN grading Matching questions, THE Quiz System SHALL mark answers as correct if all pairs are correctly matched
5. WHEN grading completes, THE Quiz System SHALL calculate the score as the number of correct answers divided by total questions
6. WHEN the score is calculated, THE Quiz System SHALL store the submission with student information, answers, score, and time taken
7. WHEN submission is complete, THE Quiz System SHALL display the student's score in a results page
8. WHERE the teacher has enabled answer review, THE Quiz System SHALL display which questions were answered correctly or incorrectly

### Requirement 13: Quiz Analytics and Reporting

**User Story:** As a teacher, I want to view detailed analytics for each quiz, so that I can assess student performance and identify areas for improvement.

#### Acceptance Criteria

1. WHEN a teacher views quiz analytics, THE Quiz System SHALL display summary statistics including class average, highest score, lowest score, and total submissions
2. WHEN analytics are displayed, THE Quiz System SHALL show a table of all submissions with student name, student ID, score, submission time, and time taken
3. WHEN a teacher views question analytics, THE Quiz System SHALL calculate and display the accuracy rate for each question grouped by question type
4. WHEN question analytics are shown, THE Quiz System SHALL identify and highlight the most frequently missed questions
5. WHEN a teacher requests an export, THE Quiz System SHALL generate a downloadable file in the requested format (PDF or Excel)

### Requirement 14: Dashboard Navigation and Layout

**User Story:** As a teacher, I want an intuitive dashboard layout, so that I can easily navigate between quiz management and analytics features.

#### Acceptance Criteria

1. WHEN a teacher logs in, THE Quiz System SHALL display the dashboard home page with a grid or list of all quizzes
2. WHEN the dashboard loads, THE Quiz System SHALL show a "Create New Quiz" button prominently at the top
3. WHEN a teacher clicks on a quiz card, THE Quiz System SHALL navigate to the quiz management page
4. WHILE on any dashboard page, THE Quiz System SHALL display a navigation menu with links to dashboard home, create quiz, templates, and account settings
5. WHEN a teacher clicks logout, THE Quiz System SHALL clear the session and redirect to the login page

### Requirement 15: Error Handling and User Feedback

**User Story:** As a user (teacher or student), I want clear error messages and loading indicators, so that I understand what's happening and can resolve issues.

#### Acceptance Criteria

1. WHEN any API request is in progress, THE Quiz System SHALL display a loading indicator to inform the user
2. IF an API request fails, THEN THE Quiz System SHALL display a user-friendly error message explaining the issue
3. WHEN a file upload exceeds the 10MB limit, THE Quiz System SHALL display an error message before attempting upload
4. WHEN a form has validation errors, THE Quiz System SHALL highlight the invalid fields and display specific error messages
5. WHEN a successful action completes (quiz created, settings saved, etc.), THE Quiz System SHALL display a success confirmation message

### Requirement 16: Responsive Design

**User Story:** As a user, I want the application to work well on different screen sizes, so that I can use it on desktop, tablet, or mobile devices.

#### Acceptance Criteria

1. WHEN a user accesses the Quiz System on a mobile device, THE Quiz System SHALL display a responsive layout optimized for small screens
2. WHEN a user accesses the Quiz System on a tablet, THE Quiz System SHALL display a responsive layout optimized for medium screens
3. WHEN a user accesses the Quiz System on a desktop, THE Quiz System SHALL display a responsive layout optimized for large screens
4. WHILE maintaining responsiveness, THE Quiz System SHALL ensure all interactive elements remain accessible and usable across all screen sizes

### Requirement 17: Quiz Status Management

**User Story:** As a teacher, I want quizzes to automatically manage their status based on start and expiration dates, so that students can only access quizzes at the appropriate times.

#### Acceptance Criteria

1. WHEN a quiz has a start date in the future, THE Quiz System SHALL mark the quiz status as scheduled
2. WHEN a quiz's start date/time arrives, THE Quiz System SHALL automatically mark the quiz status as active
3. WHEN a quiz's expiration date/time passes, THE Quiz System SHALL automatically mark the quiz status as expired
4. WHEN a quiz reaches its maximum student limit, THE Quiz System SHALL mark the quiz status as full
5. WHEN a student attempts to access a scheduled quiz, THE Quiz System SHALL display an error message with the start date/time
6. WHEN a student attempts to access an expired quiz, THE Quiz System SHALL display an error message indicating the quiz is no longer available
7. WHEN a student attempts to access a full quiz, THE Quiz System SHALL display an error message indicating the quiz has reached capacity
8. WHEN a teacher views their quiz list, THE Quiz System SHALL visually distinguish between scheduled, active, full, and expired quizzes
