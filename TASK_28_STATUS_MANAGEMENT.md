# Task 28: Quiz Status Management Implementation

## Overview
Implemented automatic quiz status management to ensure quizzes are properly marked as expired when their expiration date passes, and students are prevented from accessing expired quizzes.

## Implementation Details

### Backend Changes (backend/src/routes/quiz.routes.js)

#### 1. Get All Quizzes for Teacher (`GET /my-quizzes`)
- Added automatic status check when fetching quiz list
- Updates quiz status to 'expired' if current date > expiration date
- Saves updated status to database
- Returns updated quiz list with correct status

#### 2. Get Quiz by ID (`GET /:quizId`)
- Added automatic status check when teacher views quiz details
- Updates quiz status to 'expired' if current date > expiration date
- Saves updated status to database
- Returns quiz with correct status

#### 3. Validate Quiz Code (`POST /validate`)
- Added automatic status check when student validates quiz code
- Updates quiz status to 'expired' if current date > expiration date
- Returns 400 error with message "This quiz has expired and is no longer available" if expired
- Prevents students from accessing expired quizzes

#### 4. Start Quiz (`POST /start`)
- Added automatic status check when student starts quiz
- Updates quiz status to 'expired' if current date > expiration date
- Returns 400 error with message "This quiz has expired and is no longer available" if expired
- Prevents students from starting expired quizzes

### Frontend Changes

#### 1. Utility Functions (frontend/lib/utils.ts)
Added two new utility functions:
- `isQuizExpired(expiresAt)`: Checks if a quiz has expired based on expiration date
- `getQuizStatus(expiresAt, currentStatus)`: Returns 'active' or 'expired' status

#### 2. QuizCard Component (frontend/components/quiz/QuizCard.tsx)
- Updated to use `getQuizStatus` utility function
- Displays correct status badge (Active/Expired)
- Visual distinction with color coding (green for active, gray for expired)

#### 3. Quiz Management Page (frontend/app/dashboard/quiz/[quizId]/page.tsx)
- Updated to use `getQuizStatus` utility function
- Displays status badge at top of page
- Shows correct status based on both database status and expiration date

#### 4. Quiz Lobby Page (frontend/app/quiz/[code]/start/page.tsx)
- Already had proper error handling for expired quizzes
- Displays error message when quiz is expired
- Prevents students from starting expired quizzes

#### 5. Join Page (frontend/app/join/page.tsx)
- Already had proper error handling for expired quizzes
- Displays error message when validation fails
- Shows appropriate error for expired quiz codes

## Requirements Fulfilled

✅ **Requirement 12.1**: Automatic status update check when quiz is accessed
- Implemented in all backend routes that access quizzes
- Status is checked and updated on every access

✅ **Requirement 12.2**: Mark quiz as expired if current date > expiration date
- Implemented automatic status update in backend
- Quiz status is saved to database when expired

✅ **Requirement 12.3**: Display expired status in quiz list and management page
- Quiz list shows status badge (Active/Expired)
- Management page shows status badge at top
- Visual distinction with color coding

✅ **Requirement 12.4**: Prevent students from accessing expired quizzes
- Validation endpoint returns 400 error for expired quizzes
- Start endpoint returns 400 error for expired quizzes
- Appropriate error messages displayed to students

## Testing Recommendations

### Manual Testing Steps:

1. **Test Expired Quiz Detection (Teacher)**
   - Create a quiz with expiration date in the past
   - View quiz list - should show "Expired" status
   - Click on quiz - should show "Expired" badge

2. **Test Expired Quiz Access (Student)**
   - Try to join quiz with expired code
   - Should see error: "This quiz has expired and is no longer available"
   - Should not be able to proceed to quiz lobby

3. **Test Status Update**
   - Create quiz with expiration date 1 minute in future
   - Wait for expiration
   - Refresh quiz list - status should update to "Expired"
   - Try to access as student - should be blocked

4. **Test Active Quiz**
   - Create quiz with future expiration date
   - Should show "Active" status
   - Students should be able to join and start quiz

## Files Modified

### Backend
- `backend/src/routes/quiz.routes.js` - Added automatic status checks

### Frontend
- `frontend/lib/utils.ts` - Added status utility functions
- `frontend/components/quiz/QuizCard.tsx` - Updated to use utility function
- `frontend/app/dashboard/quiz/[quizId]/page.tsx` - Updated to use utility function

## Verification

### Build Status
✅ Backend server running successfully (no errors)
✅ Frontend build completed successfully
✅ All TypeScript types validated
✅ No diagnostics or compilation errors

### Code Quality
- All changes follow existing code patterns
- Utility functions are reusable and well-documented
- Error messages are consistent and user-friendly
- Status checks are efficient (only update when needed)

## Notes

- Status updates happen automatically when quizzes are accessed
- No manual status update required
- Database is updated when status changes
- Frontend displays correct status based on both database status and expiration date
- Error messages are user-friendly and informative
- All existing functionality remains intact
- Implementation is backward compatible with existing quizzes
