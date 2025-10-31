import express from 'express';
import Quiz from '../models/Quiz.model.js';
import Submission from '../models/Submission.model.js';
import { protect } from '../middleware/auth.middleware.js';
import { generateAccessCode, extractContent, generateQuestions } from '../utils/quiz.utils.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

// Test route without authentication (for testing only)
router.post('/test-create', upload.single('file'), async (req, res) => {
  try {
    const { title, duration, expiresAt, questionsPerStudent, textContent } = req.body;
    
    let content = textContent || '';
    
    // Extract content from uploaded file
    if (req.file) {
      content = await extractContent(req.file);
    }

    if (!content) {
      return res.status(400).json({ message: 'No content provided' });
    }

    // Generate questions using AI
    const questions = await generateQuestions(content);

    const accessCode = generateAccessCode();

    // Return data without saving to database (for testing)
    const testQuiz = {
      title: title || 'Test Quiz',
      accessCode,
      questions,
      questionsPerStudent: parseInt(questionsPerStudent) || 10,
      duration: parseInt(duration) || 30,
      expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      sourceContent: content.substring(0, 1000) // Limit content in response
    };

    res.status(201).json(testQuiz);
  } catch (error) {
    console.error('Test create error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create quiz (with file upload)
router.post('/create', protect, upload.single('file'), async (req, res) => {
  try {
    const { title, duration, expiresAt, questionsPerStudent, textContent } = req.body;
    
    let content = textContent || '';
    
    // Extract content from uploaded file
    if (req.file) {
      content = await extractContent(req.file);
    }

    // Generate questions using AI
    const questions = await generateQuestions(content);

    const accessCode = generateAccessCode();

    const quiz = await Quiz.create({
      title,
      teacher: req.user._id,
      accessCode,
      questions,
      questionsPerStudent: parseInt(questionsPerStudent) || 10,
      duration: parseInt(duration),
      expiresAt: new Date(expiresAt),
      sourceContent: content
    });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all quizzes for teacher
router.get('/my-quizzes', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ teacher: req.user._id })
      .select('-questions -sourceContent')
      .sort('-createdAt');
    
    const now = new Date();
    
    // Get submission counts and update status for each quiz
    const quizzesWithCounts = await Promise.all(
      quizzes.map(async (quiz) => {
        const submissionCount = await Submission.countDocuments({ quiz: quiz._id });
        
        // Automatically update status if quiz has expired
        const expiresAt = new Date(quiz.expiresAt);
        if (quiz.status === 'active' && now > expiresAt) {
          quiz.status = 'expired';
          await quiz.save();
        }
        
        return {
          ...quiz.toObject(),
          submissionCount
        };
      })
    );
    
    res.json(quizzesWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get quiz by ID (teacher)
router.get('/:quizId', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ 
      _id: req.params.quizId, 
      teacher: req.user._id 
    });
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Automatically update status if quiz has expired
    const now = new Date();
    const expiresAt = new Date(quiz.expiresAt);
    if (quiz.status === 'active' && now > expiresAt) {
      quiz.status = 'expired';
      await quiz.save();
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Validate quiz code (student)
router.post('/validate', async (req, res) => {
  try {
    const { accessCode } = req.body;
    
    const quiz = await Quiz.findOne({ accessCode: accessCode.toUpperCase() })
      .select('title duration questionsPerStudent expiresAt status');

    if (!quiz) {
      return res.status(404).json({ message: 'Invalid quiz code' });
    }

    // Automatically update status if quiz has expired
    const now = new Date();
    const expiresAt = new Date(quiz.expiresAt);
    if (quiz.status === 'active' && now > expiresAt) {
      quiz.status = 'expired';
      await quiz.save();
    }

    // Check if quiz is expired
    if (quiz.status === 'expired') {
      return res.status(400).json({ message: 'This quiz has expired and is no longer available' });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get randomized questions for student
router.post('/start', async (req, res) => {
  try {
    const { accessCode } = req.body;
    
    const quiz = await Quiz.findOne({ accessCode: accessCode.toUpperCase() });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Automatically update status if quiz has expired
    const now = new Date();
    const expiresAt = new Date(quiz.expiresAt);
    if (quiz.status === 'active' && now > expiresAt) {
      quiz.status = 'expired';
      await quiz.save();
    }

    // Check if quiz is expired
    if (quiz.status === 'expired') {
      return res.status(400).json({ message: 'This quiz has expired and is no longer available' });
    }

    // Randomize and select questions
    const shuffled = [...quiz.questions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, quiz.questionsPerStudent);

    // Remove correct answers from response
    const questionsForStudent = selectedQuestions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options
    }));

    res.json({
      quizId: quiz._id,
      title: quiz.title,
      duration: quiz.duration,
      questions: questionsForStudent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update quiz
router.put('/:quizId', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.quizId, teacher: req.user._id },
      req.body,
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete quiz
router.delete('/:quizId', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndDelete({ 
      _id: req.params.quizId, 
      teacher: req.user._id 
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
