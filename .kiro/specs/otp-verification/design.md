# Design Document

## Overview

This document outlines the technical design for implementing a comprehensive OTP (One-Time Password) verification system for teacher registration. The system will integrate seamlessly with the existing Next.js frontend and Express.js backend, using the shadcn/ui input-otp component for the user interface and implementing secure backend verification logic.

The OTP verification flow will be inserted between the initial registration form submission and the final account creation, ensuring that only users with verified email addresses can access the platform.

## Architecture

### High-Level Flow

```
1. User submits registration form
   ↓
2. Backend creates unverified user account
   ↓
3. Backend generates 6-digit OTP code
   ↓
4. Backend sends OTP via email
   ↓
5. Frontend displays OTP input screen
   ↓
6. User enters OTP code
   ↓
7. Backend validates OTP
   ↓
8. Backend marks user as verified
   ↓
9. User is logged in and redirected to dashboard
```

### System Components

1. **Frontend Components**
   - Modified registration page with multi-step flow
   - New OTP verification component using shadcn/ui input-otp
   - Updated AuthContext to handle OTP verification state

2. **Backend Services**
   - OTP generation service
   - Email service for sending verification codes
   - OTP validation service with rate limiting
   - Modified authentication routes

3. **Database Models**
   - Updated User model with `isVerified` field
   - New OTP model for storing verification codes

4. **External Services**
   - Email service provider (Nodemailer with Gmail/SMTP or SendGrid)

## Components and Interfaces

### Frontend Components

#### 1. Registration Page (`frontend/app/register/page.tsx`)

**Modified Structure:**
```typescript
interface RegistrationState {
  step: 'form' | 'otp-verification';
  email: string;
  name: string;
  otpSentAt: Date | null;
}
```

**Behavior:**
- Step 1: Display registration form (existing)
- Step 2: Display OTP verification component (new)
- Handle transitions between steps
- Manage registration state across steps

#### 2. OTP Verification Component (`frontend/components/auth/OTPVerification.tsx`)

**Props Interface:**
```typescript
interface OTPVerificationProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}
```

**Features:**
- 6-digit OTP input using shadcn/ui input-otp
- Auto-submit when all digits entered
- Countdown timer (10 minutes)
- Resend code button (enabled after 60 seconds)
- Error display for invalid/expired codes
- Loading states during verification

**Component Structure:**
```typescript
export function OTPVerification({ email, onVerified, onBack }: OTPVerificationProps) {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  
  // Timer logic
  // Auto-submit logic
  // Resend logic
  // Verification API call
}
```

#### 3. Updated AuthContext (`frontend/contexts/AuthContext.tsx`)

**New Methods:**
```typescript
interface AuthContextType {
  // ... existing methods
  verifyOTP: (email: string, code: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
}
```

### Backend Components

#### 1. OTP Model (`backend/src/models/OTP.model.js`)

**Schema:**
```javascript
{
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  code: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900 // Auto-delete after 15 minutes
  }
}
```

**Methods:**
- `isExpired()`: Check if OTP has expired
- `incrementAttempts()`: Increment failed attempt counter
- `markAsUsed()`: Mark OTP as used after successful verification

#### 2. Updated User Model (`backend/src/models/User.model.js`)

**New Fields:**
```javascript
{
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  failedOTPAttempts: {
    type: Number,
    default: 0
  },
  otpLockedUntil: {
    type: Date
  }
}
```

**New Methods:**
- `isOTPLocked()`: Check if account is temporarily locked due to failed attempts
- `resetOTPLock()`: Reset lock after successful verification or timeout

#### 3. OTP Service (`backend/src/utils/otp.service.js`)

**Functions:**

```javascript
// Generate cryptographically secure 6-digit code
generateOTP(): string

// Create and store OTP in database
createOTP(email: string): Promise<OTP>

// Validate OTP code
validateOTP(email: string, code: string): Promise<boolean>

// Invalidate all previous OTPs for an email
invalidatePreviousOTPs(email: string): Promise<void>

// Check if user is rate-limited
checkRateLimit(email: string): Promise<boolean>
```

**Implementation Details:**
- Use `crypto.randomInt()` for secure random number generation
- Hash OTP codes before storing (using bcrypt)
- Implement exponential backoff for rate limiting
- Clean up expired OTPs automatically

#### 4. Email Service (`backend/src/utils/email.service.js`)

**Functions:**

```javascript
// Send OTP verification email
sendOTPEmail(email: string, code: string, name: string): Promise<void>

// Send welcome email after verification
sendWelcomeEmail(email: string, name: string): Promise<void>
```

**Email Template:**
```html
Subject: Verify Your Quiz AI Account

Hi [Name],

Your verification code is: [CODE]

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
Quiz AI Team
```

**Configuration:**
- Support for multiple providers (Nodemailer, SendGrid)
- Environment variables for credentials
- Retry logic for failed sends
- HTML and plain text versions

#### 5. Auth Routes (`backend/src/routes/auth.routes.js`)

**Modified Endpoints:**

**POST /api/auth/register**
- Create unverified user account
- Generate and send OTP
- Return success without token
- Response: `{ message: 'Verification code sent', email }`

**New Endpoints:**

**POST /api/auth/verify-otp**
```javascript
Request: { email, code }
Response: { token, user }
```
- Validate OTP code
- Check expiration and rate limits
- Mark user as verified
- Generate JWT token
- Return authenticated session

**POST /api/auth/resend-otp**
```javascript
Request: { email }
Response: { message: 'New code sent' }
```
- Invalidate previous OTPs
- Generate new OTP
- Send new email
- Enforce 60-second cooldown

**Modified POST /api/auth/login**
- Check if user is verified
- Reject login for unverified users
- Return error: "Please verify your email address"

## Data Models

### OTP Document

```javascript
{
  _id: ObjectId,
  email: "teacher@example.com",
  code: "$2a$10$...", // Hashed 6-digit code
  expiresAt: ISODate("2024-01-01T12:10:00Z"),
  attempts: 0,
  isUsed: false,
  createdAt: ISODate("2024-01-01T12:00:00Z")
}
```

### Updated User Document

```javascript
{
  _id: ObjectId,
  name: "John Doe",
  email: "teacher@example.com",
  password: "$2a$10$...",
  role: "teacher",
  isVerified: false,
  verifiedAt: null,
  failedOTPAttempts: 0,
  otpLockedUntil: null,
  createdAt: ISODate("2024-01-01T12:00:00Z"),
  updatedAt: ISODate("2024-01-01T12:00:00Z")
}
```

## Error Handling

### Frontend Error States

1. **Invalid Code**
   - Display: "Invalid verification code. Please try again."
   - Action: Clear input, allow retry

2. **Expired Code**
   - Display: "Verification code has expired. Please request a new code."
   - Action: Enable resend button immediately

3. **Too Many Attempts**
   - Display: "Too many failed attempts. Please try again in 15 minutes."
   - Action: Disable input and resend button

4. **Network Error**
   - Display: "Network error. Please check your connection."
   - Action: Allow retry

5. **Server Error**
   - Display: "Something went wrong. Please try again later."
   - Action: Provide back button to registration form

### Backend Error Responses

```javascript
// Invalid code
{ status: 400, message: 'Invalid verification code' }

// Expired code
{ status: 400, message: 'Verification code has expired' }

// Rate limit exceeded
{ status: 429, message: 'Too many failed attempts. Please try again in 15 minutes' }

// User not found
{ status: 404, message: 'User not found' }

// Already verified
{ status: 400, message: 'Email already verified' }

// Resend cooldown
{ status: 429, message: 'Please wait before requesting a new code' }
```

## Testing Strategy

### Unit Tests

#### Frontend
1. **OTPVerification Component**
   - Renders correctly with email prop
   - Handles OTP input changes
   - Auto-submits when 6 digits entered
   - Displays countdown timer correctly
   - Enables resend button after cooldown
   - Shows error messages appropriately

2. **AuthContext**
   - `verifyOTP` calls correct API endpoint
   - `resendOTP` handles cooldown logic
   - Error handling for failed verification

#### Backend
1. **OTP Service**
   - `generateOTP` creates 6-digit codes
   - `createOTP` stores hashed codes
   - `validateOTP` correctly validates codes
   - Rate limiting works as expected
   - Expired codes are rejected

2. **Email Service**
   - Email templates render correctly
   - Emails are sent successfully
   - Retry logic works for failures

3. **Auth Routes**
   - Registration creates unverified user
   - OTP verification marks user as verified
   - Login rejects unverified users
   - Resend OTP enforces cooldown

### Integration Tests

1. **Complete Registration Flow**
   - User submits registration form
   - OTP is generated and sent
   - User enters correct OTP
   - User is verified and logged in
   - User can access dashboard

2. **Error Scenarios**
   - Invalid OTP code handling
   - Expired OTP code handling
   - Rate limit enforcement
   - Resend cooldown enforcement

3. **Security Tests**
   - OTP codes are hashed in database
   - Rate limiting prevents brute force
   - Expired OTPs cannot be used
   - Used OTPs cannot be reused

### Manual Testing Checklist

- [ ] Registration form submits successfully
- [ ] OTP email is received within 30 seconds
- [ ] OTP input component displays correctly
- [ ] Countdown timer updates every second
- [ ] Auto-submit works when 6 digits entered
- [ ] Correct OTP verifies successfully
- [ ] Incorrect OTP shows error message
- [ ] Expired OTP shows appropriate error
- [ ] Resend button enables after 60 seconds
- [ ] Resend generates new code
- [ ] Rate limiting locks account after 5 failures
- [ ] Back button returns to registration form
- [ ] Verified user can log in
- [ ] Unverified user cannot log in

## Security Considerations

### OTP Generation
- Use `crypto.randomInt(100000, 999999)` for cryptographically secure random codes
- Ensure uniform distribution of codes
- No predictable patterns in code generation

### OTP Storage
- Hash codes using bcrypt before storing
- Use constant-time comparison to prevent timing attacks
- Set TTL index for automatic cleanup

### Rate Limiting
- Limit to 5 failed attempts per 10 minutes
- Lock account for 15 minutes after limit exceeded
- Track attempts at both OTP and user level
- Reset counter on successful verification

### Email Security
- Use TLS for email transmission
- Validate email addresses before sending
- Include warning about not sharing codes
- Log all OTP generation and verification attempts

### Session Management
- Only issue JWT token after successful verification
- Include `isVerified` claim in JWT payload
- Verify `isVerified` status on protected routes
- Invalidate sessions for unverified users

## Performance Considerations

### Database Optimization
- Index on `email` field in OTP model
- Index on `expiresAt` for efficient cleanup
- TTL index for automatic document deletion
- Compound index on `email` and `isUsed`

### Email Delivery
- Use async/await for non-blocking email sends
- Implement queue system for high volume (optional)
- Cache email templates
- Retry failed sends with exponential backoff

### Frontend Optimization
- Debounce OTP input to prevent excessive API calls
- Use React.memo for OTP input component
- Implement optimistic UI updates
- Cache countdown timer state

## Configuration

### Environment Variables

**Backend (.env)**
```
# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=noreply@quizai.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Quiz AI <noreply@quizai.com>

# OTP Settings
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_LOCKOUT_MINUTES=15
OTP_RESEND_COOLDOWN_SECONDS=60

# JWT
JWT_SECRET=your-secret-key
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### Feature Flags

```javascript
// backend/src/config/features.js
export const FEATURES = {
  OTP_VERIFICATION_ENABLED: true,
  OTP_SKIP_EMAIL_IN_DEV: process.env.NODE_ENV === 'development',
  OTP_LOG_CODES_IN_DEV: process.env.NODE_ENV === 'development'
};
```

## Migration Strategy

### Phase 1: Backend Implementation
1. Create OTP model
2. Update User model with verification fields
3. Implement OTP service
4. Implement email service
5. Update auth routes

### Phase 2: Frontend Implementation
1. Install shadcn/ui input-otp component
2. Create OTP verification component
3. Update registration page with multi-step flow
4. Update AuthContext with OTP methods
5. Add API client methods for OTP endpoints

### Phase 3: Testing & Deployment
1. Run unit tests
2. Run integration tests
3. Manual testing in development
4. Deploy to staging
5. User acceptance testing
6. Deploy to production

### Backward Compatibility

**Existing Users:**
- Mark all existing users as `isVerified: true` during migration
- Run migration script before deploying new code

**Migration Script:**
```javascript
// backend/scripts/migrate-existing-users.js
await User.updateMany(
  { isVerified: { $exists: false } },
  { $set: { isVerified: true, verifiedAt: new Date() } }
);
```

## Monitoring and Logging

### Metrics to Track
- OTP generation rate
- OTP verification success rate
- Failed verification attempts
- Email delivery success rate
- Average time to verification
- Rate limit triggers

### Logging Events
- OTP generated (email, timestamp)
- OTP sent (email, success/failure)
- OTP verified (email, success/failure)
- Rate limit triggered (email, timestamp)
- Account locked (email, timestamp)

### Alerts
- High rate of failed verifications
- Email delivery failures
- Unusual OTP generation patterns
- Rate limit abuse attempts

## Future Enhancements

1. **SMS OTP Option**
   - Allow users to choose email or SMS
   - Integrate with Twilio or similar service

2. **Backup Codes**
   - Generate backup codes during registration
   - Allow verification with backup code if email fails

3. **QR Code Verification**
   - Generate QR code with verification link
   - Scan to verify instantly

4. **Biometric Verification**
   - Add WebAuthn support
   - Allow fingerprint/face ID verification

5. **Admin Dashboard**
   - View OTP statistics
   - Manually verify users
   - Reset verification status
