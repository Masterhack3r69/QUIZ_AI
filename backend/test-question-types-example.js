import { generateQuestions } from './src/utils/quiz.utils.js';

// Comprehensive test content about programming
const programmingContent = `
JavaScript is a high-level, interpreted programming language. It is one of the core technologies of the World Wide Web.
JavaScript supports object-oriented, imperative, and functional programming styles.

Variables in JavaScript can be declared using var, let, or const keywords.
The let keyword was introduced in ES6 and provides block-scoped variables.
The const keyword is used to declare constants that cannot be reassigned.

Functions in JavaScript are first-class objects, meaning they can be assigned to variables, passed as arguments, and returned from other functions.
Arrow functions provide a more concise syntax for writing function expressions.

JavaScript has several data types including: Number, String, Boolean, Object, Array, null, and undefined.
Arrays in JavaScript are dynamic and can hold elements of different types.

Asynchronous programming in JavaScript is handled through callbacks, promises, and async/await syntax.
Promises represent the eventual completion or failure of an asynchronous operation.
`;

console.log('Testing Question Generation with Programming Content\n');
console.log('='.repeat(70));

async function runTests() {
  // Test with balanced distribution
  console.log('\nGenerating 15 questions with balanced distribution:');
  console.log('-'.repeat(70));
  
  const distribution = {
    multipleChoice: 6,
    trueFalse: 4,
    fillInBlank: 3,
    matching: 2
  };
  
  console.log('Requested distribution:', distribution);
  console.log('Total questions:', 15);
  console.log('\nGenerating...\n');
  
  try {
    const questions = await generateQuestions(programmingContent, distribution, 15);
    
    console.log(`✓ Successfully generated ${questions.length} questions\n`);
    
    // Count by type
    const actualDistribution = {
      multipleChoice: questions.filter(q => q.type === 'multipleChoice').length,
      trueFalse: questions.filter(q => q.type === 'trueFalse').length,
      fillInBlank: questions.filter(q => q.type === 'fillInBlank').length,
      matching: questions.filter(q => q.type === 'matching').length
    };
    
    console.log('Actual distribution:', actualDistribution);
    console.log('\n' + '='.repeat(70));
    console.log('Sample Questions by Type:');
    console.log('='.repeat(70));
    
    // Show one example of each type
    const types = ['multipleChoice', 'trueFalse', 'fillInBlank', 'matching'];
    
    types.forEach(type => {
      const example = questions.find(q => q.type === type);
      if (example) {
        console.log(`\n[${type.toUpperCase()}]`);
        console.log('-'.repeat(70));
        console.log(`Question: ${example.question}`);
        
        switch (type) {
          case 'multipleChoice':
            console.log('Options:');
            example.options.forEach((opt, idx) => {
              const marker = idx === example.correctAnswer ? '✓' : ' ';
              console.log(`  ${marker} ${idx + 1}. ${opt}`);
            });
            break;
          
          case 'trueFalse':
            console.log(`Correct Answer: ${example.correctAnswer}`);
            break;
          
          case 'fillInBlank':
            console.log(`Correct Answer: "${example.correctAnswer}"`);
            console.log(`Case Sensitive: ${example.caseSensitive}`);
            break;
          
          case 'matching':
            console.log('Left Column:');
            example.leftColumn.forEach((item, idx) => {
              console.log(`  ${idx}. ${item}`);
            });
            console.log('Right Column:');
            example.rightColumn.forEach((item, idx) => {
              console.log(`  ${idx}. ${item}`);
            });
            console.log('Correct Pairs:');
            example.correctPairs.forEach(pair => {
              console.log(`  ${pair.left} → ${pair.right}`);
            });
            break;
        }
      }
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('✓ All tests completed successfully!');
    console.log('='.repeat(70) + '\n');
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error(error.stack);
  }
}

runTests();
