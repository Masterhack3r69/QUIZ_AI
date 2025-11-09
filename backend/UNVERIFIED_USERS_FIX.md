# Unverified Users Fix

## Problem
When users register but cancel OTP verification:
- Account is created with `isVerified: false`
- User cannot login (blocked by verification check)
- User cannot re-register (email already exists)

## Solutions Implemented

### 1. Allow Re-registration for Unverified Accounts ✅
**Location:** `backend/src/routes/auth.routes.js` - `/register` endpoint

**Behavior:**
- If email exists and is verified → reject with "User already exists"
- If email exists but NOT verified → update account info and resend OTP
- If email doesn't exist → create new account and send OTP

**Benefits:**
- Users can simply try to register again with the same email
- Their account info gets updated with new password
- Fresh OTP is sent automatically

### 2. Better Login Error Messages ✅
**Location:** `backend/src/routes/auth.routes.js` - `/login` endpoint

**Changes:**
- Added `needsVerification: true` flag in 403 response
- Clearer error message directing users to verify email

**Frontend Integration:**
**Location:** `frontend/app/login/page.tsx`

**Features:**
- Detects 403 status (unverified account)
- Shows "Resend verification code" button
- Redirects to register page to resend OTP

### 3. Cleanup Script for Old Unverified Accounts ✅
**Location:** `backend/scripts/cleanup-unverified-users.js`

**Purpose:**
- Automatically delete unverified accounts older than 24 hours
- Prevents database clutter from abandoned registrations

**Usage:**
```bash
# Run manually
pnpm cleanup:unverified

# Or set up as a cron job (recommended)
# Run daily at 2 AM
0 2 * * * cd /path/to/backend && pnpm cleanup:unverified
```

## User Flow After Fix

### Scenario 1: User Cancels OTP, Then Tries to Register Again
1. User registers with email@example.com
2. Receives OTP but cancels verification
3. User tries to register again with same email
4. ✅ System updates their account and sends new OTP
5. User verifies and can login

### Scenario 2: User Cancels OTP, Then Tries to Login
1. User registers with email@example.com
2. Receives OTP but cancels verification
3. User tries to login
4. ✅ System shows error with "Resend verification code" button
5. User clicks button → redirected to register page
6. System sends new OTP
7. User verifies and can login

## Testing

### Test Case 1: Re-registration
```bash
# 1. Register but don't verify
POST /api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}

# 2. Try to register again (should work now)
POST /api/auth/register
{
  "name": "Test User Updated",
  "email": "test@example.com",
  "password": "newpassword123"
}
# Expected: 201 Created, new OTP sent
```

### Test Case 2: Login with Unverified Account
```bash
# 1. Try to login without verification
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
# Expected: 403 Forbidden with needsVerification: true
```

### Test Case 3: Cleanup Script
```bash
# Run cleanup script
pnpm cleanup:unverified
# Expected: Deletes unverified users older than 24 hours
```

## Database Queries

### Find all unverified users
```javascript
db.users.find({ isVerified: false })
```

### Manually verify a user
```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { 
    $set: { 
      isVerified: true, 
      verifiedAt: new Date() 
    } 
  }
)
```

### Delete specific unverified user
```javascript
db.users.deleteOne({ 
  email: "user@example.com", 
  isVerified: false 
})
```
