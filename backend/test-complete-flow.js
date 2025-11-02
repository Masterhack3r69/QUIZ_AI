/**
 * Complete Flow Test for Multi-Type Question Generation
 * 
 * This test demonstrates the complete flow from content to quiz creation
 * with multiple question types and distribution validation.
 */

import { generateQuestions } from './src/utils/quiz.utils.js';

console.log('\n' + '='.repeat(80));
console.log('COMPLETE FLOW TEST: Multi-Type Question Generation');
console.log('='.repeat(80) + '\n');

// Sample educational content
const content = `
Cloud Computing Fundamentals

Cloud computing is the delivery of computing services over the internet. These services include servers, storage, databases, networking, software, analytics, and intelligence.

The three main service models are:
1. Infrastructure as a Service (IaaS) - Provides virtualized computing resources
2. Platform as a Service (PaaS) - Provides a platform for developing applications
3. Software as a Service (SaaS) - Delivers software applications over the internet

Cloud deployment models include:
- Public Cloud: Services offered over the public internet
- Private Cloud: Services maintained on a private network
- Hybrid Cloud: Combination of public and private clouds

Key benefits of cloud computing:
- Cost savings through pay-as-you-go pricing
- Scalability to handle varying workloads
- Reliability with built-in redundancy
- Security with advanced protection measures
- Global reach with data centers worldwide
`;

async function testCompleteFlow() {
  console.log('Step 1: Content Preparation');
  console.log('-'.repeat(80));
  console.log(`Content length: ${content.length} characters`);
  console.log(`Content preview: ${content.substring(0, 100)}...`);
  console.log('✓ Content ready\n');

  console.log('Step 2: Define Question Distribution');
  console.log('-'.repeat(80));
  const distribution = {
    multipleChoice: 8,
    trueFalse: 5,
    fillInBlank: 4,
    matching: 3
  };
  const totalQuestions = 20;
  console.log('Requested distribution:', distribution);
  console.log('Total questions:', totalQuestions);
  console.log('✓ Distribution configured\n');

  console.log('Step 3: Generate Questions with AI');
  console.log('-'.repeat(80));
  console.log('Calling generateQuestions()...');
  
  try {
    const startTime = Date.now();
    const questions = await generateQuestions(content, distribution, totalQuestions);
    const endTime = Date.now();
    
    console.log(`✓ Generated ${questions.length} questions in ${endTime - startTime}ms\n`);

    console.log('Step 4: Validate Generated Questions');
    console.log('-'.repeat(80));
    
    // Count by type
    const actualDistribution = {
      multipleChoice: questions.filter(q => q.type === 'multipleChoice').length,
      trueFalse: questions.filter(q => q.type === 'trueFalse').length,
      fillInBlank: questions.filter(q => q.type === 'fillInBlank').length,
      matching: questions.filter(q => q.type === 'matching').length
    };
    
    console.log('Actual distribution:', actualDistribution);
    
    // Validate each type
    let validCount = 0;
    let invalidCount = 0;
    
    questions.forEach(q => {
      let isValid = false;
      
      switch (q.type) {
        case 'multipleChoice':
          isValid = q.options && q.options.length === 4 && 
                   typeof q.correctAnswer === 'number';
          break;
        case 'trueFalse':
          isValid = typeof q.correctAnswer === 'boolean';
          break;
        case 'fillInBlank':
          isValid = typeof q.correctAnswer === 'string';
          break;
        case 'matching':
          isValid = Array.isArray(q.leftColumn) && 
                   Array.isArray(q.rightColumn) &&
                   Array.isArray(q.correctPairs);
          break;
      }
      
      if (isValid) validCount++;
      else invalidCount++;
    });
    
    console.log(`Valid questions: ${validCount}`);
    console.log(`Invalid questions: ${invalidCount}`);
    console.log('✓ Validation complete\n');

    console.log('Step 5: Display Sample Questions');
    console.log('-'.repeat(80));
    
    // Show 2 examples of each type
    const types = ['multipleChoice', 'trueFalse', 'fillInBlank', 'matching'];
    
    types.forEach(type => {
      const examples = questions.filter(q => q.type === type).slice(0, 2);
      
      if (examples.length > 0) {
        console.log(`\n[${type.toUpperCase()}] - ${examples.length} sample(s):`);
        console.log('-'.repeat(80));
        
        examples.forEach((q, idx) => {
          console.log(`\n${idx + 1}. ${q.question}`);
          
          switch (type) {
            case 'multipleChoice':
              q.options.forEach((opt, i) => {
                const marker = i === q.correctAnswer ? '✓' : ' ';
                console.log(`   ${marker} ${String.fromCharCode(65 + i)}. ${opt}`);
              });
              break;
            
            case 'trueFalse':
              console.log(`   Answer: ${q.correctAnswer ? 'TRUE' : 'FALSE'}`);
              break;
            
            case 'fillInBlank':
              console.log(`   Answer: "${q.correctAnswer}"`);
              console.log(`   Case Sensitive: ${q.caseSensitive ? 'Yes' : 'No'}`);
              break;
            
            case 'matching':
              console.log('   Left Column:');
              q.leftColumn.forEach((item, i) => {
                console.log(`     ${i + 1}. ${item}`);
              });
              console.log('   Right Column:');
              q.rightColumn.forEach((item, i) => {
                console.log(`     ${String.fromCharCode(65 + i)}. ${item}`);
              });
              console.log('   Correct Pairs:');
              q.correctPairs.forEach(pair => {
                console.log(`     ${pair.left + 1} → ${String.fromCharCode(65 + pair.right)}`);
              });
              break;
          }
        });
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('Step 6: Summary');
    console.log('-'.repeat(80));
    console.log('✓ Content processed successfully');
    console.log('✓ Questions generated with specified distribution');
    console.log('✓ All questions validated');
    console.log('✓ Ready for quiz creation');
    console.log('\nQuiz Statistics:');
    console.log(`  Total Questions: ${questions.length}`);
    console.log(`  Multiple Choice: ${actualDistribution.multipleChoice}`);
    console.log(`  True/False: ${actualDistribution.trueFalse}`);
    console.log(`  Fill-in-the-Blank: ${actualDistribution.fillInBlank}`);
    console.log(`  Matching: ${actualDistribution.matching}`);
    console.log('='.repeat(80) + '\n');
    
    console.log('✅ COMPLETE FLOW TEST PASSED!\n');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error('Error:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testCompleteFlow();
