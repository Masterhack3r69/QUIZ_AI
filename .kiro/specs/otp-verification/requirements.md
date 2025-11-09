# Requirements Document

## Introduction

This document specifies the requirements for implementing a comprehensive OTP (One-Time Password) verification system for teacher registration. The system will enhance security by verifying email addresses during the registration process, ensuring that only legitimate users with valid email addresses can create teacher accounts.

## Glossary

- **OTP System**: The One-Time Password verification system that generates, sends, validates, and manages time-limited verification codes
- **Registration Flow**: The multi-step process where a teacher creates an account, receives an OTP, and verifies their email address
- **Verification Code**: A 6-digit numeric code sent to the user's email address for identity verification
- **Email Service**: The backend service responsible for sending OTP codes via email (e.g., Nodemailer, SendGrid)
- **OTP Storage**: The database mechanism for storing OTP codes with expiration timestamps and attempt tracking
- **Frontend UI**: The Next.js React components including the shadcn/ui input-otp component for user interaction
- **Backend API**: The Express.js endpoints that handle OTP generation, validation, and user verification

## Requirements

### Requirement 1

**User Story:** As a teacher, I want to verify my email address during registration, so that I can prove I own the email and create a secure account

#### Acceptance Criteria

1. WHEN a teacher submits the registration form with valid credentials, THE OTP System SHALL generate a unique 6-digit verification code
2. WHEN the verification code is generated, THE Email Service SHALL send the code to the provided email address within 30 seconds
3. THE OTP System SHALL store the verification code in OTP Storage with a 10-minute expiration timestamp
4. WHEN the code is sent successfully, THE Frontend UI SHALL display the OTP input screen with clear instructions
5. THE Frontend UI SHALL display the email address where the code was sent for user confirmation

### Requirement 2

**User Story:** As a teacher, I want to enter the OTP code I received via email, so that I can complete my registration

#### Acceptance Criteria

1. THE Frontend UI SHALL display a 6-digit input field using the shadcn/ui input-otp component
2. WHEN the user enters each digit, THE Frontend UI SHALL automatically advance to the next input field
3. WHEN all 6 digits are entered, THE Frontend UI SHALL automatically submit the verification request to the Backend API
4. THE Frontend UI SHALL provide visual feedback during the verification process with a loading state
5. THE Frontend UI SHALL disable the input fields during verification to prevent duplicate submissions

### Requirement 3

**User Story:** As a teacher, I want to receive clear feedback about my OTP verification attempt, so that I know whether my code was accepted or rejected

#### Acceptance Criteria

1. WHEN the Backend API receives a verification request, THE OTP System SHALL validate the code against OTP Storage
2. IF the verification code matches and is not expired, THEN THE Backend API SHALL mark the user account as verified and return success
3. IF the verification code is incorrect, THEN THE Backend API SHALL return an error message stating "Invalid verification code"
4. IF the verification code has expired, THEN THE Backend API SHALL return an error message stating "Verification code has expired"
5. WHEN verification succeeds, THE Frontend UI SHALL display a success message and redirect to the dashboard within 2 seconds

### Requirement 4

**User Story:** As a teacher, I want to request a new OTP code if my original code expired or was not received, so that I can complete registration without creating a new account

#### Acceptance Criteria

1. THE Frontend UI SHALL display a "Resend Code" button that becomes enabled after 60 seconds
2. WHEN the user clicks "Resend Code", THE Backend API SHALL generate a new 6-digit verification code
3. THE OTP System SHALL invalidate any previous unexpired codes for that email address
4. THE Email Service SHALL send the new verification code to the user's email address
5. THE Frontend UI SHALL display a confirmation message "New code sent to [email]" and reset the 60-second timer

### Requirement 5

**User Story:** As a system administrator, I want to prevent brute-force attacks on OTP verification, so that the system remains secure

#### Acceptance Criteria

1. THE OTP System SHALL track the number of failed verification attempts per email address
2. WHEN a user exceeds 5 failed verification attempts within 10 minutes, THE Backend API SHALL temporarily lock the account for 15 minutes
3. THE Backend API SHALL return an error message stating "Too many failed attempts. Please try again in 15 minutes"
4. THE OTP System SHALL reset the failed attempt counter when a verification succeeds
5. THE OTP System SHALL reset the failed attempt counter after the 15-minute lockout period expires

### Requirement 6

**User Story:** As a teacher, I want to cancel the OTP verification process and return to registration, so that I can correct my email address if I made a mistake

#### Acceptance Criteria

1. THE Frontend UI SHALL display a "Change Email" or "Back" button on the OTP verification screen
2. WHEN the user clicks the button, THE Frontend UI SHALL return to the registration form with all fields pre-filled
3. THE Frontend UI SHALL allow the user to modify the email address
4. WHEN the user resubmits with a different email, THE OTP System SHALL generate a new code for the new email address
5. THE OTP System SHALL invalidate any codes associated with the previous email address

### Requirement 7

**User Story:** As a developer, I want the OTP system to integrate seamlessly with the existing authentication flow, so that the codebase remains maintainable

#### Acceptance Criteria

1. THE Backend API SHALL create new endpoints at POST /api/auth/verify-otp and POST /api/auth/resend-otp
2. THE Backend API SHALL modify the existing POST /api/auth/register endpoint to create unverified users and trigger OTP generation
3. THE OTP Storage SHALL use a new OTP model with fields: email, code, expiresAt, attempts, createdAt
4. THE User model SHALL include an isVerified boolean field defaulting to false
5. THE Backend API SHALL prevent unverified users from logging in until email verification is complete

### Requirement 8

**User Story:** As a teacher, I want to see a countdown timer showing when my OTP code will expire, so that I know how much time I have to enter the code

#### Acceptance Criteria

1. THE Frontend UI SHALL display a countdown timer showing minutes and seconds remaining
2. THE Frontend UI SHALL calculate the remaining time based on the 10-minute expiration period
3. WHEN the timer reaches zero, THE Frontend UI SHALL disable the OTP input and display "Code expired"
4. THE Frontend UI SHALL automatically enable the "Resend Code" button when the timer expires
5. THE Frontend UI SHALL update the countdown display every second

### Requirement 9

**User Story:** As a system administrator, I want OTP codes to be cryptographically secure, so that they cannot be easily guessed or predicted

#### Acceptance Criteria

1. THE OTP System SHALL generate codes using a cryptographically secure random number generator
2. THE OTP System SHALL ensure each generated code is exactly 6 digits with leading zeros if necessary
3. THE OTP Storage SHALL store codes in hashed format using bcrypt or similar algorithm
4. THE Backend API SHALL compare submitted codes using secure comparison methods to prevent timing attacks
5. THE OTP System SHALL ensure generated codes have sufficient entropy to prevent prediction

### Requirement 10

**User Story:** As a teacher, I want to receive a professional and clear email with my OTP code, so that I can easily identify and trust the verification email

#### Acceptance Criteria

1. THE Email Service SHALL send emails with a clear subject line "Verify Your Quiz AI Account"
2. THE Email Service SHALL include the 6-digit code prominently in the email body
3. THE Email Service SHALL include the expiration time (10 minutes) in the email
4. THE Email Service SHALL include a warning not to share the code with anyone
5. THE Email Service SHALL use HTML formatting for better readability and include the application branding
