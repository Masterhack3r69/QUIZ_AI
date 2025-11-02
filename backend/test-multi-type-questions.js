import { generateQuestions } from './src/utils/quiz.utils.js';

// Test content
const testContent = `
Artificial Intelligence (AI) is the simulation of human intelligence by machines. 
Machine learning is a subset of AI that enables systems to learn from data.
Deep learning uses neural networks with multiple layers.
Natural Language Processing (NLP) helps computers understand human language.
Computer vision enables machines to interpret visual information.
`;

console.log('Testing AI Question Generation with Multiple Types\n');
console.log('='.repeat(60));

// Test 1: Default (all multiple choice)
console.log('\nTest 1: Default generation (no distribution specified)');
console.log('-'.repeat(60));
try {
  const questions1 = await generateQuestions(testContent, null, 10);
  console.log(`✓ Generated ${questions1.length} questions`);
  console.log('Distribution:', {
    multipleChoice: questions1.filter(q => q.type === 'multipleChoice').length,
    trueFalse: questions1.filter(q => q.type === 'trueFalse').length,
    fillInBlank: questions1.filter(q => q.type === 'fillInBlank').length,
    matching: questions1.filter(q => q.type === 'matching').length
  });
} catch (error) {
  console.error('✗ Error:', error.message);
}

// Test 2: Mixed distribution
console.log('\nTest 2: Mixed distribution');
console.log('-'.repeat(60));
try {
  const distribution2 = {
    multipleChoice: 5,
    trueFalse: 3,
    fillInBlank: 2,
    matching: 0
  };
  const questions2 = await generateQuestions(testContent, distribution2, 10);
  console.log(`✓ Generated ${questions2.length} questions`);
  console.log('Requested:', distribution2);
  console.log('Actual:', {
    multipleChoice: questions2.filter(q => q.type === 'multipleChoice').length,
    trueFalse: questions2.filter(q => q.type === 'trueFalse').length,
    fillInBlank: questions2.filter(q => q.type === 'fillInBlank').length,
    matching: questions2.filter(q => q.type === 'matching').length
  });
  
  // Show sample questions
  console.log('\nSample questions:');
  questions2.slice(0, 3).forEach((q, i) => {
    console.log(`\n${i + 1}. [${q.type}] ${q.question}`);
    if (q.type === 'multipleChoice') {
      q.options.forEach((opt, idx) => {
        console.log(`   ${idx === q.correctAnswer ? '✓' : ' '} ${opt}`);
      });
    } else if (q.type === 'trueFalse') {
      console.log(`   Answer: ${q.correctAnswer}`);
    } else if (q.type === 'fillInBlank') {
      console.log(`   Answer: ${q.correctAnswer}`);
    }
  });
} catch (error) {
  console.error('✗ Error:', error.message);
}

// Test 3: All question types
console.log('\n\nTest 3: All question types');
console.log('-'.repeat(60));
try {
  const distribution3 = {
    multipleChoice: 3,
    trueFalse: 3,
    fillInBlank: 2,
    matching: 2
  };
  const questions3 = await generateQuestions(testContent, distribution3, 10);
  console.log(`✓ Generated ${questions3.length} questions`);
  console.log('Requested:', distribution3);
  console.log('Actual:', {
    multipleChoice: questions3.filter(q => q.type === 'multipleChoice').length,
    trueFalse: questions3.filter(q => q.type === 'trueFalse').length,
    fillInBlank: questions3.filter(q => q.type === 'fillInBlank').length,
    matching: questions3.filter(q => q.type === 'matching').length
  });
} catch (error) {
  console.error('✗ Error:', error.message);
}

console.log('\n' + '='.repeat(60));
console.log('Tests completed!\n');
