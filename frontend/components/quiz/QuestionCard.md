# QuestionCard Component

A versatile component for displaying and interacting with different types of quiz questions.

## Features

- **Multiple Question Types**: Supports Multiple Choice, True/False, Fill-in-the-Blank, and Matching questions
- **Interactive**: Handles answer selection for all question types
- **Review Mode**: Shows correct/incorrect answers with visual indicators
- **Accessible**: ARIA labels and keyboard navigation support
- **Responsive**: Works on mobile, tablet, and desktop devices
- **Type Badge**: Displays question type indicator for each question

## Question Types

### 1. Multiple Choice
- Displays question text with 4 options (A, B, C, D)
- Renders as radio buttons for single selection
- Shows correct answer with green checkmark in review mode
- Shows incorrect answer with red X in review mode

### 2. True or False
- Displays question statement
- Renders as two prominent buttons (True/False)
- Large touch-friendly buttons with icons
- Clear visual feedback for selection

### 3. Fill-in-the-Blank
- Displays question text with blank indicator
- Renders text input field for answer
- Supports case-insensitive matching
- Shows correct answer in review mode if student was wrong

### 4. Matching
- Displays two columns of items
- Uses dropdown interface for pairing items
- Validates that all items are paired
- Shows correct pairs in review mode
- Mobile-friendly with stacked layout on small screens

## Props

```typescript
interface QuestionCardProps {
  question: Question;                    // The question object (typed union)
  selectedAnswer?: any;                  // Current selected answer (type varies by question type)
  onSelectAnswer: (answer: any) => void; // Callback when answer is selected
  questionNumber: number;                // Current question number (1-indexed)
  totalQuestions: number;                // Total number of questions in quiz
  showCorrectAnswer?: boolean;           // Whether to show correct answers (review mode)
  isReview?: boolean;                    // Whether in review mode
}
```

## Answer Types by Question Type

- **Multiple Choice**: `number` (index of selected option, 0-3)
- **True/False**: `boolean` (true or false)
- **Fill-in-the-Blank**: `string` (text answer)
- **Matching**: `{ left: number; right: number }[]` (array of pairs)

## Usage Examples

### Quiz Taking Mode

```tsx
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { useState } from 'react';

function QuizPage() {
  const [answer, setAnswer] = useState<any>(undefined);
  
  const question = {
    _id: '1',
    type: 'multipleChoice',
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correctAnswer: 1,
  };

  return (
    <QuestionCard
      question={question}
      selectedAnswer={answer}
      onSelectAnswer={setAnswer}
      questionNumber={1}
      totalQuestions={10}
    />
  );
}
```

### Results Review Mode

```tsx
import { QuestionCard } from '@/components/quiz/QuestionCard';

function ResultsPage() {
  const question = {
    _id: '1',
    type: 'trueFalse',
    question: 'The sky is blue.',
    correctAnswer: true,
  };
  
  const studentAnswer = false; // Student answered incorrectly

  return (
    <QuestionCard
      question={question}
      selectedAnswer={studentAnswer}
      onSelectAnswer={() => {}} // No-op in review mode
      questionNumber={1}
      totalQuestions={10}
      showCorrectAnswer={true}
      isReview={true}
    />
  );
}
```

### Matching Question Example

```tsx
const matchingQuestion = {
  _id: '4',
  type: 'matching',
  question: 'Match each country with its capital:',
  leftColumn: ['France', 'Germany', 'Italy'],
  rightColumn: ['Berlin', 'Rome', 'Paris'],
  correctPairs: [
    { left: 0, right: 2 }, // France -> Paris
    { left: 1, right: 0 }, // Germany -> Berlin
    { left: 2, right: 1 }, // Italy -> Rome
  ],
};

// Student's answer
const studentPairs = [
  { left: 0, right: 2 }, // Correct
  { left: 1, right: 1 }, // Wrong
  { left: 2, right: 0 }, // Wrong
];

<QuestionCard
  question={matchingQuestion}
  selectedAnswer={studentPairs}
  onSelectAnswer={setPairs}
  questionNumber={5}
  totalQuestions={10}
/>
```

## Styling

The component uses Tailwind CSS with the following color scheme:

- **Selected**: Blue (bg-blue-50, border-blue-500)
- **Correct**: Green (bg-green-50, border-green-500)
- **Incorrect**: Red (bg-red-50, border-red-500)
- **Unselected**: Gray (bg-white, border-gray-300)

## Accessibility

- Proper ARIA labels for all interactive elements
- Keyboard navigation support (Tab, Enter, Space)
- Screen reader friendly with descriptive labels
- Focus indicators on all focusable elements
- Semantic HTML with proper roles (radio, button, etc.)

## Responsive Design

- Mobile (< 640px): Stacked layout, full-width buttons
- Tablet (640-1024px): Optimized spacing and font sizes
- Desktop (> 1024px): Full layout with optimal spacing

## Validation

### Matching Questions
- Warns if not all items are paired
- Prevents submission until all pairs are complete
- Shows validation message in amber color

### Fill-in-the-Blank
- Trims whitespace from answers
- Case-insensitive comparison (unless caseSensitive flag is set)
- Shows correct answer if student was wrong

## Notes

- The component handles state internally for matching questions
- All other question types rely on parent component for state management
- Review mode disables all interactions
- Question type badge is always visible for clarity
