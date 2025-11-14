/**
 * Quick test for Question Improvement Agent
 * 
 * Tests the agent's ability to improve low-quality questions
 * based on validation feedback.
 */

import QuestionImprovementAgent from '../services/agents/question-improvement-agent.js';
import dotenv from 'dotenv';

dotenv.config();

// Sample low-quality question
const lowQualityQuestion = {
  type: 'multipleChoice',
  question: 'What does photosynthesis do?',
  options: [
    'Makes food for plants',
    'Nothing',
    'Kills plants',
    'Makes plants green'
  ],
  correctAnswer: 0,
  explanation: 'Photosynthesis makes food',
  difficulty: 'easy'
};

// Sample validation feedback (low score)
const validationFeedback = {
  score: 45,
  grade: 'poor',
  clarity: {
    score: 10,
    issues: ['Question is too vague', 'Lacks specificity'],
    suggestions: ['Be more specific about what aspect of photosynthesis', 'Ask about specific products or processes']
  },
  correctness: {
    score: 15,
    issues: ['Correct answer is vague'],
    suggestions: ['Specify the exact product or outcome']
  },
  distractorQuality: {
    score: 5,
    issues: ['Distractors are obviously wrong', 'Options B and C are not plausible'],
    suggestions: ['Use verbatim traps from content', 'Include common misconceptions', 'Make all options similar in length']
  },
  educationalValue: {
    score: 15,
    issues: ['Tests only basic recall', 'Doesn\'t assess understanding'],
    suggestions: ['Test understanding of the process', 'Ask about relationships or applications']
  },
  overallIssues: [
    'Question is too simple and vague',
    'Distractors are not educational',
    'Doesn\'t test meaningful understanding'
  ],
  strengths: [
    'Topic is relevant'
  ],
  recommendations: [
    'Rewrite question to be more specific',
    'Improve all distractors to be plausible',
    'Test understanding rather than just recall'
  ],
  passesQuality: false,
  requiresImprovement: true
};

async function testQuestionImprovement() {
  console.log('='.repeat(80));
  console.log('QUESTION IMPROVEMENT AGENT - QUICK TEST');
  console.log('='.repeat(80));
  console.log();

  const agent = new QuestionImprovementAgent();

  try {
    console.log('📝 Original Question (Score: 45/100):');
    console.log(`   "${lowQualityQuestion.question}"`);
    console.log(`   A) ${lowQualityQuestion.options[0]} ✓`);
    console.log(`   B) ${lowQualityQuestion.options[1]}`);
    console.log(`   C) ${lowQualityQuestion.options[2]}`);
    console.log(`   D) ${lowQualityQuestion.options[3]}`);
    console.log();

    console.log('🔍 Main Issues:');
    validationFeedback.overallIssues.forEach(issue => {
      console.log(`   - ${issue}`);
    });
    console.log();

    console.log('🔄 Improving question...');
    console.log();

    const result = await agent.improveQuestion(
      lowQualityQuestion,
      validationFeedback,
      {
        temperature: 0.5
      }
    );

    console.log('✅ Improved Question (Expected Score: ' + result.expectedScore + '/100):');
    console.log(`   "${result.improvedQuestion.question}"`);
    result.improvedQuestion.options.forEach((option, i) => {
      const marker = i === result.improvedQuestion.correctAnswer ? ' ✓' : '';
      const label = String.fromCharCode(65 + i);
      console.log(`   ${label}) ${option}${marker}`);
    });
    console.log();

    if (result.improvedQuestion.explanation) {
      console.log('💡 Explanation:');
      console.log(`   ${result.improvedQuestion.explanation}`);
      console.log();
    }

    console.log('📊 Improvements Made:');
    result.improvements.forEach(improvement => {
      console.log(`   ✓ ${improvement}`);
    });
    console.log();

    console.log('📝 Changes Summary:');
    console.log(`   ${result.changesSummary}`);
    console.log();

    console.log('📈 Score Improvement:');
    console.log(`   Original: ${result.originalScore}/100`);
    console.log(`   Expected: ${result.expectedScore}/100`);
    console.log(`   Increase: +${result.expectedScore - result.originalScore} points`);
    console.log();

    console.log('⏱️  Execution Details:');
    console.log(`   Provider: ${result.provider}`);
    console.log(`   Time: ${result.executionTime}ms`);
    console.log();

    console.log('='.repeat(80));
    console.log('✅ TEST COMPLETED SUCCESSFULLY');
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
testQuestionImprovement();
