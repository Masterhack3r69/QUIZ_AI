/**
 * Quick test for Question Generation Agent with timeout
 */

import QuestionGenerationAgent from '../services/agents/question-generation-agent.js';
import dotenv from 'dotenv';

dotenv.config();

// Sample extracted concepts (simulating output from Content Extraction Agent)
const sampleConcepts = {
  mainTopics: [
    'Photosynthesis Process',
    'Light-Dependent Reactions',
    'Calvin Cycle'
  ],
  keyConcepts: [
    {
      name: 'Photosynthesis',
      description: 'The process by which green plants use sunlight to synthesize foods from carbon dioxide and water',
      difficulty: 'medium',
      testable: true
    },
    {
      name: 'Light-Dependent Reactions',
      description: 'First stage of photosynthesis where light energy is converted to ATP and NADPH',
      difficulty: 'hard',
      testable: true
    },
    {
      name: 'Calvin Cycle',
      description: 'Light-independent reactions that use ATP and NADPH to convert CO2 into glucose',
      difficulty: 'hard',
      testable: true
    },
    {
      name: 'Chloroplast',
      description: 'Organelle where photosynthesis occurs in plant cells',
      difficulty: 'easy',
      testable: true
    },
    {
      name: 'Glucose Production',
      description: 'The primary product of photosynthesis used for energy storage',
      difficulty: 'medium',
      testable: true
    }
  ],
  criticalFacts: [
    {
      fact: 'Photosynthesis occurs in two stages: light-dependent reactions and the Calvin cycle',
      category: 'process',
      importance: 'high'
    },
    {
      fact: 'Light-dependent reactions convert light energy to ATP and NADPH',
      category: 'process',
      importance: 'high'
    },
    {
      fact: 'The Calvin cycle uses ATP and NADPH to convert CO2 into glucose',
      category: 'process',
      importance: 'high'
    },
    {
      fact: 'The overall equation is: 6CO2 + 6H2O + light → C6H12O6 + 6O2',
      category: 'definition',
      importance: 'high'
    },
    {
      fact: 'Oxygen is released as a byproduct of photosynthesis',
      category: 'relationship',
      importance: 'medium'
    }
  ],
  learningObjectives: [
    'Students will understand the two stages of photosynthesis',
    'Students will be able to explain the role of ATP and NADPH',
    'Students will identify the products and reactants of photosynthesis'
  ]
};

async function quickTest() {
  console.log('🧪 Quick Question Generation Test');
  console.log('='.repeat(60));
  
  const agent = new QuestionGenerationAgent();
  
  try {
    console.log('📝 Generating questions from extracted concepts...');
    console.log(`   Concepts: ${sampleConcepts.keyConcepts.length} key concepts`);
    console.log(`   Distribution: 8 multiple choice, 2 true/false`);
    console.log(`   Using model: deepseek/deepseek-chat-v3.1:free`);
    console.log();
    
    const distribution = {
      multipleChoice: 8,
      trueFalse: 2
    };
    
    const questions = await agent.generateQuestions(
      sampleConcepts,
      distribution,
      10,
      {
        difficulty: 'mixed',
        temperature: 0.7
      }
    );
    
    console.log('✅ SUCCESS!');
    console.log();
    console.log(`📊 Generated ${questions.length} questions:`);
    console.log();
    
    // Display each question
    questions.forEach((q, i) => {
      const type = q.type || 'multipleChoice';
      const difficulty = q.difficulty || 'unknown';
      
      console.log(`Question ${i + 1} [${type}] (${difficulty}):`);
      console.log(`  ${q.question}`);
      console.log();
      
      if (q.options && Array.isArray(q.options)) {
        // Multiple choice
        q.options.forEach((opt, j) => {
          const marker = j === q.correctAnswer ? '✓' : ' ';
          const letter = String.fromCharCode(65 + j); // A, B, C, D
          console.log(`  ${marker} ${letter}. ${opt}`);
        });
      } else if (typeof q.correctAnswer === 'boolean') {
        // True/False
        console.log(`  Correct Answer: ${q.correctAnswer ? 'TRUE' : 'FALSE'}`);
      }
      
      if (q.explanation) {
        console.log();
        console.log(`  💡 Explanation: ${q.explanation}`);
      }
      
      console.log();
      console.log('-'.repeat(60));
      console.log();
    });
    
    // Verify distribution
    const actualCounts = agent.countByType(questions);
    console.log('📈 Distribution Check:');
    console.log(`   Requested: ${JSON.stringify(distribution)}`);
    console.log(`   Actual:    ${JSON.stringify(actualCounts)}`);
    console.log();
    
    // Validate all questions
    let validCount = 0;
    let invalidCount = 0;
    
    questions.forEach((q, i) => {
      try {
        agent.validateQuestionFormat(q);
        validCount++;
      } catch (error) {
        invalidCount++;
        console.warn(`   ⚠️  Question ${i + 1} validation issue: ${error.message}`);
      }
    });
    
    console.log('✔️  Validation Results:');
    console.log(`   Valid: ${validCount}/${questions.length}`);
    if (invalidCount > 0) {
      console.log(`   Invalid: ${invalidCount}/${questions.length}`);
    }
    console.log();
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    console.error('   Type:', error.name);
    if (error.validationDetails) {
      console.error('   Details:', JSON.stringify(error.validationDetails, null, 2));
    }
    if (error.errors) {
      console.error('   Errors:', JSON.stringify(error.errors, null, 2));
    }
    process.exit(1);
  }
}

// Set timeout
const timeout = setTimeout(() => {
  console.error('❌ Test timed out after 60 seconds');
  process.exit(1);
}, 60000);

quickTest().then(() => {
  clearTimeout(timeout);
  process.exit(0);
}).catch(error => {
  clearTimeout(timeout);
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
