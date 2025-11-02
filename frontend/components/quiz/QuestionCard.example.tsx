/**
 * Example usage of the QuestionCard component with all question types
 * This file demonstrates how to use the QuestionCard component for different question types
 */

import { QuestionCard } from './QuestionCard';
import type { Question } from '@/types';

// Example Multiple Choice Question
const multipleChoiceQuestion: Question = {
  _id: '1',
  type: 'multipleChoice',
  question: 'What is the capital of France?',
  options: ['London', 'Berlin', 'Paris', 'Madrid'],
  correctAnswer: 2,
};

// Example True/False Question
const trueFalseQuestion: Question = {
  _id: '2',
  type: 'trueFalse',
  question: 'The Earth is flat.',
  correctAnswer: false,
};

// Example Fill-in-the-Blank Question
const fillInBlankQuestion: Question = {
  _id: '3',
  type: 'fillInBlank',
  question: 'The chemical symbol for water is _____.',
  correctAnswer: 'H2O',
  caseSensitive: false,
};

// Example Matching Question
const matchingQuestion: Question = {
  _id: '4',
  type: 'matching',
  question: 'Match each country with its capital:',
  leftColumn: ['France', 'Germany', 'Italy', 'Spain'],
  rightColumn: ['Berlin', 'Rome', 'Madrid', 'Paris'],
  correctPairs: [
    { left: 0, right: 3 }, // France -> Paris
    { left: 1, right: 0 }, // Germany -> Berlin
    { left: 2, right: 1 }, // Italy -> Rome
    { left: 3, right: 2 }, // Spain -> Madrid
  ],
};

// Example usage in a quiz taking interface
export function QuizTakingExample() {
  const [answer, setAnswer] = React.useState<any>(undefined);

  return (
    <div className="p-8">
      <QuestionCard
        question={multipleChoiceQuestion}
        selectedAnswer={answer}
        onSelectAnswer={setAnswer}
        questionNumber={1}
        totalQuestions={10}
      />
    </div>
  );
}

// Example usage in a results review interface
export function ResultsReviewExample() {
  const studentAnswer = 1; // Student selected "Berlin" (incorrect)

  return (
    <div className="p-8">
      <QuestionCard
        question={multipleChoiceQuestion}
        selectedAnswer={studentAnswer}
        onSelectAnswer={() => {}} // No-op in review mode
        questionNumber={1}
        totalQuestions={10}
        showCorrectAnswer={true}
        isReview={true}
      />
    </div>
  );
}
