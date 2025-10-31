# Loading States Implementation Guide

This document describes the comprehensive loading states implementation across the Quiz System application.

## Overview

Loading states have been implemented throughout the application to provide visual feedback during asynchronous operations, improving user experience and reducing perceived wait times.

## Components

### 1. LoadingSpinner

**Location:** `frontend/components/ui/LoadingSpinner.tsx`

A versatile spinner component for indicating loading states.

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' - Size of the spinner
- `color`: 'primary' | 'white' | 'gray' - Color theme
- `text`: Optional text to display below spinner
- `className`: Additional CSS classes

**Usage:**
```tsx
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

<LoadingSpinner size="lg" text="Loading quiz information..." />
```

**Use Cases:**
- Full-page loading states
- Modal loading states
- Inline loading indicators

---

### 2. SkeletonLoader

**Location:** `frontend/components/ui/SkeletonLoader.tsx`

Skeleton loaders for displaying placeholder content while data loads.

**Variants:**
- `text`: Simple text line skeletons
- `card`: Card-style content blocks
- `quiz-card`: Specialized quiz card grid
- `table`: Table row skeletons
- `circle`: Circular avatars/icons

**Specialized Components:**
- `QuizListSkeleton`: Pre-configured for quiz grids
- `SubmissionsTableSkeleton`: Pre-configured for submission tables
- `AnalyticsCardsSkeleton`: Pre-configured for analytics cards

**Usage:**
```tsx
import { QuizListSkeleton, SubmissionsTableSkeleton } from '@/components/ui/SkeletonLoader';

// Quiz list loading
<QuizListSkeleton count={6} />

// Submissions table loading
<SubmissionsTableSkeleton count={5} />
```

**Use Cases:**
- Dashboard quiz list loading
- Analytics page loading
- Submission tables loading
- Any list or grid content

---

### 3. ProgressBar

**Location:** `frontend/components/ui/ProgressBar.tsx`

Progress indicators for operations with known or unknown duration.

**Components:**
- `ProgressBar`: Determinate progress (0-100%)
- `IndeterminateProgressBar`: Indeterminate progress animation

**Props (ProgressBar):**
- `progress`: number (0-100)
- `size`: 'sm' | 'md' | 'lg'
- `color`: 'primary' | 'success' | 'warning' | 'danger'
- `showLabel`: boolean - Show percentage label
- `label`: Optional custom label text

**Usage:**
```tsx
import { ProgressBar, IndeterminateProgressBar } from '@/components/ui/ProgressBar';

// Determinate progress
<ProgressBar 
  progress={uploadProgress} 
  showLabel 
  label="Uploading" 
  color="primary" 
/>

// Indeterminate progress
<IndeterminateProgressBar size="md" color="primary" />
```

**Use Cases:**
- File upload progress
- Multi-step wizard progress
- Long-running operations

---

### 4. Button Loading State

**Location:** `frontend/components/ui/Button.tsx`

Buttons have built-in loading state support.

**Props:**
- `loading`: boolean - Shows spinner and disables button
- `disabled`: boolean - Disables button

**Usage:**
```tsx
import { Button } from '@/components/ui/Button';

<Button 
  variant="primary" 
  loading={isSubmitting}
  disabled={isSubmitting}
>
  {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
</Button>
```

**Use Cases:**
- Form submissions
- API calls triggered by buttons
- Any async button action

---

### 5. Input Disabled State

**Location:** `frontend/components/ui/Input.tsx`

Input fields have enhanced disabled state styling.

**Features:**
- Gray background when disabled
- Cursor not-allowed
- Reduced opacity

**Usage:**
```tsx
import { Input } from '@/components/ui/Input';

<Input
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  disabled={isSubmitting}
/>
```

**Use Cases:**
- Form inputs during submission
- Read-only fields during loading

---

## Implementation Patterns

### Pattern 1: Page-Level Loading

**Used in:** Dashboard, Quiz Management, Analytics

```tsx
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    setIsLoading(true);
    const data = await apiClient.getData();
    setData(data);
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};

if (isLoading) {
  return <QuizListSkeleton count={6} />;
}
```

### Pattern 2: Button Action Loading

**Used in:** Forms, Delete Actions, Export Actions

```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  try {
    setIsSubmitting(true);
    await apiClient.submitData(data);
    showSuccess('Success!');
  } catch (error) {
    showError(error.message);
  } finally {
    setIsSubmitting(false);
  }
};

<Button loading={isSubmitting} disabled={isSubmitting}>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</Button>
```

### Pattern 3: File Upload Progress

**Used in:** Quiz Creation

```tsx
const [uploadProgress, setUploadProgress] = useState(0);
const [isUploading, setIsUploading] = useState(false);

<FileUpload
  onFileSelect={handleFileSelect}
  selectedFile={selectedFile}
  uploadProgress={uploadProgress}
  isUploading={isUploading}
/>
```

### Pattern 4: Multi-Stage Processing

**Used in:** Quiz Creation AI Processing

```tsx
const [processingStage, setProcessingStage] = useState<'extracting' | 'generating' | 'complete'>('extracting');

<div className="text-center">
  <LoadingSpinner size="lg" />
  <h3>
    {processingStage === 'extracting' && 'Extracting content...'}
    {processingStage === 'generating' && 'Generating questions...'}
    {processingStage === 'complete' && 'Complete!'}
  </h3>
</div>
```

---

## Pages with Loading States

### ✅ Implemented

1. **Dashboard Home** (`/dashboard`)
   - Quiz list skeleton loader
   - Empty state handling

2. **Quiz Management** (`/dashboard/quiz/[quizId]`)
   - Page skeleton loader
   - Edit modal with button loading
   - Delete modal with button loading

3. **Analytics** (`/dashboard/quiz/[quizId]/results`)
   - Analytics cards skeleton
   - Submissions table skeleton
   - Export button loading states

4. **Quiz Creation** (`/dashboard/create`)
   - File upload with progress
   - AI processing with multi-stage indicators
   - Form submission loading

5. **Login/Register** (`/login`, `/register`)
   - Button loading states
   - Input disabled states during submission

6. **Join Quiz** (`/join`)
   - Button loading state
   - Input disabled states

7. **Quiz Lobby** (`/quiz/[code]/start`)
   - Full-page loading spinner
   - Start button loading state

---

## Best Practices

### 1. Always Set Loading State

```tsx
// ✅ Good
const loadData = async () => {
  try {
    setIsLoading(true);
    const data = await apiClient.getData();
  } finally {
    setIsLoading(false); // Always in finally block
  }
};

// ❌ Bad
const loadData = async () => {
  setIsLoading(true);
  const data = await apiClient.getData();
  setIsLoading(false); // Won't run if error occurs
};
```

### 2. Disable Interactive Elements

```tsx
// ✅ Good - Disable during loading
<Button loading={isLoading} disabled={isLoading}>
  Submit
</Button>

<Input disabled={isLoading} />

// ❌ Bad - User can interact during loading
<Button loading={isLoading}>Submit</Button>
```

### 3. Use Appropriate Loading Indicators

```tsx
// ✅ Good - Skeleton for lists
if (isLoading) {
  return <QuizListSkeleton count={6} />;
}

// ❌ Bad - Spinner for lists (jarring)
if (isLoading) {
  return <LoadingSpinner />;
}
```

### 4. Provide Context

```tsx
// ✅ Good - Tell user what's happening
<LoadingSpinner text="Loading quiz information..." />

// ❌ Bad - No context
<LoadingSpinner />
```

### 5. Handle Long Operations

```tsx
// ✅ Good - Show progress for long operations
<ProgressBar progress={uploadProgress} showLabel />

// ❌ Bad - No feedback for long operations
<LoadingSpinner />
```

---

## Accessibility

All loading components include proper ARIA attributes:

- `role="status"` on spinners
- `aria-label="Loading"` on progress indicators
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax` on progress bars
- `aria-busy="true"` on loading containers (where applicable)

---

## Animation Performance

All animations use CSS transforms and opacity for optimal performance:

```css
/* Spinner animation */
.animate-spin {
  animation: spin 1s linear infinite;
}

/* Skeleton pulse */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Indeterminate progress */
.animate-indeterminate-progress {
  animation: indeterminate-progress 1.5s ease-in-out infinite;
}
```

---

## Testing Checklist

When implementing loading states:

- [ ] Loading state shows immediately on action
- [ ] Loading state clears on success
- [ ] Loading state clears on error
- [ ] Interactive elements are disabled during loading
- [ ] Loading indicator is appropriate for the context
- [ ] User receives feedback about what's loading
- [ ] Loading state doesn't block error messages
- [ ] Loading state works on slow connections
- [ ] Loading state is accessible (screen readers)
- [ ] Loading animations are smooth (60fps)

---

## Future Enhancements

Potential improvements for loading states:

1. **Optimistic Updates**: Update UI immediately, revert on error
2. **Retry Mechanisms**: Allow users to retry failed operations
3. **Offline Detection**: Show specific message when offline
4. **Loading Priorities**: Show critical content first
5. **Prefetching**: Load data before user needs it
6. **Caching**: Reduce loading frequency with smart caching

---

## Summary

The application now has comprehensive loading states across all major user flows:

- **Spinners** for simple loading states
- **Skeletons** for content placeholders
- **Progress bars** for tracked operations
- **Button states** for action feedback
- **Input states** for form submission

This provides users with clear feedback during all asynchronous operations, improving perceived performance and user experience.
