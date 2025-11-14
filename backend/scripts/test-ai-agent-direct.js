/**
 * Direct AI Agent Test Script
 * 
 * Tests the AI agent pipeline directly without needing the server running.
 * This script:
 * 1. Connects to MongoDB directly
 * 2. Initializes the AI agent pipeline
 * 3. Processes sample content
 * 4. Shows detailed agent activity
 * 
 * Usage: node scripts/test-ai-agent-direct.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import AgenticPipeline from '../src/services/agentic-pipeline.js';
import AITaskRouter from '../src/services/ai-task-router.js';
import PromptManager from '../src/services/prompt-manager.js';
import ContentExtractionAgent from '../src/services/agents/content-extraction-agent.js';
import QuestionGenerationAgent from '../src/services/agents/question-generation-agent.js';
import QualityValidationAgent from '../src/services/agents/quality-validation-agent.js';
import QuestionImprovementAgent from '../src/services/agents/question-improvement-agent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Sample educational content about Photosynthesis
const SAMPLE_CONTENT = `
# Photosynthesis: The Process of Life

## Introduction
Photosynthesis is the fundamental process by which plants, algae, and some bacteria convert light energy into chemical energy stored in glucose. This process is essential for life on Earth as it produces oxygen and serves as the primary source of energy for most living organisms.

## The Chemical Equation
The overall equation for photosynthesis is:
6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

This means that carbon dioxide and water, in the presence of light energy, are converted into glucose and oxygen.

## Two Main Stages

### 1. Light-Dependent Reactions (Light Reactions)
- Occur in the thylakoid membranes of chloroplasts
- Require light energy to proceed
- Water molecules are split (photolysis) releasing oxygen as a byproduct
- Energy is captured and stored in ATP and NADPH molecules
- Chlorophyll absorbs light energy, primarily in the blue and red wavelengths

### 2. Light-Independent Reactions (Calvin Cycle)
- Occur in the stroma of chloroplasts
- Do not directly require light but use products from light reactions
- Carbon dioxide is fixed and converted into glucose
- Uses ATP and NADPH from light reactions
- Also known as the dark reactions or carbon fixation

## Key Components

### Chloroplasts
- Organelles where photosynthesis occurs
- Contain chlorophyll, the green pigment that absorbs light
- Have a double membrane structure
- Internal membrane system forms thylakoids stacked into grana

### Chlorophyll
- Primary photosynthetic pigment
- Absorbs light most efficiently in blue (430-450 nm) and red (640-680 nm) wavelengths
- Reflects green light, which is why plants appear green
- Two main types: chlorophyll a and chlorophyll b

## Factors Affecting Photosynthesis

1. **Light Intensity**: Higher light intensity increases the rate up to a saturation point
2. **Carbon Dioxide Concentration**: More CO₂ increases the rate until other factors become limiting
3. **Temperature**: Optimal range is typically 25-35°C; enzymes denature at high temperatures
4. **Water Availability**: Essential as a raw material and for maintaining plant structure
5. **Chlorophyll Concentration**: More chlorophyll allows more light absorption

## Importance of Photosynthesis

- **Oxygen Production**: Produces approximately 70% of Earth's oxygen
- **Food Source**: Forms the base of most food chains
- **Carbon Dioxide Removal**: Helps regulate atmospheric CO₂ levels
- **Fossil Fuels**: Ancient photosynthetic organisms formed coal, oil, and natural gas
- **Climate Regulation**: Plays a crucial role in the global carbon cycle

## Adaptations in Different Environments

### C3 Plants
- Most common type (rice, wheat, soybeans)
- First stable compound has 3 carbon atoms
- Less efficient in hot, dry conditions

### C4 Plants
- Adapted to hot, dry environments (corn, sugarcane)
- More efficient CO₂ fixation
- Minimize water loss through specialized anatomy

### CAM Plants
- Desert plants (cacti, pineapples)
- Open stomata at night to reduce water loss
- Store CO₂ for use during the day

## Conclusion
Photosynthesis is a complex but essential process that sustains life on Earth. Understanding its mechanisms helps us appreciate the interconnectedness of all living things and the importance of preserving plant life and ecosystems.
`;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

/**
 * Print colored section header
 */
function printHeader(text) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${text}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
}

/**
 * Print step information
 */
function printStep(stepNumber, text) {
  console.log(`\n${colors.bright}${colors.blue}[Step ${stepNumber}]${colors.reset} ${text}`);
}

/**
 * Print success message
 */
function printSuccess(text) {
  console.log(`${colors.green}✓${colors.reset} ${text}`);
}

/**
 * Print error message
 */
function printError(text) {
  console.log(`${colors.red}✗${colors.reset} ${text}`);
}

/**
 * Print info message
 */
function printInfo(text) {
  console.log(`${colors.yellow}ℹ${colors.reset} ${text}`);
}

/**
 * Print agent activity
 */
function printAgent(agentName, action) {
  console.log(`${colors.magenta}🤖 [${agentName}]${colors.reset} ${action}`);
}

/**
 * Format JSON for display
 */
function formatJSON(obj, indent = 2) {
  return JSON.stringify(obj, null, indent);
}

/**
 * Initialize AI Agent Pipeline
 */
async function initializePipeline() {
  printStep(1, 'Initializing AI Agent Pipeline');
  
  try {
    // Initialize task router and prompt manager
    const taskRouter = new AITaskRouter();
    const promptManager = new PromptManager();
    
    printInfo('Initializing AI Task Router...');
    await taskRouter.initialize();
    printSuccess('Task Router initialized');
    
    // Initialize all agents
    printInfo('Initializing AI Agents...');
    const agents = {
      contentExtraction: new ContentExtractionAgent(taskRouter, promptManager),
      questionGeneration: new QuestionGenerationAgent(taskRouter, promptManager),
      qualityValidation: new QualityValidationAgent(taskRouter, promptManager),
      questionImprovement: new QuestionImprovementAgent(taskRouter, promptManager)
    };
    printSuccess('All agents initialized');
    
    // Initialize pipeline with agents and configuration
    const config = {
      qualityThreshold: 70,
      enableQualityValidation: true,
      enableQuestionImprovement: true,
      maxImprovementAttempts: 1
    };
    
    const pipeline = new AgenticPipeline(agents, config);
    
    printSuccess('Agentic Pipeline ready!');
    console.log(`\n   Configuration:`);
    console.log(`   - Quality Threshold: ${config.qualityThreshold}`);
    console.log(`   - Quality Validation: ${config.enableQualityValidation ? 'Enabled' : 'Disabled'}`);
    console.log(`   - Question Improvement: ${config.enableQuestionImprovement ? 'Enabled' : 'Disabled'}`);
    
    return pipeline;
    
  } catch (error) {
    printError('Failed to initialize pipeline!');
    console.error(`   Error: ${error.message}`);
    throw error;
  }
}

/**
 * Generate quiz using AI agents
 */
async function generateQuiz(pipeline) {
  printStep(2, 'Generating Quiz with AI Agents');
  
  printInfo('Topic: Photosynthesis');
  printInfo(`Content length: ${SAMPLE_CONTENT.length} characters`);
  
  const options = {
    totalQuestions: 15,
    distribution: {
      multipleChoice: 12,
      trueFalse: 3,
      fillInBlank: 0,
      matching: 0
    },
    difficulty: 'medium'
  };
  
  console.log(`\n   Quiz Configuration:`);
  console.log(`   - Total Questions: ${options.totalQuestions}`);
  console.log(`   - Multiple Choice: ${options.distribution.multipleChoice}`);
  console.log(`   - True/False: ${options.distribution.trueFalse}`);
  console.log(`   - Difficulty: ${options.difficulty}`);
  
  try {
    printInfo('\n🚀 Starting AI generation process...\n');
    
    const startTime = Date.now();
    const result = await pipeline.generateQuiz(SAMPLE_CONTENT, options);
    const executionTime = Date.now() - startTime;
    
    printSuccess(`Quiz generated in ${(executionTime / 1000).toFixed(2)}s`);
    
    return result;
    
  } catch (error) {
    printError('Quiz generation failed!');
    console.error(`   Error: ${error.message}`);
    throw error;
  }
}

/**
 * Display detailed agent process
 */
function displayAgentProcess(result) {
  printStep(3, 'AI Agent Process Details');
  
  const metadata = result.metadata;
  
  // Display execution summary
  console.log(`\n${colors.bright}Execution Summary:${colors.reset}`);
  console.log(`   Total Execution Time: ${metadata.executionTime}ms (${(metadata.executionTime / 1000).toFixed(2)}s)`);
  console.log(`   Generated At: ${new Date(metadata.generatedAt).toLocaleString()}`);
  
  // Display concepts extracted
  if (metadata.concepts) {
    console.log(`\n${colors.bright}${colors.magenta}━━━ Agent 1: Content Extraction ━━━${colors.reset}`);
    printAgent('Content Extraction', 'Analyzed educational content and extracted key concepts');
    
    if (metadata.concepts.mainTopics) {
      console.log(`\n   📚 Main Topics (${metadata.concepts.mainTopics.length}):`);
      metadata.concepts.mainTopics.forEach((topic, i) => {
        console.log(`      ${i + 1}. ${topic}`);
      });
    }
    
    if (metadata.concepts.keyConcepts) {
      console.log(`\n   💡 Key Concepts (${metadata.concepts.keyConcepts.length}):`);
      metadata.concepts.keyConcepts.slice(0, 8).forEach((concept, i) => {
        console.log(`      ${i + 1}. ${concept}`);
      });
      if (metadata.concepts.keyConcepts.length > 8) {
        console.log(`      ... and ${metadata.concepts.keyConcepts.length - 8} more`);
      }
    }
    
    if (metadata.concepts.criticalFacts) {
      console.log(`\n   ⚡ Critical Facts (${metadata.concepts.criticalFacts.length}):`);
      metadata.concepts.criticalFacts.slice(0, 5).forEach((fact, i) => {
        console.log(`      ${i + 1}. ${fact}`);
      });
      if (metadata.concepts.criticalFacts.length > 5) {
        console.log(`      ... and ${metadata.concepts.criticalFacts.length - 5} more`);
      }
    }
  }
  
  // Display question generation
  console.log(`\n${colors.bright}${colors.magenta}━━━ Agent 2: Question Generation ━━━${colors.reset}`);
  printAgent('Question Generation', 'Generated questions from extracted concepts');
  console.log(`\n   📝 Questions Generated: ${metadata.totalQuestions}`);
  console.log(`   📊 Distribution:`);
  Object.entries(metadata.distribution).forEach(([type, count]) => {
    if (count > 0) {
      const bar = '█'.repeat(Math.ceil(count / 2));
      console.log(`      ${type.padEnd(15)}: ${bar} (${count})`);
    }
  });
  
  // Display quality validation
  if (metadata.qualityMetrics) {
    console.log(`\n${colors.bright}${colors.magenta}━━━ Agent 3: Quality Validation ━━━${colors.reset}`);
    printAgent('Quality Validation', 'Evaluated question quality and identified issues');
    
    const qm = metadata.qualityMetrics;
    console.log(`\n   📈 Average Quality Score: ${colors.bright}${qm.averageScore}/100${colors.reset}`);
    console.log(`   ✅ Pass Rate: ${colors.bright}${qm.passRate}%${colors.reset}`);
    console.log(`   📊 Questions Passed: ${qm.passCount}/${qm.totalQuestions}`);
    
    if (qm.gradeDistribution) {
      console.log(`\n   🎯 Grade Distribution:`);
      const grades = ['excellent', 'good', 'fair', 'poor'];
      grades.forEach(grade => {
        const count = qm.gradeDistribution[grade] || 0;
        if (count > 0) {
          const bar = '█'.repeat(Math.ceil(count * 2));
          const emoji = grade === 'excellent' ? '🌟' : grade === 'good' ? '👍' : grade === 'fair' ? '⚠️' : '❌';
          console.log(`      ${emoji} ${grade.padEnd(10)}: ${bar} (${count})`);
        }
      });
    }
  }
  
  // Display question improvement
  if (metadata.improvementMetrics) {
    console.log(`\n${colors.bright}${colors.magenta}━━━ Agent 4: Question Improvement ━━━${colors.reset}`);
    printAgent('Question Improvement', 'Enhanced low-quality questions');
    
    const im = metadata.improvementMetrics;
    console.log(`\n   🔧 Questions Improved: ${colors.bright}${im.questionsImproved}${colors.reset}`);
    console.log(`   📈 Average Score Increase: ${colors.bright}+${im.averageScoreIncrease} points${colors.reset}`);
    
    if (im.questionsImproved > 0) {
      printSuccess(`Successfully improved ${im.questionsImproved} low-quality questions!`);
    }
  }
}

/**
 * Display sample questions
 */
function displaySampleQuestions(result) {
  printStep(4, 'Sample Generated Questions');
  
  const questions = result.questions;
  
  if (!questions || questions.length === 0) {
    printInfo('No questions available');
    return;
  }
  
  // Show first 3 questions
  const samplesToShow = Math.min(3, questions.length);
  
  for (let i = 0; i < samplesToShow; i++) {
    const q = questions[i];
    
    console.log(`\n${colors.bright}${colors.cyan}━━━ Question ${i + 1} ━━━${colors.reset}`);
    console.log(`   Type: ${q.type}`);
    console.log(`   Difficulty: ${q.difficulty || 'medium'}`);
    console.log(`\n   ${colors.bright}${q.question}${colors.reset}`);
    
    if (q.type === 'multipleChoice' && q.options) {
      console.log(`\n   Options:`);
      q.options.forEach((option, idx) => {
        const isCorrect = option === q.correctAnswer;
        const marker = isCorrect ? `${colors.green}✓${colors.reset}` : ' ';
        console.log(`   ${marker} ${String.fromCharCode(65 + idx)}. ${option}`);
      });
    } else if (q.type === 'trueFalse') {
      console.log(`\n   Answer: ${colors.bright}${q.correctAnswer ? 'True' : 'False'}${colors.reset}`);
    }
    
    if (q.explanation) {
      console.log(`\n   ${colors.yellow}💡 Explanation:${colors.reset}`);
      console.log(`   ${q.explanation}`);
    }
  }
  
  if (questions.length > samplesToShow) {
    console.log(`\n   ${colors.cyan}... and ${questions.length - samplesToShow} more questions${colors.reset}`);
  }
}

/**
 * Main test execution
 */
async function runTest() {
  printHeader('AI AGENT DIRECT TEST - QUIZ GENERATION PROCESS');
  
  console.log(`${colors.bright}Test Configuration:${colors.reset}`);
  console.log(`   Sample Topic: Photosynthesis`);
  console.log(`   Content Length: ${SAMPLE_CONTENT.length} characters`);
  console.log(`   AI Provider: ${process.env.AI_PROVIDER || 'openrouter'}`);
  
  try {
    // Step 1: Initialize pipeline
    const pipeline = await initializePipeline();
    
    // Step 2: Generate quiz
    const result = await generateQuiz(pipeline);
    
    // Step 3: Display agent process
    displayAgentProcess(result);
    
    // Step 4: Display sample questions
    displaySampleQuestions(result);
    
    // Final summary
    printHeader('TEST COMPLETED SUCCESSFULLY');
    printSuccess('All AI agents executed successfully!');
    console.log(`\n${colors.bright}Final Results:${colors.reset}`);
    console.log(`   ✓ Total Questions Generated: ${result.questions.length}`);
    console.log(`   ✓ Average Quality Score: ${result.metadata.qualityMetrics?.averageScore || 'N/A'}/100`);
    console.log(`   ✓ Questions Improved: ${result.metadata.improvementMetrics?.questionsImproved || 0}`);
    console.log(`   ✓ Execution Time: ${(result.metadata.executionTime / 1000).toFixed(2)}s`);
    
    console.log(`\n${colors.green}🎉 The AI Agent Pipeline is working perfectly!${colors.reset}\n`);
    
  } catch (error) {
    printHeader('TEST FAILED');
    printError('Test execution failed!');
    console.error(`\n${colors.red}Error Details:${colors.reset}`);
    console.error(error);
    console.log(`\n${colors.yellow}Troubleshooting:${colors.reset}`);
    console.log(`   1. Check if AI provider API keys are configured in .env`);
    console.log(`   2. Verify internet connection for API calls`);
    console.log(`   3. Check backend logs for detailed error messages`);
    console.log(`   4. Ensure AI_PROVIDER is set correctly in .env\n`);
    process.exit(1);
  }
}

// Run the test
runTest();
