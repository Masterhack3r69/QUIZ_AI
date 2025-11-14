/**
 * Quick test for Quality Validation Agent with timeout
 */

import QualityValidationAgent from '../services/agents/quality-validation-agent.js';
import dotenv from 'dotenv';

dotenv.config();

// Sample questions with varying quality levels
const sampleQuestions = [
  // High quality question
  {
    id: 'q1',
    type: 'multipleChoice',
    question: 'What is the primary function of chloroplasts in plant cells?',
    options: [
      'Protein synthesis',
      'Photosynthesis',
      'Cell division',
      'Energy storage'
    ],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'Chloroplasts are the organelles where photosynthesis occurs, converting light energy into chemical energy stored in glucose.'
  },
  
  // Medium quality question (could be clearer)
  {
    id: 'q2',
    type: 'trueFalse',
    question: 'Plants make food.',
    correctAnswer: true,
    difficulty: 'easy',
    explanation: 'Plants produce glucose through photosynthesis.'
  },
  
  // Lower quality question (ambiguous)
  {
    id: 'q3',
    type: 'multipleChoice',
    question: 'What happens in photosynthesis?',
    options: [
      'Things change',
      'Light is used',
      'Plants grow',
      'Energy is made'
    ],
    correctAnswer: 1,
    difficulty: 'easy'
  },
  
  // Good quality true/false
  {
    id: 'q4',
    type: 'trueFalse',
    question: 'The Calvin cycle requires direct light energy to convert CO2 into glucose.',
    correctAnswer: false,
    difficulty: 'hard',
    explanation: 'The Calvin cycle is light-independent and uses ATP and NADPH produced during light-dependent reactions, not direct light energy.'
  }
];

async function quickTest() {
  console.log('🧪 Quick Quality Validation Test');
  console.log('='.repeat(60));
  
  const agent = new QualityValidationAgent();
  
  try {
    console.log('📝 Testing single question validation...');
    console.log(`   Using model: deepseek/deepseek-chat-v3.1:free`);
    console.log();
    
    // Test single question validation
    const question = sampleQuestions[0];
    console.log(`Question: "${question.question}"`);
    console.log();
    
    const result = await agent.validateQuestion(question, {
      temperature: 0.3
    });
    
    console.log('✅ Single validation SUCCESS!');
    console.log();
    console.log(`📊 Validation Result:`);
    console.log(`   Overall Score: ${result.score}/100`);
    console.log(`   Grade: ${result.grade.toUpperCase()}`);
    console.log(`   Passes Quality: ${result.passesQuality ? '✓ YES' : '✗ NO'}`);
    console.log();
    
    console.log(`   Criteria Scores:`);
    console.log(`   - Clarity: ${result.clarity.score}/25`);
    console.log(`   - Correctness: ${result.correctness.score}/25`);
    console.log(`   - Distractor Quality: ${result.distractorQuality.score}/25`);
    console.log(`   - Educational Value: ${result.educationalValue.score}/25`);
    console.log();
    
    if (result.strengths && result.strengths.length > 0) {
      console.log(`   💪 Strengths:`);
      result.strengths.forEach(s => console.log(`      - ${s}`));
      console.log();
    }
    
    if (result.overallIssues && result.overallIssues.length > 0) {
      console.log(`   ⚠️  Issues:`);
      result.overallIssues.forEach(i => console.log(`      - ${i}`));
      console.log();
    }
    
    if (result.recommendations && result.recommendations.length > 0) {
      console.log(`   💡 Recommendations:`);
      result.recommendations.forEach(r => console.log(`      - ${r}`));
      console.log();
    }
    
    console.log('-'.repeat(60));
    console.log();
    
    // Test batch validation
    console.log('📝 Testing batch validation...');
    console.log(`   Validating ${sampleQuestions.length} questions`);
    console.log();
    
    const batchResults = await agent.validateBatch(sampleQuestions, {
      temperature: 0.3,
      concurrency: 2
    });
    
    console.log('✅ Batch validation SUCCESS!');
    console.log();
    console.log(`📊 Batch Results:`);
    console.log();
    
    // Display each question's result
    batchResults.forEach((result, i) => {
      const q = sampleQuestions[i];
      const status = result.passesQuality ? '✓' : '✗';
      const gradeEmoji = {
        excellent: '🌟',
        good: '👍',
        fair: '👌',
        poor: '⚠️'
      }[result.grade] || '❓';
      
      console.log(`${status} Q${i + 1} [${result.grade}] ${gradeEmoji} Score: ${result.score}/100`);
      console.log(`   "${q.question.substring(0, 60)}${q.question.length > 60 ? '...' : ''}"`);
      
      if (!result.passesQuality && result.overallIssues.length > 0) {
        console.log(`   Issues: ${result.overallIssues[0]}`);
      }
      console.log();
    });
    
    // Aggregate statistics
    const aggregated = agent.aggregateResults(batchResults, sampleQuestions);
    
    console.log('-'.repeat(60));
    console.log();
    console.log('📈 Aggregate Statistics:');
    console.log(`   Total Questions: ${aggregated.totalQuestions}`);
    console.log(`   Average Score: ${aggregated.averageScore}/100`);
    console.log(`   Pass Rate: ${aggregated.passRate}%`);
    console.log();
    console.log(`   Grade Distribution:`);
    console.log(`   - Excellent: ${aggregated.gradeDistribution.excellent}`);
    console.log(`   - Good: ${aggregated.gradeDistribution.good}`);
    console.log(`   - Fair: ${aggregated.gradeDistribution.fair}`);
    console.log(`   - Poor: ${aggregated.gradeDistribution.poor}`);
    console.log();
    
    if (aggregated.questionsNeedingImprovement.length > 0) {
      console.log(`   ⚠️  Questions Needing Improvement: ${aggregated.questionsNeedingImprovement.length}`);
      aggregated.questionsNeedingImprovement.forEach(item => {
        console.log(`      - Q${item.index + 1}: Score ${item.validationResult.score}/100`);
      });
      console.log();
    }
    
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    console.error('   Type:', error.name);
    if (error.validationDetails) {
      console.error('   Details:', JSON.stringify(error.validationDetails, null, 2));
    }
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Set timeout
const timeout = setTimeout(() => {
  console.error('❌ Test timed out after 90 seconds');
  process.exit(1);
}, 90000);

quickTest().then(() => {
  clearTimeout(timeout);
  process.exit(0);
}).catch(error => {
  clearTimeout(timeout);
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
