import express from 'express';
import Quiz from '../models/Quiz.model.js';
import Submission from '../models/Submission.model.js';
import { protect } from '../middleware/auth.middleware.js';
import { 
  generateAccessCode, 
  extractContent, 
  extractVideoContent,
  extractWebContent,
  validateTopicContent,
  generateQuestions 
} from '../utils/quiz.utils.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

// Test route without authentication (for testing only)
router.post('/test-create', upload.single('file'), async (req, res) => {
  try {
    const { 
      title, 
      duration, 
      expiresAt, 
      questionsPerStudent, 
      textContent,
      questionDistribution,
      totalQuestions
    } = req.body;
    
    let content = textContent || '';
    
    // Extract content from uploaded file
    if (req.file) {
      content = await extractContent(req.file);
    }

    if (!content) {
      return res.status(400).json({ message: 'No content provided' });
    }

    // Parse distribution if provided
    let distribution = null;
    if (questionDistribution) {
      try {
        const parsed = typeof questionDistribution === 'string' 
          ? JSON.parse(questionDistribution) 
          : questionDistribution;
        
        distribution = {
          multipleChoice: parseInt(parsed.multipleChoice) || 0,
          trueFalse: parseInt(parsed.trueFalse) || 0,
          fillInBlank: parseInt(parsed.fillInBlank) || 0,
          matching: parseInt(parsed.matching) || 0
        };
      } catch (e) {
        console.error('Error parsing questionDistribution:', e);
      }
    }

    // Generate questions using AI with distribution
    const total = totalQuestions ? parseInt(totalQuestions) : 20;
    const questions = await generateQuestions(content, distribution, total);

    const accessCode = generateAccessCode();

    // Return data without saving to database (for testing)
    const testQuiz = {
      title: title || 'Test Quiz',
      accessCode,
      questions,
      questionsPerStudent: parseInt(questionsPerStudent) || 10,
      duration: parseInt(duration) || 30,
      expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      questionDistribution: distribution || {
        multipleChoice: questions.filter(q => q.type === 'multipleChoice').length,
        trueFalse: questions.filter(q => q.type === 'trueFalse').length,
        fillInBlank: questions.filter(q => q.type === 'fillInBlank').length,
        matching: questions.filter(q => q.type === 'matching').length
      },
      sourceContent: content.substring(0, 1000) // Limit content in response
    };

    res.status(201).json(testQuiz);
  } catch (error) {
    console.error('Test create error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Process video URL and extract content
router.post('/process-video', protect, async (req, res) => {
  try {
    const { videoUrl } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ message: 'Video URL is required' });
    }
    
    const content = await extractVideoContent(videoUrl);
    
    res.json({ 
      content,
      contentLength: content.length,
      message: 'Video transcript extracted successfully'
    });
  } catch (error) {
    console.error('Process video error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Process web URL and extract content
router.post('/process-url', protect, async (req, res) => {
  try {
    const { webUrl } = req.body;
    
    if (!webUrl) {
      return res.status(400).json({ message: 'Web URL is required' });
    }
    
    const content = await extractWebContent(webUrl);
    
    res.json({ 
      content,
      contentLength: content.length,
      message: 'Web content extracted successfully'
    });
  } catch (error) {
    console.error('Process URL error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Process topic text
router.post('/process-topic', protect, async (req, res) => {
  try {
    const { topicText } = req.body;
    
    const content = validateTopicContent(topicText);
    
    res.json({ 
      content,
      contentLength: content.length,
      message: 'Topic content validated successfully'
    });
  } catch (error) {
    console.error('Process topic error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Generate questions from content (unified endpoint)
router.post('/generate-questions', protect, async (req, res) => {
  try {
    const { content, questionDistribution, totalQuestions } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    // Parse distribution if provided
    let distribution = null;
    if (questionDistribution) {
      distribution = {
        multipleChoice: parseInt(questionDistribution.multipleChoice) || 0,
        trueFalse: parseInt(questionDistribution.trueFalse) || 0,
        fillInBlank: parseInt(questionDistribution.fillInBlank) || 0,
        matching: parseInt(questionDistribution.matching) || 0
      };
    }
    
    const total = totalQuestions ? parseInt(totalQuestions) : 20;
    const questions = await generateQuestions(content, distribution, total);
    
    res.json({ 
      questions,
      questionCount: questions.length,
      message: 'Questions generated successfully'
    });
  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create quiz (with file upload or other content sources)
router.post('/create', protect, upload.single('file'), async (req, res) => {
  try {
    const { 
      title, 
      duration, 
      expiresAt, 
      questionsPerStudent, 
      textContent,
      sourceType, // 'file', 'topic', 'video', 'url'
      videoUrl,
      webUrl,
      questionDistribution,
      totalQuestions
    } = req.body;
    
    let content = '';
    let sourceInfo = { type: 'text', content: '' };
    
    // Extract content based on source type
    if (req.file) {
      content = await extractContent(req.file);
      sourceInfo = { type: 'file', content: req.file.originalname };
    } else if (sourceType === 'video' && videoUrl) {
      content = await extractVideoContent(videoUrl);
      sourceInfo = { type: 'video', content: videoUrl };
    } else if (sourceType === 'url' && webUrl) {
      content = await extractWebContent(webUrl);
      sourceInfo = { type: 'url', content: webUrl };
    } else if (sourceType === 'topic' && textContent) {
      content = validateTopicContent(textContent);
      sourceInfo = { type: 'topic', content: textContent.substring(0, 200) + '...' };
    } else if (textContent) {
      content = textContent;
      sourceInfo = { type: 'text', content: textContent.substring(0, 200) + '...' };
    }

    if (!content) {
      return res.status(400).json({ message: 'No content provided' });
    }

    // Parse distribution if provided
    let distribution = null;
    if (questionDistribution) {
      try {
        const parsed = typeof questionDistribution === 'string' 
          ? JSON.parse(questionDistribution) 
          : questionDistribution;
        
        distribution = {
          multipleChoice: parseInt(parsed.multipleChoice) || 0,
          trueFalse: parseInt(parsed.trueFalse) || 0,
          fillInBlank: parseInt(parsed.fillInBlank) || 0,
          matching: parseInt(parsed.matching) || 0
        };
      } catch (e) {
        console.error('Error parsing questionDistribution:', e);
      }
    }

    // Generate questions using AI with distribution
    const total = totalQuestions ? parseInt(totalQuestions) : 20;
    const questions = await generateQuestions(content, distribution, total);

    const accessCode = generateAccessCode();

    // Determine initial status based on startDate
    let initialStatus = 'active';
    if (req.body.startDate) {
      const startDate = new Date(req.body.startDate);
      const now = new Date();
      if (startDate > now) {
        initialStatus = 'scheduled';
      }
    }

    const quiz = await Quiz.create({
      title,
      teacher: req.user._id,
      accessCode,
      questions,
      questionsPerStudent: parseInt(questionsPerStudent) || 10,
      duration: parseInt(duration),
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      expiresAt: new Date(expiresAt),
      maxStudents: req.body.maxStudents ? parseInt(req.body.maxStudents) : undefined,
      subjects: req.body.subjects ? (Array.isArray(req.body.subjects) ? req.body.subjects : JSON.parse(req.body.subjects)) : [],
      status: initialStatus,
      questionDistribution: distribution || {
        multipleChoice: questions.filter(q => q.type === 'multipleChoice').length,
        trueFalse: questions.filter(q => q.type === 'trueFalse').length,
        fillInBlank: questions.filter(q => q.type === 'fillInBlank').length,
        matching: questions.filter(q => q.type === 'matching').length
      },
      sourceContent: {
        type: sourceInfo.type,
        content: content.substring(0, 1000) // Store first 1000 chars
      }
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error('Create quiz error:', error);
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
        let statusChanged = false;
        
        // Check if quiz has a start date
        if (quiz.startDate) {
          const startDate = new Date(quiz.startDate);
          
          // Quiz hasn't started yet
          if (now < startDate && quiz.status !== 'scheduled') {
            quiz.status = 'scheduled';
            statusChanged = true;
          }
          // Quiz has started, update from scheduled to active
          else if (now >= startDate && quiz.status === 'scheduled') {
            quiz.status = 'active';
            statusChanged = true;
          }
        }
        
        // Check if quiz has reached max students limit
        if (quiz.maxStudents && submissionCount >= quiz.maxStudents && quiz.status !== 'full') {
          quiz.status = 'full';
          statusChanged = true;
        }
        
        // Check if quiz has expired (but don't override 'full' status)
        const expiresAt = new Date(quiz.expiresAt);
        if (now > expiresAt && quiz.status !== 'expired' && quiz.status !== 'full') {
          quiz.status = 'expired';
          statusChanged = true;
        }
        
        if (statusChanged) {
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

    const now = new Date();
    let statusChanged = false;
    
    // Check if quiz has a start date
    if (quiz.startDate) {
      const startDate = new Date(quiz.startDate);
      
      // Quiz hasn't started yet
      if (now < startDate && quiz.status !== 'scheduled') {
        quiz.status = 'scheduled';
        statusChanged = true;
      }
      // Quiz has started, update from scheduled to active
      else if (now >= startDate && quiz.status === 'scheduled') {
        quiz.status = 'active';
        statusChanged = true;
      }
    }
    
    // Check if quiz has expired
    const expiresAt = new Date(quiz.expiresAt);
    if (now > expiresAt && quiz.status !== 'expired' && quiz.status !== 'full') {
      quiz.status = 'expired';
      statusChanged = true;
    }
    
    if (statusChanged) {
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
      .select('title duration questionsPerStudent expiresAt startDate status maxStudents studentInfoRequirements');

    if (!quiz) {
      return res.status(404).json({ message: 'Invalid quiz code' });
    }

    const now = new Date();
    let statusChanged = false;

    // Check if quiz has a start date and hasn't started yet
    if (quiz.startDate) {
      const startDate = new Date(quiz.startDate);
      if (now < startDate) {
        // Update status to scheduled if not already
        if (quiz.status !== 'scheduled') {
          quiz.status = 'scheduled';
          statusChanged = true;
        }
        
        if (statusChanged) await quiz.save();
        
        return res.status(400).json({ 
          message: 'This quiz has not started yet',
          startDate: quiz.startDate
        });
      }
      
      // Quiz has started, update from scheduled to active if needed
      if (quiz.status === 'scheduled') {
        quiz.status = 'active';
        statusChanged = true;
      }
    }

    // Check if quiz has expired
    const expiresAt = new Date(quiz.expiresAt);
    if (now > expiresAt) {
      if (quiz.status !== 'expired') {
        quiz.status = 'expired';
        statusChanged = true;
      }
      
      if (statusChanged) await quiz.save();
      
      return res.status(400).json({ message: 'This quiz has expired and is no longer available' });
    }

    // Check if quiz has reached max students limit
    if (quiz.maxStudents) {
      const submissionCount = await Submission.countDocuments({ quiz: quiz._id });
      
      if (submissionCount >= quiz.maxStudents) {
        if (quiz.status !== 'full') {
          quiz.status = 'full';
          statusChanged = true;
        }
        
        if (statusChanged) await quiz.save();
        
        return res.status(400).json({ 
          message: 'This quiz has reached its maximum number of participants',
          maxStudents: quiz.maxStudents,
          currentSubmissions: submissionCount
        });
      }
    }

    if (statusChanged) await quiz.save();

    res.json({
      ...quiz.toObject(),
      currentSubmissions: quiz.maxStudents ? await Submission.countDocuments({ quiz: quiz._id }) : undefined
    });
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

    const now = new Date();
    let statusChanged = false;

    // Check if quiz has a start date and hasn't started yet
    if (quiz.startDate) {
      const startDate = new Date(quiz.startDate);
      if (now < startDate) {
        // Update status to scheduled if not already
        if (quiz.status !== 'scheduled') {
          quiz.status = 'scheduled';
          statusChanged = true;
        }
        
        if (statusChanged) await quiz.save();
        
        return res.status(400).json({ 
          message: 'This quiz has not started yet',
          startDate: quiz.startDate
        });
      }
      
      // Quiz has started, update from scheduled to active if needed
      if (quiz.status === 'scheduled') {
        quiz.status = 'active';
        statusChanged = true;
      }
    }

    // Check if quiz has expired
    const expiresAt = new Date(quiz.expiresAt);
    if (now > expiresAt) {
      if (quiz.status !== 'expired') {
        quiz.status = 'expired';
        statusChanged = true;
      }
      
      if (statusChanged) await quiz.save();
      
      return res.status(400).json({ message: 'This quiz has expired and is no longer available' });
    }

    // Check if quiz has reached max students limit
    if (quiz.maxStudents) {
      const submissionCount = await Submission.countDocuments({ quiz: quiz._id });
      
      if (submissionCount >= quiz.maxStudents) {
        if (quiz.status !== 'full') {
          quiz.status = 'full';
          statusChanged = true;
        }
        
        if (statusChanged) await quiz.save();
        
        return res.status(400).json({ 
          message: 'This quiz has reached its maximum number of participants',
          maxStudents: quiz.maxStudents,
          currentSubmissions: submissionCount
        });
      }
    }

    if (statusChanged) await quiz.save();

    // Randomize and select questions
    const shuffled = [...quiz.questions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, quiz.questionsPerStudent);

    // Remove correct answers from response based on question type
    const questionsForStudent = selectedQuestions.map(q => {
      const baseQuestion = {
        _id: q._id,
        type: q.type || 'multipleChoice',
        question: q.question
      };
      
      // Add type-specific fields (without correct answers)
      switch (q.type) {
        case 'multipleChoice':
          // Randomize options order for multiple choice
          const optionsWithIndex = q.options.map((opt, idx) => ({ opt, idx }));
          const shuffledOptions = optionsWithIndex.sort(() => Math.random() - 0.5);
          baseQuestion.options = shuffledOptions.map(item => item.opt);
          // Store mapping for grading (not sent to client)
          break;
        
        case 'trueFalse':
          // No additional fields needed
          break;
        
        case 'fillInBlank':
          baseQuestion.caseSensitive = q.caseSensitive || false;
          break;
        
        case 'matching':
          baseQuestion.leftColumn = q.leftColumn;
          // Randomize right column
          baseQuestion.rightColumn = [...q.rightColumn].sort(() => Math.random() - 0.5);
          break;
        
        default:
          // Fallback to multiple choice format
          baseQuestion.options = q.options || [];
      }
      
      return baseQuestion;
    });

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
