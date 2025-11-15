/**
 * Live AI Agent Test Script
 * 
 * Tests the complete AI agent pipeline with a real account:
 * 1. Login with provided credentials
 * 2. Upload sample educational content
 * 3. Generate quiz using AI agent pipeline
 * 4. Display detailed process logs
 * 
 * Usage: node scripts/test-ai-agent-live.js
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const TEST_EMAIL = 'jdedusma@gmail.com';
const TEST_PASSWORD = '3Quetras';

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
  console.log(`${colors.bright}${colors.blue}[Step ${stepNumber}]${colors.reset} ${text}`);
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
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Step 1: Login with test account
 */
async function loginUser() {
  printStep(1, 'Logging in with test account');
  printInfo(`Email: ${TEST_EMAIL}`);
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    const { token, user } = response.data;
    
    printSuccess('Login successful!');
    console.log(`   User ID: ${user._id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Token: ${token.substring(0, 20)}...`);
    
    return { token, userId: user._id };
    
  } catch (error) {
    printError('Login failed!');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data.message || error.response.data.error}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Step 2: Create quiz with AI agent pipeline
 */
async function createQuizWithAI(token) {
  printStep(2, 'Creating quiz with AI Agent Pipeline');
  printInfo('Topic: Photosynthesis');
  printInfo(`Content length: ${SAMPLE_CONTENT.length} characters`);
  
  try {
    // Prepare quiz data
    const quizData = {
      title: 'Photosynthesis Quiz - AI Generated',
      textContent: SAMPLE_CONTENT,
      sourceType: 'topic', // Valid enum: 'file', 'topic', 'video', 'url'
      duration: 30,
      questionsPerStudent: 10,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      questionDistribution: {
        multipleChoice: 12,
        trueFalse: 3,
        fillInBlank: 0,
        matching: 0
      },
      totalQuestions: 15,
      useAgenticPipeline: true // Enable AI agent pipeline
    };
    
    printInfo('Sending request to create quiz...');
    console.log(`\n${colors.yellow}Quiz Configuration:${colors.reset}`);
    console.log(formatJSON({
      title: quizData.title,
      totalQuestions: quizData.totalQuestions,
      distribution: quizData.questionDistribution,
      duration: quizData.duration,
      useAgenticPipeline: quizData.useAgenticPipeline
    }));
    
    // Make request
    const response = await axios.post(
      `${API_BASE_URL}/quiz/create`,
      quizData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 300000 // 5 minutes timeout for AI processing (free models are slower)
      }
    );
    
    const quiz = response.data;
    
    printSuccess('Quiz created successfully!');
    console.log(`   Quiz ID: ${quiz._id}`);
    console.log(`   Access Code: ${colors.bright}${colors.green}${quiz.accessCode}${colors.reset}`);
    console.log(`   Questions Generated: ${quiz.questions.length}`);
    
    return quiz;
    
  } catch (error) {
    printError('Quiz creation failed!');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data.message || error.response.data.error}`);
      if (error.response.data.details) {
        console.log(`   Details: ${formatJSON(error.response.data.details)}`);
      }
    } else if (error.code === 'ECONNABORTED') {
      console.log(`   Error: Request timeout - AI processing took too long`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Step 3: Display AI Agent Process Details
 */
function displayAgentProcess(quiz) {
  printStep(3, 'AI Agent Pipeline Process Details');
  
  if (!quiz.metadata || !quiz.metadata.agenticPipeline) {
    printInfo('No agentic pipeline metadata available');
    printInfo('The quiz may have been created with traditional generation');
    return;
  }
  
  const metadata = quiz.metadata.agenticPipeline;
  
  // Display execution summary
  console.log(`\n${colors.bright}Execution Summary:${colors.reset}`);
  console.log(`   Total Execution Time: ${metadata.executionTime}ms (${(metadata.executionTime / 1000).toFixed(2)}s)`);
  console.log(`   Generated At: ${new Date(metadata.generatedAt).toLocaleString()}`);
  
  // Display concepts extracted
  if (metadata.concepts) {
    console.log(`\n${colors.bright}${colors.magenta}Agent 1: Content Extraction${colors.reset}`);
    printAgent('Content Extraction', 'Analyzed educational content');
    
    if (metadata.concepts.mainTopics) {
      console.log(`\n   Main Topics (${metadata.concepts.mainTopics.length}):`);
      metadata.concepts.mainTopics.forEach((topic, i) => {
        console.log(`   ${i + 1}. ${topic}`);
      });
    }
    
    if (metadata.concepts.keyConcepts) {
      console.log(`\n   Key Concepts (${metadata.concepts.keyConcepts.length}):`);
      metadata.concepts.keyConcepts.slice(0, 5).forEach((concept, i) => {
        console.log(`   ${i + 1}. ${concept}`);
      });
      if (metadata.concepts.keyConcepts.length > 5) {
        console.log(`   ... and ${metadata.concepts.keyConcepts.length - 5} more`);
      }
    }
  }
  
  // Display question generation
  console.log(`\n${colors.bright}${colors.magenta}Agent 2: Question Generation${colors.reset}`);
  printAgent('Question Generation', 'Generated questions from concepts');
  console.log(`\n   Questions Generated: ${metadata.totalQuestions}`);
  console.log(`   Distribution:`);
  Object.entries(metadata.distribution).forEach(([type, count]) => {
    if (count > 0) {
      console.log(`      ${type}: ${count}`);
    }
  });
  
  // Display quality validation
  if (metadata.qualityMetrics) {
    console.log(`\n${colors.bright}${colors.magenta}Agent 3: Quality Validation${colors.reset}`);
    printAgent('Quality Validation', 'Evaluated question quality');
    
    const qm = metadata.qualityMetrics;
    console.log(`\n   Average Quality Score: ${qm.averageScore}/100`);
    console.log(`   Pass Rate: ${qm.passRate}%`);
    console.log(`   Questions Passed: ${qm.passCount}/${qm.totalQuestions}`);
    
    if (qm.gradeDistribution) {
      console.log(`\n   Grade Distribution:`);
      Object.entries(qm.gradeDistribution).forEach(([grade, count]) => {
        if (count > 0) {
          const bar = '█'.repeat(Math.ceil(count / 2));
          console.log(`      ${grade.padEnd(10)}: ${bar} (${count})`);
        }
      });
    }
  }
  
  // Display question improvement
  if (metadata.improvementMetrics) {
    console.log(`\n${colors.bright}${colors.magenta}Agent 4: Question Improvement${colors.reset}`);
    printAgent('Question Improvement', 'Enhanced low-quality questions');
    
    const im = metadata.improvementMetrics;
    console.log(`\n   Questions Improved: ${im.questionsImproved}`);
    console.log(`   Average Score Increase: +${im.averageScoreIncrease} points`);
  }
}

/**
 * Step 4: Display sample questions
 */
function displaySampleQuestions(quiz) {
  printStep(4, 'Sample Generated Questions');
  
  if (!quiz.questions || quiz.questions.length === 0) {
    printInfo('No questions available');
    return;
  }
  
  // Show first 3 questions
  const samplesToShow = Math.min(3, quiz.questions.length);
  
  for (let i = 0; i < samplesToShow; i++) {
    const q = quiz.questions[i];
    
    console.log(`\n${colors.bright}Question ${i + 1}:${colors.reset}`);
    console.log(`   Type: ${q.type}`);
    console.log(`   Difficulty: ${q.difficulty || 'medium'}`);
    console.log(`\n   ${colors.cyan}${q.question}${colors.reset}`);
    
    if (q.type === 'multipleChoice' && q.options) {
      console.log(`\n   Options:`);
      q.options.forEach((option, idx) => {
        const isCorrect = option === q.correctAnswer;
        const marker = isCorrect ? `${colors.green}✓${colors.reset}` : ' ';
        console.log(`   ${marker} ${String.fromCharCode(65 + idx)}. ${option}`);
      });
    } else if (q.type === 'trueFalse') {
      console.log(`\n   Answer: ${q.correctAnswer ? 'True' : 'False'}`);
    }
    
    if (q.explanation) {
      console.log(`\n   ${colors.yellow}Explanation:${colors.reset} ${q.explanation}`);
    }
  }
  
  if (quiz.questions.length > samplesToShow) {
    console.log(`\n   ... and ${quiz.questions.length - samplesToShow} more questions`);
  }
}

/**
 * Main test execution
 */
async function runTest() {
  printHeader('AI AGENT LIVE TEST - QUIZ GENERATION PROCESS');
  
  console.log(`${colors.bright}Test Configuration:${colors.reset}`);
  console.log(`   API Base URL: ${API_BASE_URL}`);
  console.log(`   Test Account: ${TEST_EMAIL}`);
  console.log(`   Sample Topic: Photosynthesis`);
  console.log(`   Content Length: ${SAMPLE_CONTENT.length} characters`);
  
  try {
    // Step 1: Login
    const { token, userId } = await loginUser();
    await sleep(1000);
    
    // Step 2: Create quiz with AI
    const quiz = await createQuizWithAI(token);
    await sleep(1000);
    
    // Step 3: Display agent process
    displayAgentProcess(quiz);
    await sleep(1000);
    
    // Step 4: Display sample questions
    displaySampleQuestions(quiz);
    
    // Final summary
    printHeader('TEST COMPLETED SUCCESSFULLY');
    printSuccess('All steps completed!');
    console.log(`\n${colors.bright}Quiz Access Information:${colors.reset}`);
    console.log(`   Quiz ID: ${quiz._id}`);
    console.log(`   Access Code: ${colors.bright}${colors.green}${quiz.accessCode}${colors.reset}`);
    console.log(`   Total Questions: ${quiz.questions.length}`);
    console.log(`\n${colors.yellow}Students can access this quiz at:${colors.reset}`);
    console.log(`   ${process.env.FRONTEND_URL || 'http://localhost:3000'}/quiz/${quiz.accessCode}/start`);
    
  } catch (error) {
    printHeader('TEST FAILED');
    printError('Test execution failed!');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
runTest();
