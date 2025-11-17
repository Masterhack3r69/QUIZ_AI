# Two-Step Quiz Join Verification

## Overview
The quiz join process has been enhanced with a 2-step verification system that allows teachers to configure what student information is required when joining a quiz.

## Features

### 1. Two-Step Join Process
Students now go through two steps when joining a quiz:

**Step 1: Quiz Code Entry** (`/join`)
- Students enter the 6-character quiz code
- System validates the code and checks quiz availability
- If valid, proceeds to Step 2

**Step 2: Student Information** (`/join/verify?code=XXXXXX`)
- Students provide their information based on teacher requirements
- Only enabled fields are shown and required
- After submission, students proceed to the quiz lobby

### 2. Configurable Requirements
Teachers can configure what information students must provide through:

**Global Settings** (`/dashboard/settings/requirements`)
- Set default requirements for all new quizzes
- Available fields:
  - First Name
  - Middle Name
  - Last Name
  - Suffix (Jr., Sr., III, etc.)
  - Student ID
  - Course
  - Year Level
  - Section
  - Email Address

**Per-Quiz Settings** (Coming soon)
- Override default requirements for specific quizzes
- Customize requirements during quiz creation

### 3. Backend Support
The Quiz model includes `studentInfoRequirements` field:
```javascript
studentInfoRequirements: {
  firstName: { type: Boolean, default: true },
  middleName: { type: Boolean, default: false },
  lastName: { type: Boolean, default: true },
  suffix: { type: Boolean, default: false },
  studentId: { type: Boolean, default: true },
  course: { type: Boolean, default: false },
  year: { type: Boolean, default: false },
  section: { type: Boolean, default: false },
  email: { type: Boolean, default: false }
}
```

The Submission model stores complete student information:
```javascript
studentInfo: {
  firstName: String,
  middleName: String,
  lastName: String,
  suffix: String,
  studentId: String,
  course: String,
  year: String,
  section: String,
  email: String
}
```

## Implementation Details

### Frontend Changes
1. **New Pages:**
   - `/app/dashboard/settings/requirements/page.tsx` - Requirements configuration
   - `/app/join/verify/page.tsx` - Student information collection

2. **Updated Pages:**
   - `/app/join/page.tsx` - Simplified to only collect quiz code
   - `/components/layout/dashboard-sidebar.tsx` - Added nested Settings menu

3. **New Components:**
   - `/components/ui/collapsible.tsx` - For collapsible sidebar sections

### Backend Changes
1. **Quiz Routes:**
   - `/validate` endpoint now returns `studentInfoRequirements`
   - `/create` endpoint accepts `studentInfoRequirements` parameter

2. **Models:**
   - Quiz model already includes `studentInfoRequirements` field
   - Submission model already includes `studentInfo` field

## Usage

### For Teachers
1. Navigate to **Dashboard > Settings > Requirements**
2. Toggle the fields you want students to provide
3. Click "Save Requirements"
4. These settings will apply to all new quizzes by default

### For Students
1. Go to the join page and enter the quiz code
2. Click "Continue"
3. Fill in the required information fields
4. Click "Continue to Quiz"
5. Start taking the quiz

## Benefits
- **Flexibility:** Teachers can collect only the information they need
- **Privacy:** Students don't have to provide unnecessary information
- **Customization:** Different quizzes can have different requirements
- **Better Data:** Structured student information for better analytics
- **User Experience:** Clear two-step process with validation at each step

## Future Enhancements
- Per-quiz requirement customization during quiz creation
- Bulk import of student information
- Integration with school management systems
- Custom field definitions
- Conditional field requirements
