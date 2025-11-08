# Loading and Error States Implementation Guide

This document describes the comprehensive loading and error state patterns implemented throughout the application.

## Overview

The application now has consistent, reusable components for handling:
- Loading states with skeleton loaders
- Error states with retry functionality
- Empty states for lists and tables
- Network error dialogs
- Button loading states

## Components

### 1. Loading States (`components/shared/LoadingState.tsx`)

#### LoadingState
Basic loading spinner with optional message.

```tsx
import { LoadingState } from '@/components/shared/LoadingState';

<LoadingState message="Loading data..." />
```

#### CardLoadingSkeleton
Skeleton loader for card grids (e.g., quiz cards on dashboard).

```tsx
import { CardLoadingSkeleton } from '@/components/shared/LoadingState';

<CardLoadingSkeleton count={6} />
```

#### TableLoadingSkeleton
Skeleton loader for tables.

```tsx
import { TableLoadingSkeleton } from '@/components/shared/LoadingState';

<TableLoadingSkeleton rows={5} columns={4} />
```

#### StatsCardSkeleton
Skeleton loader for statistics cards.

```tsx
import { StatsCardSkeleton } from '@/components/shared/LoadingState';

<StatsCardSkeleton count={4} />
```

#### PageLoadingSkeleton
Full page skeleton with header and card grid.

```tsx
import { PageLoadingSkeleton } from '@/components/shared/LoadingState';

if (isLoading) return <PageLoadingSkeleton />;
```

#### DetailPageLoadingSkeleton
Skeleton for detail pages with sidebar layout.

```tsx
import { DetailPageLoadingSkeleton } from '@/components/shared/LoadingState';

if (isLoading) return <DetailPageLoadingSkeleton />;
```

### 2. Error States (`components/shared/ErrorAlert.tsx`)

#### ErrorAlert
Alert component for displaying errors with optional retry button.

```tsx
import { ErrorAlert } from '@/components/shared/ErrorAlert';

<ErrorAlert
  title="Failed to Load Data"
  message={error}
  onRetry={loadData}
  retryLabel="Try Again"
/>
```

Features:
- Automatically detects network errors and shows appropriate icon
- Optional retry button
- Customizable title and message
- Supports both default and destructive variants

#### NetworkErrorDialog
Modal dialog for critical network errors.

```tsx
import { NetworkErrorDialog } from '@/components/shared/ErrorAlert';

<NetworkErrorDialog
  open={showNetworkError}
  onRetry={retryConnection}
  onCancel={() => setShowNetworkError(false)}
  message="Unable to connect to the server."
/>
```

### 3. Empty States (`components/shared/EmptyState.tsx`)

#### EmptyState
Card-based empty state with optional action button.

```tsx
import { EmptyState } from '@/components/shared/EmptyState';
import { FileQuestion, Plus } from 'lucide-react';

<EmptyState
  icon={FileQuestion}
  title="No quizzes yet"
  description="Get started by creating your first quiz"
  actionLabel="Create Quiz"
  actionIcon={Plus}
  onAction={() => router.push('/dashboard/create')}
/>
```

#### TableEmptyState
Empty state for tables (without card wrapper).

```tsx
import { TableEmptyState } from '@/components/shared/EmptyState';
import { Users } from 'lucide-react';

<TableEmptyState
  icon={Users}
  title="No submissions yet"
  description="Students haven't taken this quiz yet"
/>
```

## Hooks

### useAsyncAction

Hook for managing async operations with loading and error states.

```tsx
import { useAsyncAction } from '@/hooks/use-async-action';

const { isLoading, error, execute } = useAsyncAction(
  async (quizId: string) => {
    return await apiClient.deleteQuiz(quizId);
  },
  {
    successMessage: 'Quiz deleted successfully',
    errorMessage: 'Failed to delete quiz',
    onSuccess: () => router.push('/dashboard'),
  }
);

// Use it
<Button onClick={() => execute(quizId)} disabled={isLoading}>
  {isLoading ? 'Deleting...' : 'Delete Quiz'}
</Button>
```

### useAsyncState

Simpler hook for managing loading and error states manually.

```tsx
import { useAsyncState } from '@/hooks/use-async-action';

const { isLoading, error, startLoading, stopLoading, setError } = useAsyncState();

const loadData = async () => {
  startLoading();
  try {
    const data = await apiClient.getData();
    stopLoading();
  } catch (err) {
    setError(err.message);
  }
};
```

## Implementation Patterns

### Page Loading Pattern

```tsx
export default function MyPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiClient.getData();
      setData(result);
    } catch (err) {
      const message = err instanceof APIRequestError 
        ? err.message 
        : 'Failed to load data';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return <PageLoadingSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <ErrorAlert
        title="Failed to Load"
        message={error}
        onRetry={loadData}
      />
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="No data"
        description="Get started by adding some data"
      />
    );
  }

  // Success state
  return <div>{/* Render data */}</div>;
}
```

### Button Loading Pattern

```tsx
<Button onClick={handleSubmit} disabled={isLoading}>
  {isLoading && (
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  )}
  {isLoading ? 'Saving...' : 'Save Changes'}
</Button>
```

Or using a spinner SVG:

```tsx
<Button onClick={handleSubmit} disabled={isLoading}>
  {isLoading && (
    <svg
      className="mr-2 h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )}
  {isLoading ? 'Processing...' : 'Submit'}
</Button>
```

### Form Loading Pattern

```tsx
<form onSubmit={handleSubmit}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input {...field} disabled={isLoading} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
  
  <Button type="submit" disabled={isLoading}>
    {isLoading ? 'Submitting...' : 'Submit'}
  </Button>
</form>
```

## Best Practices

### 1. Always Clear Errors on Retry
```tsx
const loadData = async () => {
  setError(null); // Clear previous errors
  setIsLoading(true);
  // ... rest of logic
};
```

### 2. Provide Meaningful Error Messages
```tsx
catch (err) {
  let errorMessage = 'Failed to load data';
  if (err instanceof APIRequestError) {
    errorMessage = err.message;
  } else if (err.message.includes('network')) {
    errorMessage = 'Network error. Please check your connection.';
  }
  setError(errorMessage);
}
```

### 3. Use Appropriate Loading Skeletons
- Use `CardLoadingSkeleton` for card grids
- Use `TableLoadingSkeleton` for tables
- Use `PageLoadingSkeleton` for full pages
- Use `DetailPageLoadingSkeleton` for detail pages with sidebars

### 4. Disable Interactive Elements During Loading
```tsx
<Button disabled={isLoading} />
<Input disabled={isLoading} />
<Select disabled={isLoading} />
```

### 5. Show Loading State on Buttons
Always show a loading indicator on buttons that trigger async actions:
```tsx
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Loading...' : 'Click Me'}
</Button>
```

## Accessibility

All loading and error states include proper accessibility features:

- Loading states have `role="status"` and `aria-live="polite"`
- Error alerts use appropriate ARIA attributes
- Screen reader text is provided where needed
- Focus management is handled correctly

Example:
```tsx
<div role="status" aria-live="polite" aria-label="Loading data">
  <CardLoadingSkeleton count={6} />
  <span className="sr-only">Loading your data...</span>
</div>
```

## Testing

When testing components with loading and error states:

1. Test the loading state renders correctly
2. Test the error state with retry functionality
3. Test the empty state when no data exists
4. Test the success state with data
5. Test that buttons are disabled during loading
6. Test that errors are cleared on retry

## Examples in the Codebase

- **Dashboard Page**: `frontend/app/dashboard/page.tsx`
- **Quiz Management**: `frontend/app/dashboard/quiz/[quizId]/page.tsx`
- **Quiz Results**: `frontend/app/dashboard/quiz/[quizId]/results/page.tsx`
- **Settings Page**: `frontend/app/dashboard/settings/page.tsx`

## Migration Guide

To update existing pages to use these patterns:

1. Import the appropriate components:
   ```tsx
   import { ErrorAlert } from '@/components/shared/ErrorAlert';
   import { CardLoadingSkeleton } from '@/components/shared/LoadingState';
   import { EmptyState } from '@/components/shared/EmptyState';
   ```

2. Add error state to your component:
   ```tsx
   const [error, setError] = useState<string | null>(null);
   ```

3. Update your data loading function:
   ```tsx
   const loadData = async () => {
     try {
       setIsLoading(true);
       setError(null); // Add this
       // ... existing logic
     } catch (err) {
       setError(err.message); // Add this
     } finally {
       setIsLoading(false);
     }
   };
   ```

4. Replace custom loading UI with skeleton components
5. Add error state rendering with retry functionality
6. Add empty state for when no data exists

## Future Enhancements

Potential improvements for the future:

- Add animation transitions between states
- Implement optimistic UI updates
- Add retry with exponential backoff
- Implement offline detection and queuing
- Add progress indicators for long-running operations
- Create specialized skeletons for specific page layouts
