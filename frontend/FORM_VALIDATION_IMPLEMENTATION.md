# Form Validation Implementation

This document describes the comprehensive form validation implemented across the Quiz System application as part of Task 30.

## Overview

All forms in the application have been enhanced with:
- ✅ Email format validation
- ✅ Password strength validation (minimum 6 characters)
- ✅ Required field validation
- ✅ Date validation (start date < expiration date)
- ✅ Question distribution validation (totals 100%)
- ✅ Inline error messages
- ✅ Prevention of submission until valid
- ✅ Visual indicators for valid/invalid fields

## Forms with Validation

### 1. Login Form (`/login`)

**Location:** `frontend/app/login/page.tsx`

**Validations:**
- **Email:**
  - Required field
  - Valid email format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
  - Error message: "Please enter a valid email address"
- **Password:**
  - Required field
  - Minimum 6 characters
  - Error message: "Password must be at least 6 characters"

**Features:**
- Real-time error clearing when user starts typing
- Visual indicators (green checkmark for valid, red icon for invalid)
- Form submission prevented until all validations pass
- Loading state during submission

**Code Example:**
```typescript
const validateForm = (): boolean => {
  const newErrors: { email?: string; password?: string } = {};

  if (!email) {
    newErrors.email = ERROR_MESSAGES.REQUIRED_FIELD;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    newErrors.email = ERROR_MESSAGES.INVALID_EMAIL;
  }

  if (!password) {
    newErrors.password = ERROR_MESSAGES.REQUIRED_FIELD;
  } else if (password.length < 6) {
    newErrors.password = ERROR_MESSAGES.INVALID_PASSWORD;
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

---

### 2. Registration Form (`/register`)

**Location:** `frontend/app/register/page.tsx`

**Validations:**
- **Name:**
  - Required field
  - Minimum 2 characters
  - Maximum 100 characters
  - Error messages: "Name is required", "Name must be at least 2 characters", "Name must not exceed 100 characters"
- **Email:**
  - Required field
  - Valid email format
  - Error message: "Please enter a valid email address"
- **Password:**
  - Required field
  - Minimum 6 characters
  - Error message: "Password must be at least 6 characters"
- **Confirm Password:**
  - Required field
  - Must match password
  - Error messages: "This field is required", "Passwords do not match"

**Features:**
- Real-time error clearing per field
- Visual indicators for all fields
- Helper text for password requirements
- Form submission prevented until all validations pass

---

### 3. Join Quiz Form (`/join`)

**Location:** `frontend/app/join/page.tsx`

**Validations:**
- **Student Name:**
  - Required field
  - Error message: "Student name is required"
- **Student ID:**
  - Required field
  - Error message: "Student ID is required"
- **Access Code:**
  - Required field
  - Exactly 6 characters
  - Error messages: "Quiz access code is required", "Access code must be 6 characters"

**Features:**
- Auto-uppercase for access code
- Real-time error clearing
- Visual indicators
- Server-side validation for quiz availability (not started, expired, full)

---

### 4. Settings Form (`/dashboard/settings`)

**Location:** `frontend/app/dashboard/settings/page.tsx`

**Validations:**

**Profile Update:**
- **Name:**
  - Required field
  - Error message: "Name is required"

**Password Change:**
- **Current Password:**
  - Required field
  - Error message: "Current password is required"
- **New Password:**
  - Required field
  - Minimum 6 characters
  - Error messages: "New password is required", "Password must be at least 6 characters"
- **Confirm New Password:**
  - Required field
  - Must match new password
  - Error messages: "Please confirm your new password", "Passwords do not match"

**Features:**
- Separate validation for profile and password forms
- Helper text for password requirements
- Submit button disabled until changes are made

---

### 5. Create Quiz Form (`/dashboard/create`)

**Location:** `frontend/app/dashboard/create/page.tsx`

**Validations:**
- **Quiz Title:**
  - Required field
  - Minimum 3 characters
  - Maximum 100 characters
  - Error messages: "Quiz title is required", "Quiz title must be at least 3 characters", "Quiz title must not exceed 100 characters"
- **Duration:**
  - Required field
  - Minimum 1 minute
  - Maximum 300 minutes (5 hours)
  - Error messages: "Duration is required", "Duration must be at least 1 minute", "Duration must not exceed 300 minutes (5 hours)"
- **Start Date (Optional):**
  - Must be in the future
  - Must be before expiration date
  - Error messages: "Start date must be in the future", "Invalid date format"
- **Expiration Date:**
  - Required field
  - Must be in the future
  - Must be after start date (if start date is set)
  - Error messages: "Expiration date and time is required", "Expiration date must be in the future", "Expiration date must be after start date"
- **Max Students (Optional):**
  - Must be at least 1 if provided
  - Error message: "Must be at least 1 student"
- **Questions Per Student:**
  - Required field
  - Minimum 1
  - Maximum: total generated questions
  - Error messages: "Number of questions is required", "Must have at least 1 question", "Cannot exceed X (total generated questions)"
- **Question Distribution:**
  - Must total 100%
  - Validated in QuestionDistribution component

**Features:**
- Multi-step wizard with validation at each step
- Real-time error clearing
- Visual indicators for all fields
- Helper text for each field
- Date/time pickers with validation
- Subject multi-select
- Question distribution with visual preview

---

### 6. Template Form (`/dashboard/templates`)

**Location:** `frontend/components/quiz/TemplateForm.tsx`

**Validations:**
- **Template Name:**
  - Required field
  - Error message: "Template name is required"
- **Question Count:**
  - Minimum 1
  - Error message: "Question count must be at least 1"
- **Duration:**
  - Minimum 1 minute
  - Error message: "Duration must be at least 1 minute"
- **Expiration Period:**
  - Minimum 1 day
  - Error message: "Expiration period must be at least 1 day"
- **Question Distribution:**
  - Must total 100%
  - Error message: "Question distribution must total 100%"

**Features:**
- Template type presets (Short, Long, Exam, Custom)
- Distribution presets (All MC, Mixed, Balanced)
- Real-time distribution validation
- Visual distribution display
- Subject multi-select

---

## Shared Components

### Input Component

**Location:** `frontend/components/ui/Input.tsx`

**Features:**
- Automatic visual indicators:
  - Green checkmark icon for valid fields (when `showValidIndicator={true}`)
  - Red error icon for invalid fields
  - Green border for valid fields
  - Red border for invalid fields
- Error message display with icon
- Helper text display
- Required field indicator (red asterisk)
- Disabled state styling
- Accessibility attributes (aria-invalid, aria-describedby)

**Props:**
```typescript
interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  showValidIndicator?: boolean;
  // ... standard input props
}
```

---

### QuestionDistribution Component

**Location:** `frontend/components/quiz/QuestionDistribution.tsx`

**Validations:**
- Total must equal 100% (percentage mode) or total questions (count mode)
- Minimum 1 question per type if percentage > 0
- Real-time validation with error messages

**Features:**
- Preset distributions (All MC, Mixed, Balanced)
- Slider and number input for each question type
- Visual bar chart preview
- Color-coded legend
- Real-time validation feedback
- Success/error indicators

---

## Error Messages Configuration

**Location:** `frontend/lib/config.ts`

All error messages are centralized in the `ERROR_MESSAGES` constant:

```typescript
export const ERROR_MESSAGES = {
  // Auth errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'An account with this email already exists',
  SESSION_EXPIRED: 'Your session has expired. Please log in again',
  
  // Validation errors
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must be at least 6 characters',
  INVALID_DATE: 'Please select a valid date',
  
  // ... more error messages
};
```

---

## Validation Patterns

### 1. Email Validation
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = emailRegex.test(email);
```

### 2. Password Validation
```typescript
const isValidPassword = password.length >= 6;
```

### 3. Date Validation
```typescript
// Future date
const isFutureDate = new Date(dateString) > new Date();

// Start before expiration
const isValidDateRange = new Date(expiresAt) > new Date(startDate);
```

### 4. Required Field Validation
```typescript
const isValid = value.trim().length > 0;
```

### 5. Range Validation
```typescript
const isValidDuration = duration >= 1 && duration <= 300;
```

### 6. Distribution Validation
```typescript
const total = distribution.multipleChoice + distribution.trueFalse + 
              distribution.fillInBlank + distribution.matching;
const isValid = total === 100;
```

---

## User Experience Features

### Real-time Validation
- Errors clear immediately when user starts typing
- Visual feedback updates in real-time
- No need to submit to see validation errors

### Visual Indicators
- **Valid fields:** Green border + green checkmark icon
- **Invalid fields:** Red border + red error icon
- **Error messages:** Red text with icon below field
- **Helper text:** Gray text below field (when no error)

### Accessibility
- All inputs have proper labels
- Required fields marked with red asterisk
- Error messages linked via `aria-describedby`
- Invalid fields marked with `aria-invalid`
- Focus states clearly visible

### Form Submission
- Submit button disabled during loading
- Loading spinner shown during submission
- Form submission prevented if validation fails
- Toast notifications for success/error

---

## Testing

Validation tests are located in `frontend/__tests__/validation.test.tsx`

**Test Coverage:**
- Email format validation
- Password strength validation
- Date validation (future dates, date ranges)
- Question distribution validation
- Required field validation
- Range validation (duration, question count)
- Text length validation (title, name)
- Access code validation
- Password confirmation validation

**Run tests:**
```bash
cd frontend
npm test validation.test.tsx
```

---

## Summary

All forms in the Quiz System now have comprehensive validation that:
1. ✅ Validates email format using regex
2. ✅ Enforces password minimum length of 6 characters
3. ✅ Validates all required fields before submission
4. ✅ Ensures start date is before expiration date
5. ✅ Validates question distribution totals 100%
6. ✅ Displays inline error messages for invalid fields
7. ✅ Prevents form submission until all validations pass
8. ✅ Shows visual indicators (green checkmark/red icon) for field validity

The validation is consistent across all forms, provides excellent user feedback, and ensures data integrity before submission to the backend.
