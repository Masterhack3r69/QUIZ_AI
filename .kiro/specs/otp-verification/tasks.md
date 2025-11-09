# Implementation Plan

- [x] 1. Set up backend OTP infrastructure





  - Create OTP model with email, code, expiresAt, attempts, and isUsed fields
  - Add indexes on email and expiresAt for performance
  - Configure TTL index for automatic document cleanup after 15 minutes
  - _Requirements: 1.3, 9.3_

- [x] 1.1 Update User model for verification


  - Add isVerified boolean field (default: false)
  - Add verifiedAt timestamp field
  - Add failedOTPAttempts counter field
  - Add otpLockedUntil timestamp field for rate limiting
  - Create isOTPLocked() method to check lockout status
  - Create resetOTPLock() method to clear lockout
  - _Requirements: 7.4, 5.1_

- [x] 1.2 Create OTP service utility


  - Implement generateOTP() function using crypto.randomInt(100000, 999999)
  - Implement createOTP(email) function to generate and store hashed OTP
  - Implement validateOTP(email, code) function with bcrypt comparison
  - Implement invalidatePreviousOTPs(email) function to clear old codes
  - Implement checkRateLimit(email) function to enforce 5-attempt limit
  - Add isExpired() method to OTP model
  - Add incrementAttempts() method to OTP model
  - Add markAsUsed() method to OTP model
  - _Requirements: 1.1, 5.1, 5.2, 9.1, 9.2, 9.4_

- [x] 1.3 Set up email service


  - Install nodemailer package
  - Create email service configuration with environment variables
  - Implement sendOTPEmail(email, code, name) function
  - Create HTML email template with OTP code and expiration notice
  - Create plain text email fallback
  - Add retry logic for failed email sends
  - Implement sendWelcomeEmail(email, name) function for post-verification
  - _Requirements: 1.2, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 2. Implement backend OTP endpoints





  - Modify POST /api/auth/register to create unverified user and send OTP
  - Update register endpoint to return { message, email } instead of token
  - Ensure register endpoint calls OTP service to generate and send code
  - _Requirements: 1.1, 1.2, 1.3, 7.2_

- [x] 2.1 Create OTP verification endpoint


  - Implement POST /api/auth/verify-otp endpoint
  - Validate request body contains email and code
  - Call OTP service to validate code
  - Check if code is expired using isExpired() method
  - Increment failed attempts on invalid code
  - Check rate limit and enforce 15-minute lockout after 5 failures
  - Mark user as verified and set verifiedAt timestamp on success
  - Mark OTP as used to prevent reuse
  - Generate JWT token and return authenticated session
  - Return appropriate error messages for each failure case
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.1, 5.2, 5.3, 5.4_


- [x] 2.2 Create OTP resend endpoint

  - Implement POST /api/auth/resend-otp endpoint
  - Validate request body contains email
  - Check if user exists and is not already verified
  - Enforce 60-second cooldown between resend requests
  - Invalidate all previous OTPs for the email
  - Generate new OTP and send via email
  - Return success message with email confirmation
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_


- [x] 2.3 Update login endpoint for verification check

  - Modify POST /api/auth/login to check isVerified field
  - Return 403 error if user is not verified
  - Return error message: "Please verify your email address"
  - Include email in error response for frontend to redirect to OTP screen
  - _Requirements: 7.5_

- [x] 3. Install and configure shadcn/ui input-otp component





  - Run: npx shadcn@latest add input-otp
  - Verify component installation in components/ui directory
  - Test component renders correctly with 6 digits
  - _Requirements: 2.1_

- [x] 4. Create OTP verification frontend component





  - Create frontend/components/auth/OTPVerification.tsx component
  - Define OTPVerificationProps interface with email, onVerified, and onBack
  - Implement 6-digit OTP input using shadcn/ui InputOTP component
  - Add state management for otp, isVerifying, error, timeRemaining, canResend, resendCooldown
  - Implement auto-advance to next digit on input
  - Implement auto-submit when all 6 digits are entered
  - Add loading state during verification with disabled inputs
  - Display email address where code was sent
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 1.5_

- [x] 4.1 Implement countdown timer in OTP component

  - Create useEffect hook to decrement timeRemaining every second
  - Display timer in MM:SS format
  - Disable OTP input when timer reaches zero
  - Display "Code expired" message when timer expires
  - Auto-enable resend button when timer expires
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_


- [x] 4.2 Implement resend functionality in OTP component
  - Add "Resend Code" button that starts disabled
  - Enable button after 60-second cooldown
  - Display countdown on button: "Resend Code (45s)"
  - Call resendOTP API when button clicked
  - Reset 60-second cooldown after successful resend
  - Display success toast: "New code sent to [email]"
  - Reset OTP input and error state
  - _Requirements: 4.1, 4.2, 4.5_


- [x] 4.3 Add error handling to OTP component
  - Display error messages below OTP input
  - Handle "Invalid verification code" error
  - Handle "Verification code has expired" error
  - Handle "Too many failed attempts" error with lockout message
  - Handle network errors with retry option
  - Clear input on invalid code error
  - Enable resend button immediately on expired code error
  - Disable all inputs on rate limit error

  - _Requirements: 3.2, 3.3, 5.3_

- [x] 4.4 Add back/change email functionality
  - Add "Change Email" or "Back" button to OTP component
  - Call onBack prop when button clicked
  - Ensure button is always visible and accessible
  - _Requirements: 6.1, 6.2_

- [x] 5. Update registration page for multi-step flow





  - Modify frontend/app/register/page.tsx to support multi-step flow
  - Add RegistrationState interface with step, email, name, otpSentAt
  - Add state to track current step: 'form' or 'otp-verification'
  - Update form submission to transition to OTP step instead of logging in
  - Store email and name in state for OTP component
  - Render OTPVerification component when step is 'otp-verification'
  - Pass email, onVerified, and onBack props to OTP component
  - _Requirements: 1.4, 6.2, 6.3_

- [x] 5.1 Handle OTP verification success in registration page


  - Implement onVerified callback to handle successful verification
  - Call AuthContext login or set token directly after verification
  - Display success toast: "Account created successfully!"
  - Redirect to dashboard after 2-second delay
  - _Requirements: 3.5_

- [x] 5.2 Handle back navigation in registration page


  - Implement onBack callback to return to registration form
  - Pre-fill form fields with stored email and name
  - Allow user to modify email address
  - Clear OTP-related state when returning to form
  - Invalidate previous OTP when email is changed
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [x] 6. Update AuthContext for OTP methods





  - Add verifyOTP(email, code) method to AuthContext
  - Add resendOTP(email) method to AuthContext
  - Implement verifyOTP to call POST /api/auth/verify-otp
  - Store token and user in state on successful verification
  - Implement resendOTP to call POST /api/auth/resend-otp
  - Handle errors and throw APIRequestError for both methods
  - _Requirements: 7.1_

- [x] 7. Add OTP API methods to API client





  - Add verifyOTP(email, code) method to apiClient
  - Add resendOTP(email) method to apiClient
  - Implement POST request to /api/auth/verify-otp endpoint
  - Implement POST request to /api/auth/resend-otp endpoint
  - Return AuthResponse type from verifyOTP
  - Return success message from resendOTP
  - Handle errors with APIRequestError
  - _Requirements: 7.1_

- [x] 8. Create database migration for existing users





  - Create backend/scripts/migrate-existing-users.js script
  - Update all existing users to set isVerified: true
  - Set verifiedAt to current timestamp for existing users
  - Add script to package.json as "migrate:verify-users"
  - Document migration process in README
  - _Requirements: 7.4_

- [x] 9. Add environment variables and configuration





  - Add EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM to backend .env
  - Add OTP_EXPIRY_MINUTES=10 to backend .env
  - Add OTP_MAX_ATTEMPTS=5 to backend .env
  - Add OTP_LOCKOUT_MINUTES=15 to backend .env
  - Add OTP_RESEND_COOLDOWN_SECONDS=60 to backend .env
  - Update .env.example with new variables
  - Document email service setup in README
  - _Requirements: 1.2, 1.3, 5.2, 5.3, 4.1_

- [x] 10. Write backend unit tests







  - Test OTP generation creates 6-digit codes
  - Test OTP validation with correct and incorrect codes
  - Test OTP expiration logic
  - Test rate limiting after 5 failed attempts
  - Test resend cooldown enforcement
  - Test email service sends emails successfully
  - Test register endpoint creates unverified user
  - Test verify-otp endpoint marks user as verified
  - Test login endpoint rejects unverified users
  - _Requirements: 1.1, 3.1, 5.1, 5.2, 4.2, 7.5_

- [ ]* 11. Write frontend unit tests
  - Test OTPVerification component renders correctly
  - Test OTP input auto-advances on digit entry
  - Test auto-submit when 6 digits entered
  - Test countdown timer updates every second
  - Test resend button enables after cooldown
  - Test error messages display correctly
  - Test back button calls onBack prop
  - Test AuthContext verifyOTP method
  - Test AuthContext resendOTP method
  - _Requirements: 2.1, 2.2, 2.3, 8.5, 4.1, 6.1_

- [ ]* 12. Perform integration testing
  - Test complete registration flow from form to dashboard
  - Test OTP email is received within 30 seconds
  - Test correct OTP verifies successfully
  - Test incorrect OTP shows error message
  - Test expired OTP shows appropriate error
  - Test rate limiting locks account after 5 failures
  - Test resend generates new code and invalidates old one
  - Test back button returns to registration form
  - Test unverified user cannot log in
  - Test verified user can log in normally
  - _Requirements: 1.1, 1.2, 3.2, 3.3, 3.4, 5.2, 5.3, 4.2, 6.1, 7.5_
