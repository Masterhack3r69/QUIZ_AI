import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import templateRoutes from './routes/template.routes.js';
import adminRoutes from './routes/admin.routes.js';
import AgenticPipeline from './services/agentic-pipeline.js';
import aiTaskRouter from './services/ai-task-router.js';
import PromptManager from './services/prompt-manager.js';
import ContentExtractionAgent from './services/agents/content-extraction-agent.js';
import QuestionGenerationAgent from './services/agents/question-generation-agent.js';
import QualityValidationAgent from './services/agents/quality-validation-agent.js';
import QuestionImprovementAgent from './services/agents/question-improvement-agent.js';
import SubjectDetector from './services/subject-detector.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Initialize Agentic Pipeline (if enabled)
let agenticPipeline = null;

const initializeAgenticPipeline = () => {
  try {
    console.log('[Server] Initializing Agentic Pipeline...');
    
    // Check if agentic pipeline is enabled
    const isEnabled = process.env.ENABLE_AGENTIC_PIPELINE === 'true';
    
    if (!isEnabled) {
      console.log('[Server] Agentic Pipeline is disabled (ENABLE_AGENTIC_PIPELINE=false)');
      return null;
    }
    
    // Use the singleton task router instance and create prompt manager
    const taskRouter = aiTaskRouter;
    const promptManager = new PromptManager();
    
    // Initialize all agents
    const agents = {
      contentExtraction: new ContentExtractionAgent(taskRouter, promptManager),
      questionGeneration: new QuestionGenerationAgent(taskRouter, promptManager),
      qualityValidation: new QualityValidationAgent(taskRouter, promptManager),
      questionImprovement: new QuestionImprovementAgent(taskRouter, promptManager),
      subjectDetector: new SubjectDetector(promptManager, taskRouter)
    };
    
    // Initialize pipeline with agents and configuration
    const config = {
      qualityThreshold: 70,
      enableQualityValidation: process.env.ENABLE_QUALITY_VALIDATION === 'true',
      enableQuestionImprovement: process.env.ENABLE_QUESTION_IMPROVEMENT === 'true',
      enableSubjectDetection: process.env.ENABLE_SUBJECT_DETECTION !== 'false', // Enabled by default
      enableLogging: process.env.ENABLE_LOGGING !== 'false', // Enabled by default
      verboseLogging: process.env.VERBOSE_LOGGING === 'true',
      maxImprovementAttempts: 1
    };
    
    const pipeline = new AgenticPipeline(agents, config);
    
    console.log('[Server] Agentic Pipeline initialized successfully', {
      enableQualityValidation: config.enableQualityValidation,
      enableQuestionImprovement: config.enableQuestionImprovement,
      enableSubjectDetection: config.enableSubjectDetection,
      enableLogging: config.enableLogging,
      qualityThreshold: config.qualityThreshold
    });
    
    return pipeline;
    
  } catch (error) {
    console.error('[Server] Failed to initialize Agentic Pipeline:', error.message);
    console.error('[Server] Falling back to traditional quiz generation');
    return null;
  }
};

// Initialize pipeline on startup
agenticPipeline = initializeAgenticPipeline();

// Make pipeline available to routes via app.locals
app.locals.agenticPipeline = agenticPipeline;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://grn9rmqp-3000.asse.devtunnels.ms',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/submission', submissionRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Increase timeout for long-running AI operations (5 minutes)
server.timeout = 300000; // 5 minutes
server.keepAliveTimeout = 310000; // Slightly longer than timeout
server.headersTimeout = 320000; // Slightly longer than keepAliveTimeout

console.log(`Server timeout set to ${server.timeout}ms (${server.timeout / 1000}s)`);
