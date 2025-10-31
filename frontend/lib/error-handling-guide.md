# Error Handling Guide

This document explains how to use the comprehensive error handling system in the application.

## Overview

The application has a multi-layered error handling approach:

1. **Global Error Boundary** - Catches React component errors
2. **Toast Notifications** - User-friendly error messages
3. **API Error Handling** - Automatic error detection and formatting
4. **Network Error Detection** - Handles connection issues

## Components

### 1. Error Boundary

The `ErrorBoundary` component wraps the entire application and catches any JavaScript errors in the component tree.

**Location**: `frontend/components/ErrorBoundary.tsx`

**Features**:
- Catches and displays React component errors
- Shows user-friendly error UI
- Provides "Try Again" and "Reload Page" options
- Shows detailed error info in development mode

**Usage**: Already configured in `app/layout.tsx` - no additional setup needed.

### 2. Toast Context

The `ToastContext` provides a global toast notification system for displaying messages to users.

**Location**: `frontend/contexts/ToastContext.tsx`

**Usage**:

```tsx
import { useToast } from '@/contexts/ToastContext';

function MyComponent() {
  const { showError, showSuccess, showWarning, showInfo } = useToast();

  const handleAction = async () => {
    try {
      await someApiCall();
      showSuccess('Operation completed successfully!');
    } catch (error) {
      showError('Something went wrong. Please try again.');
    }
  };

  return <button onClick={handleAction}>Do Something</button>;
}
```

**Available Methods**:
- `showSuccess(message, duration?)` - Green success toast
- `showError(message, duration?)` - Red error toast
- `showWarning(message, duration?)` - Yellow warning toast
- `showInfo(message, duration?)` - Blue info toast
- `showToast(type, message, duration?)` - Generic toast

### 3. API Error Handling

The API client automatically handles errors and provides user-friendly messages.

**Location**: `frontend/lib/api.ts`

**Features**:
- Automatic HTTP status code handling
- Network error detection
- Session expiration handling (401)
- User-friendly error messages for common status codes

**Error Messages by Status Code**:
- `400` - Invalid request
- `401` - Session expired (auto-redirects to login)
- `403` - Permission denied
- `404` - Resource not found
- `409` - Conflict (e.g., duplicate resource)
- `422` - Validation failed
- `500` - Server error
- `502/503/504` - Server unavailable
- Network errors - Connection error

**Usage Example**:

```tsx
import { apiClient, APIRequestError } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

function MyComponent() {
  const { showError, showSuccess } = useToast();

  const loadData = async () => {
    try {
      const data = await apiClient.getMyQuizzes();
      showSuccess('Data loaded successfully!');
      return data;
    } catch (error) {
      if (error instanceof APIRequestError) {
        // Error message is already user-friendly
        showError(error.message);
        
        // You can also check the status code
        if (error.status === 404) {
          // Handle 404 specifically
        }
      } else {
        showError('An unexpected error occurred');
      }
    }
  };

  return <button onClick={loadData}>Load Data</button>;
}
```

## Best Practices

### 1. Always Use Try-Catch with API Calls

```tsx
// ✅ Good
try {
  const result = await apiClient.someMethod();
  showSuccess('Success!');
} catch (error) {
  if (error instanceof APIRequestError) {
    showError(error.message);
  } else {
    showError('An unexpected error occurred');
  }
}

// ❌ Bad - No error handling
const result = await apiClient.someMethod();
```

### 2. Use Appropriate Toast Types

```tsx
// Success - for completed actions
showSuccess('Quiz created successfully!');

// Error - for failures
showError('Failed to save changes');

// Warning - for non-critical issues
showWarning('Your session will expire in 5 minutes');

// Info - for informational messages
showInfo('New features available!');
```

### 3. Handle Specific Error Cases

```tsx
try {
  await apiClient.deleteQuiz(quizId);
  showSuccess('Quiz deleted');
} catch (error) {
  if (error instanceof APIRequestError) {
    if (error.status === 404) {
      showError('Quiz not found');
    } else if (error.status === 403) {
      showError('You do not have permission to delete this quiz');
    } else {
      showError(error.message);
    }
  }
}
```

### 4. Provide Context in Error Messages

```tsx
// ✅ Good - Specific and actionable
showError('Failed to upload file. Please ensure it is a PDF, DOCX, or PPT file.');

// ❌ Bad - Too generic
showError('Error');
```

### 5. Don't Show Multiple Toasts for the Same Error

```tsx
// ✅ Good
try {
  await apiClient.createQuiz(formData);
  showSuccess('Quiz created!');
} catch (error) {
  if (error instanceof APIRequestError) {
    showError(error.message); // Show once
  }
}

// ❌ Bad
try {
  await apiClient.createQuiz(formData);
} catch (error) {
  showError('Failed to create quiz'); // First toast
  if (error instanceof APIRequestError) {
    showError(error.message); // Second toast - confusing!
  }
}
```

## Automatic Features

### Session Expiration (401 Errors)

When a 401 error occurs:
1. The API client triggers a `session-expired` event
2. The `AuthContext` listens for this event
3. User is automatically redirected to `/login?expired=true`
4. A warning toast is shown on the login page

**No manual handling required** - this happens automatically.

### Network Errors

Network errors (no internet, DNS failure, CORS issues) are automatically detected and show:
> "Network error. Please check your internet connection and try again."

### Error Boundary

If a React component throws an error:
1. The Error Boundary catches it
2. A full-page error UI is shown
3. User can try again or reload the page
4. In development, detailed error info is displayed

## Testing Error Handling

### Test Network Errors
```tsx
// Disconnect from internet and try an API call
// Should show: "Network error. Please check your internet connection..."
```

### Test 404 Errors
```tsx
// Try to access a non-existent resource
await apiClient.getQuiz('invalid-id');
// Should show: "The requested resource was not found."
```

### Test Session Expiration
```tsx
// Clear auth token and make an authenticated request
// Should redirect to login with warning message
```

## Common Patterns

### Form Submission with Validation

```tsx
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  
  // Client-side validation
  if (!validateForm()) {
    showError('Please fill in all required fields');
    return;
  }
  
  setIsLoading(true);
  
  try {
    await apiClient.createQuiz(formData);
    showSuccess('Quiz created successfully!');
    router.push('/dashboard');
  } catch (error) {
    if (error instanceof APIRequestError) {
      showError(error.message);
    } else {
      showError('Failed to create quiz. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};
```

### Loading Data on Mount

```tsx
useEffect(() => {
  const loadData = async () => {
    try {
      const data = await apiClient.getMyQuizzes();
      setQuizzes(data);
    } catch (error) {
      if (error instanceof APIRequestError) {
        showError(error.message);
      } else {
        showError('Failed to load quizzes');
      }
    }
  };
  
  loadData();
}, [showError]);
```

### Delete Confirmation

```tsx
const handleDelete = async (quizId: string) => {
  if (!confirm('Are you sure you want to delete this quiz?')) {
    return;
  }
  
  try {
    await apiClient.deleteQuiz(quizId);
    showSuccess('Quiz deleted successfully');
    // Refresh list
    await loadQuizzes();
  } catch (error) {
    if (error instanceof APIRequestError) {
      showError(error.message);
    } else {
      showError('Failed to delete quiz');
    }
  }
};
```

## Summary

The error handling system is designed to:
- Provide consistent, user-friendly error messages
- Handle common error scenarios automatically
- Make it easy for developers to add error handling
- Improve user experience with clear feedback

All API calls are wrapped with try-catch and use toast notifications for errors. The system handles network issues, session expiration, and various HTTP status codes automatically.
