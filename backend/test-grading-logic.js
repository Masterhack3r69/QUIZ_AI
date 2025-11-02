import Submission from './src/models/Submission.model.js';

console.log('Testing Grading Logic for All Question Types\n');
console.log('='.repeat(60));

// Test 1: Multiple Choice
console.log('\nTest 1: Multiple Choice Questions');
console.log('-'.repeat(60));
const mcQuestion = {
  type: 'multipleChoice',
  question: 'What is 2 + 2?',
  options: ['3', '4', '5', '6'],
  correctAnswer: 1
};

console.log('Question:', mcQuestion.question);
console.log('Correct answer index:', mcQuestion.correctAnswer);
console.log('Test answer 1 (correct):', Submission.gradeAnswer(mcQuestion, 1) ? '✓ PASS' : '✗ FAIL');
console.log('Test answer 0 (incorrect):', !Submission.gradeAnswer(mcQuestion, 0) ? '✓ PASS' : '✗ FAIL');
console.log('Test answer 2 (incorrect):', !Submission.gradeAnswer(mcQuestion, 2) ? '✓ PASS' : '✗ FAIL');

// Test 2: True/False
console.log('\nTest 2: True/False Questions');
console.log('-'.repeat(60));
const tfQuestion = {
  type: 'trueFalse',
  question: 'The Earth is flat.',
  correctAnswer: false
};

console.log('Question:', tfQuestion.question);
console.log('Correct answer:', tfQuestion.correctAnswer);
console.log('Test answer false (correct):', Submission.gradeAnswer(tfQuestion, false) ? '✓ PASS' : '✗ FAIL');
console.log('Test answer true (incorrect):', !Submission.gradeAnswer(tfQuestion, true) ? '✓ PASS' : '✗ FAIL');

// Test 3: Fill in the Blank (case insensitive)
console.log('\nTest 3: Fill in the Blank (Case Insensitive)');
console.log('-'.repeat(60));
const fibQuestion = {
  type: 'fillInBlank',
  question: 'The capital of France is ___.',
  correctAnswer: 'Paris',
  caseSensitive: false
};

console.log('Question:', fibQuestion.question);
console.log('Correct answer:', fibQuestion.correctAnswer);
console.log('Case sensitive:', fibQuestion.caseSensitive);
console.log('Test "Paris" (correct):', Submission.gradeAnswer(fibQuestion, 'Paris') ? '✓ PASS' : '✗ FAIL');
console.log('Test "paris" (correct, case insensitive):', Submission.gradeAnswer(fibQuestion, 'paris') ? '✓ PASS' : '✗ FAIL');
console.log('Test "PARIS" (correct, case insensitive):', Submission.gradeAnswer(fibQuestion, 'PARIS') ? '✓ PASS' : '✗ FAIL');
console.log('Test " Paris " (correct, with spaces):', Submission.gradeAnswer(fibQuestion, ' Paris ') ? '✓ PASS' : '✗ FAIL');
console.log('Test "London" (incorrect):', !Submission.gradeAnswer(fibQuestion, 'London') ? '✓ PASS' : '✗ FAIL');

// Test 4: Fill in the Blank (case sensitive)
console.log('\nTest 4: Fill in the Blank (Case Sensitive)');
console.log('-'.repeat(60));
const fibCaseSensitive = {
  type: 'fillInBlank',
  question: 'The chemical symbol for gold is ___.',
  correctAnswer: 'Au',
  caseSensitive: true
};

console.log('Question:', fibCaseSensitive.question);
console.log('Correct answer:', fibCaseSensitive.correctAnswer);
console.log('Case sensitive:', fibCaseSensitive.caseSensitive);
console.log('Test "Au" (correct):', Submission.gradeAnswer(fibCaseSensitive, 'Au') ? '✓ PASS' : '✗ FAIL');
console.log('Test "au" (incorrect, case sensitive):', !Submission.gradeAnswer(fibCaseSensitive, 'au') ? '✓ PASS' : '✗ FAIL');
console.log('Test "AU" (incorrect, case sensitive):', !Submission.gradeAnswer(fibCaseSensitive, 'AU') ? '✓ PASS' : '✗ FAIL');

// Test 5: Matching
console.log('\nTest 5: Matching Questions');
console.log('-'.repeat(60));
const matchingQuestion = {
  type: 'matching',
  question: 'Match the countries with their capitals',
  leftColumn: ['France', 'Germany', 'Italy'],
  rightColumn: ['Berlin', 'Rome', 'Paris'],
  correctPairs: [
    { left: 0, right: 2 }, // France -> Paris
    { left: 1, right: 0 }, // Germany -> Berlin
    { left: 2, right: 1 }  // Italy -> Rome
  ]
};

console.log('Question:', matchingQuestion.question);
console.log('Correct pairs:', matchingQuestion.correctPairs);

const correctAnswer = [
  { left: 0, right: 2 },
  { left: 1, right: 0 },
  { left: 2, right: 1 }
];
console.log('Test correct pairs:', Submission.gradeAnswer(matchingQuestion, correctAnswer) ? '✓ PASS' : '✗ FAIL');

const incorrectAnswer1 = [
  { left: 0, right: 0 }, // Wrong
  { left: 1, right: 1 }, // Wrong
  { left: 2, right: 2 }  // Wrong
];
console.log('Test all incorrect pairs:', !Submission.gradeAnswer(matchingQuestion, incorrectAnswer1) ? '✓ PASS' : '✗ FAIL');

const partialAnswer = [
  { left: 0, right: 2 }, // Correct
  { left: 1, right: 0 }  // Correct but missing one
];
console.log('Test partial answer (missing pairs):', !Submission.gradeAnswer(matchingQuestion, partialAnswer) ? '✓ PASS' : '✗ FAIL');

const tooManyPairs = [
  { left: 0, right: 2 },
  { left: 1, right: 0 },
  { left: 2, right: 1 },
  { left: 0, right: 1 }  // Extra pair
];
console.log('Test too many pairs:', !Submission.gradeAnswer(matchingQuestion, tooManyPairs) ? '✓ PASS' : '✗ FAIL');

const shuffledCorrect = [
  { left: 2, right: 1 }, // Order doesn't matter
  { left: 0, right: 2 },
  { left: 1, right: 0 }
];
console.log('Test shuffled correct pairs:', Submission.gradeAnswer(matchingQuestion, shuffledCorrect) ? '✓ PASS' : '✗ FAIL');

// Test 6: Edge cases
console.log('\nTest 6: Edge Cases');
console.log('-'.repeat(60));
console.log('Test invalid question type:', !Submission.gradeAnswer({ type: 'invalid' }, 'answer') ? '✓ PASS' : '✗ FAIL');
console.log('Test fillInBlank with non-string answer:', !Submission.gradeAnswer(fibQuestion, 123) ? '✓ PASS' : '✗ FAIL');
console.log('Test matching with non-array answer:', !Submission.gradeAnswer(matchingQuestion, 'not an array') ? '✓ PASS' : '✗ FAIL');

console.log('\n' + '='.repeat(60));
console.log('All tests completed!\n');
