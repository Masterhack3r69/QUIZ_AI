/**
 * Quick test for Question Improvement Agent - Batch Processing
 * 
 * Tests the agent's ability to improve multiple low-quality questions
 * in parallel with concurrency control.
 */

import QuestionImprovementAgent from '../services/agents/question-improvement-agent.js';
import dotenv from 'dotenv';

dotenv.config();

// Sample low-quality questions with validation feedback
const questionsWithFeedback = [
  {
    question: {
      type: 'multipleChoice',
      question: 'What is DNA?',
      options: ['A molecule', 'Nothing', 'A cell', 'Water'],
      correctAnswer: 0,
      difficulty: 'easy'
    },
    validationFeedback: {
      score: 55,
      grade: 'fair',
      clarity: { score: 15, issues: ['Too vague'], suggestions: ['Be more specific'] },
      correctness: { score: 20, issues: ['Answer too general'], suggestions: ['Specify type of molecule'] },
      distractorQuality: { score: 10, issues: ['Distractors too weak'], suggestions: ['Use plausible alternatives'] },
      educationalValue: { score: 10, issues: ['Tests only basic recall'], suggestions: ['Test understanding'] },
      overallIssues: ['Question lacks specificity'],
      strengths: ['Relevant topic'],
      recommendations: ['Make more specific'],
      passesQuality: false,
      requiresImprovement: true
    }
  },
  {
    question: {
      type: 'multipleChoice',
      question: 'What happens in mitosis?',
      options: ['Cell divides', 'Cell dies', 'Cell grows', 'Cell sleeps'],
      correctAnswer: 0,
      difficulty: 'medium'
    },
    validationFeedback: {
      score: 60,
      grade: 'fair',
      clarity: { score: 15, issues: ['Lacks detail'], suggestions: ['Specify what aspect'] },
      correctness: { score: 20, issues: ['Too general'], suggestions: ['Be more precise'] },
      distractorQuality: { score: 15, issues: ['Weak distractors'], suggestions: ['Use related processes'] },
      educationalValue: { score: 10, issues: ['Surface level'], suggestions: ['Test deeper understanding'] },
      overallIssues: ['Too general'],
      strengths: ['Important concept'],
      recommendations: ['Add specificity'],
      passesQuality: false,
      requiresImprovement: true
    }
  },
  {
    question: {
      type: 'multipleChoice',
      question: 'Where does photosynthesis occur?',
      options: ['Chloroplasts', 'Everywhere', 'Nowhere', 'In water'],
      correctAnswer: 0,
      difficulty: 'easy'
    },
    validationFeedback: {
      score: 65,
      grade: 'fair',
      clarity: { score: 20, issues: ['Could be clearer'], suggestions: ['Specify plant cells'] },
      correctness: { score: 25, issues: [], suggestions: [] },
      distractorQuality: { score: 10, issues: ['Options B and C are silly'], suggestions: ['Use real alternatives'] },
      educationalValue: { score: 10, issues: ['Basic recall only'], suggestions: ['Test understanding of process'] },
      overallIssues: ['Weak distractors'],
      strengths: ['Clear correct answer'],
      recommendations: ['Improve distractors'],
      passesQuality: false,
      requiresImprovement: true
    }
  }
];

async function testBatchImprovement() {
  console.log('='.repeat(80));
  console.log('QUESTION IMPROVEMENT AGENT - BATCH TEST');
  console.log('='.repeat(80));
  console.log();

  const agent = new QuestionImprovementAgent();

  try {
    console.log(`📚 Processing ${questionsWithFeedback.length} low-quality questions...`);
    console.log();

    // Show original questions
    console.log('📝 Original Questions:');
    questionsWithFeedback.forEach((item, i) => {
      console.log(`   ${i + 1}. "${item.question.question}" (Score: ${item.validationFeedback.score}/100)`);
    });
    console.log();

    console.log('🔄 Improving questions in parallel (max 5 concurrent)...');
    console.log();

    const startTime = Date.now();
    const results = await agent.improveBatch(questionsWithFeedback, {
      concurrency: 5,
      temperature: 0.5
    });
    const totalTime = Date.now() - startTime;

    console.log('✅ All questions improved!');
    console.log();

    // Show improved questions
    console.log('📊 IMPROVEMENT RESULTS:');
    console.log('='.repeat(80));
    
    results.forEach((result, i) => {
      console.log();
      console.log(`Question ${i + 1}:`);
      console.log(`  Original: "${result.originalQuestion.question}"`);
      console.log(`  Improved: "${result.improvedQuestion.question}"`);
      console.log();
      console.log(`  Score: ${result.originalScore} → ${result.expectedScore} (+${result.expectedScore - result.originalScore})`);
      console.log();
      console.log(`  Key Improvements:`);
      result.improvements.slice(0, 3).forEach(imp => {
        console.log(`    ✓ ${imp}`);
      });
      console.log();
      console.log(`  Provider: ${result.provider} | Time: ${result.executionTime}ms`);
      console.log('-'.repeat(80));
    });

    // Summary statistics
    console.log();
    console.log('📈 SUMMARY STATISTICS:');
    console.log('='.repeat(80));
    
    const avgOriginalScore = results.reduce((sum, r) => sum + r.originalScore, 0) / results.length;
    const avgExpectedScore = results.reduce((sum, r) => sum + r.expectedScore, 0) / results.length;
    const avgImprovement = avgExpectedScore - avgOriginalScore;
    const totalImprovements = results.reduce((sum, r) => sum + r.improvements.length, 0);

    console.log(`  Total Questions: ${results.length}`);
    console.log(`  Average Original Score: ${avgOriginalScore.toFixed(1)}/100`);
    console.log(`  Average Expected Score: ${avgExpectedScore.toFixed(1)}/100`);
    console.log(`  Average Improvement: +${avgImprovement.toFixed(1)} points`);
    console.log(`  Total Improvements Made: ${totalImprovements}`);
    console.log(`  Total Processing Time: ${totalTime}ms`);
    console.log(`  Average Time per Question: ${(totalTime / results.length).toFixed(0)}ms`);
    console.log();

    console.log('='.repeat(80));
    console.log('✅ BATCH TEST COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80));

  } catch (error) {
    console.error();
    console.error('❌ TEST FAILED');
    console.error('='.repeat(80));
    console.error('Error:', error.message);
    console.error();
    if (error.stack) {
      console.error('Stack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run test
testBatchImprovement();
