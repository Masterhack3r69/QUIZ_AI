# Task 10: Quiz Validation and Status Logic Implementation

## Overview
Implemented comprehensive quiz validation and automatic status management based on start dates, maximum student limits, and expiration dates.

## Changes Made

### 1. Start Date Validation (Subtask 10.1)

#### Quiz Model
- Already had `startDate` field (optional Date)
- Already had `status` enum including 'scheduled'

#### Quiz Routes (`backend/src/routes/quiz.routes.js`)

**POST /api/quiz/validate** - Enhanced validation endpoint:
- Checks if quiz has a start date and hasn't started yet
- Returns 400 error with start date if quiz is scheduled
- Automatically updates status from 'scheduled' to 'active' when start date arrives
- Returns appropriate error messages for each status

**POST /api/quiz/start** - Enhanced start endpoint:
- Same validations as validate endpoint
- Prevents students from starting scheduled quizzes
- Auto-transitions status when start date arrives

**GET /api/quiz/my-quizzes** - Enhanced teacher quiz list:
- Automatically checks and updates quiz status based on start date
- Sets status to 'scheduled' if start date is in the future
- Transitions from 'scheduled' to 'active' when start date arrives

**GET /api/quiz/:quizId** - Enhanced single quiz retrieval:
- Same automatic status updates as quiz list
- Ensures teachers see current status

**POST /api/quiz/create** - Enhanced quiz creation:
- Determines initial status based on start date
- Sets status to 'scheduled' if start date is in the future
- Sets status to 'active' if no start date or start date is in the past
- Accepts and stores `startDate`, `maxStudents`, and `subjects` fields

### 2. Max Students Validation (Subtask 10.2)

#### Quiz Model
- Already had `maxStudents` field (optional Number)
- Already had `status` enum including 'full'

#### Quiz Routes (`backend/src/routes/quiz.routes.js`)

**POST /api/quiz/validate** - Added max students check:
- Counts current submissions for the quiz
- Compares against `maxStudents` limit
- Returns 400 error if limit reached
- Automatically updates status to 'full'
- Returns current submission count in error response

**POST /api/quiz/start** - Added max students check:
- Same validation as validate endpoint
- Prevents students from starting full quizzes

**GET /api/quiz/my-quizzes** - Added max students tracking:
- Checks submission count against limit
- Automatically updates status to 'full' when limit reached
- Returns submission count with each quiz

#### Submission Routes (`backend/src/routes/submission.routes.js`)

**POST /api/submission/submit** - Added max students enforcement:
- Checks submission count before accepting new submission
- Returns 400 error if quiz is already full
- After successful submission, checks if limit is now reached
- Automatically updates quiz status to 'full' if limit reached
- Logs status changes for debugging

### 3. Expiration Validation (Subtask 10.3)

#### Quiz Routes (`backend/src/routes/quiz.routes.js`)

**All endpoints** - Enhanced expiration checking:
- Checks expiration date on every quiz access
- Automatically updates status to 'expired' when expiration passes
- Returns appropriate error messages
- Preserves 'full' status even if quiz expires (full takes precedence)

#### Submission Routes (`backend/src/routes/submission.routes.js`)

**POST /api/submission/submit** - Added expiration check:
- Validates quiz hasn't expired before accepting submission
- Returns 400 error with expiration date if expired
- Automatically updates status to 'expired'

**Grading Enhancement**:
- Updated to use `Submission.gradeAnswer()` static method
- Properly handles all question types (multipleChoice, trueFalse, fillInBlank, matching)
- Includes `questionType` in graded answers

## Status Transition Logic

The quiz status follows this priority order:

1. **scheduled** - Quiz has a start date in the future
2. **active** - Quiz has started (or no start date) and hasn't expired or reached capacity
3. **full** - Quiz has reached maximum student limit (takes precedence over expired)
4. **expired** - Quiz expiration date has passed
5. **draft** - Quiz is being created (not used in current implementation)

### Automatic Status Updates

Status is automatically updated in these scenarios:

1. **On quiz creation**: Set to 'scheduled' if start date is in future, otherwise 'active'
2. **On validation/start**: Check start date, expiration, and max students
3. **On teacher quiz list**: Update all quizzes to current status
4. **On teacher quiz view**: Update single quiz to current status
5. **On submission**: Check expiration and max students, update if needed

## Error Messages

### Start Date Errors
- **Message**: "This quiz has not started yet"
- **Status Code**: 400
- **Additional Data**: `startDate` field with the scheduled start time

### Max Students Errors
- **Message**: "This quiz has reached its maximum number of participants"
- **Status Code**: 400
- **Additional Data**: `maxStudents` and `currentSubmissions` fields

### Expiration Errors
- **Message**: "This quiz has expired and is no longer available"
- **Status Code**: 400
- **Additional Data**: `expiresAt` field with expiration date

## Testing

A comprehensive test script has been created at `backend/test-quiz-validation.js` that tests:

1. **Start Date Validation**:
   - Creating quiz with future start date (should be scheduled)
   - Attempting to access scheduled quiz (should fail)
   - Creating quiz with past start date (should be active)
   - Accessing active quiz (should succeed)

2. **Max Students Validation**:
   - Creating quiz with maxStudents = 2
   - Submitting 2 quizzes (should succeed)
   - Attempting to access after limit reached (should fail)

3. **Expiration Validation**:
   - Creating quiz that expires in 1 second
   - Accessing before expiration (should succeed)
   - Accessing after expiration (should fail)

### Running Tests

```bash
# Make sure backend server is running
cd backend
node test-quiz-validation.js
```

**Prerequisites**:
- Backend server must be running on http://localhost:5000
- Test teacher account must exist:
  - Email: teacher@test.com
  - Password: password123

## Requirements Satisfied

### Requirement 6.2 (Start Date)
✅ Quiz prevents student access before specified start date/time

### Requirement 6.3 (Max Students)
✅ Quiz tracks submission count against maxStudents limit
✅ Quiz prevents access when limit is reached

### Requirement 6.5 (Quiz Settings Validation)
✅ Start date is validated and enforced
✅ Max students limit is validated and enforced

### Requirement 9.2 (Student Quiz Access)
✅ Quiz validates that it exists, has started, is active, and hasn't expired

### Requirement 9.4 (Scheduled Quiz Error)
✅ Displays error message with start date/time for scheduled quizzes

### Requirement 9.5 (Expired Quiz Error)
✅ Displays error message for expired quizzes

### Requirement 9.6 (Full Quiz Error)
✅ Displays error message for quizzes at capacity

### Requirement 17.1 (Scheduled Status)
✅ Quizzes with future start dates are marked as 'scheduled'

### Requirement 17.2 (Status Transitions)
✅ Auto-transitions from 'scheduled' to 'active' on start date

### Requirement 17.3 (Expiration Status)
✅ Auto-transitions to 'expired' when expiration date passes

### Requirement 17.4 (Full Status)
✅ Marks quiz as 'full' when max students limit is reached

### Requirement 17.5 (Scheduled Access Prevention)
✅ Prevents student access to scheduled quizzes

### Requirement 17.6 (Expired Access Prevention)
✅ Prevents student access to expired quizzes

### Requirement 17.7 (Full Access Prevention)
✅ Prevents student access to full quizzes

### Requirement 17.8 (Status Display)
✅ Status is automatically updated and returned in all quiz endpoints

## Implementation Notes

1. **Status Priority**: The 'full' status takes precedence over 'expired' to clearly indicate why a quiz is unavailable.

2. **Automatic Updates**: Status is checked and updated on every relevant API call, ensuring the status is always current without requiring a background job.

3. **Backward Compatibility**: Quizzes without `startDate` or `maxStudents` continue to work as before (immediately active, no participant limit).

4. **Performance**: Submission counting is done efficiently using MongoDB's `countDocuments()` method.

5. **Error Handling**: All validation errors return appropriate HTTP status codes (400 for validation errors, 404 for not found) with descriptive messages.

6. **Logging**: Submission endpoint includes detailed console logging for debugging status changes.

## Future Enhancements

Potential improvements for future iterations:

1. **Background Job**: Implement a scheduled job to update quiz statuses periodically instead of on-demand
2. **Caching**: Cache submission counts to reduce database queries
3. **Notifications**: Notify teachers when quizzes become full or expire
4. **Grace Period**: Allow a grace period after expiration for students who started before expiration
5. **Waitlist**: Implement a waitlist feature for full quizzes
