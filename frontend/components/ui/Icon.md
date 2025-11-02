# Icon Component

A reusable SVG icon component library for the AI Quiz Generator application.

## Usage

```tsx
import { Icon } from '@/components/ui';

// Basic usage
<Icon name="home" />

// With size
<Icon name="check" size="lg" />

// With custom className
<Icon name="edit" className="text-blue-600 mr-2" />

// With aria-label for accessibility
<Icon name="close" aria-label="Close dialog" />
```

## Available Icons

### Navigation
- `home` - Home icon
- `arrow-right` - Right arrow
- `arrow-left` - Left arrow
- `menu` - Hamburger menu
- `close` - Close/X icon

### Actions
- `plus` - Add/Create
- `edit` - Edit/Pencil
- `upload` - Upload file
- `download` - Download
- `copy` - Copy to clipboard
- `check` - Checkmark/Success
- `settings` - Settings/Gear
- `logout` - Logout/Exit

### Content
- `document` - Document/Text file
- `file-pdf` - PDF file
- `file-excel` - Excel/Spreadsheet file
- `books` - Books/Library
- `pencil` - Pencil/Write

### Status
- `error` - Error/Alert circle
- `warning` - Warning triangle
- `info` - Information
- `clock` - Time/Clock

### Users
- `teacher` - Teacher/User
- `student` - Student/Users
- `graduation-cap` - Graduation cap/Education
- `target` - Target/Goal
- `chart` - Chart/Analytics

## Sizes

- `xs` - 12px (w-3 h-3)
- `sm` - 16px (w-4 h-4)
- `md` - 20px (w-5 h-5) - Default
- `lg` - 24px (w-6 h-6)
- `xl` - 32px (w-8 h-8)

## Props

```typescript
interface IconProps {
  name: IconName;           // Required: Icon name
  className?: string;       // Optional: Additional CSS classes
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';  // Optional: Icon size (default: 'md')
  'aria-label'?: string;    // Optional: Accessibility label
}
```

## Examples

### Button with Icon
```tsx
<Button>
  <Icon name="plus" className="mr-2" />
  Create New Quiz
</Button>
```

### Icon with Color
```tsx
<Icon name="check" className="text-green-600" />
<Icon name="error" className="text-red-600" />
```

### Large Icon
```tsx
<div className="flex justify-center">
  <Icon name="graduation-cap" className="w-16 h-16 text-blue-600" />
</div>
```

## Accessibility

Always provide an `aria-label` when the icon conveys important information that isn't otherwise available in text:

```tsx
<button onClick={handleClose}>
  <Icon name="close" aria-label="Close dialog" />
</button>
```

For decorative icons next to text, the aria-label is optional:

```tsx
<Button>
  <Icon name="edit" />
  Edit Settings
</Button>
```
