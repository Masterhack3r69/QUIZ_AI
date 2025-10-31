import express from 'express';
import Submission from '../models/Submission.model.js';
import Quiz from '../models/Quiz.model.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Submit quiz (student)
router.post('/submit', async (req, res) => {
  try {
    console.log('📝 Submission request received:', {
      quizId: req.body.quizId,
      studentName: req.body.studentName,
      studentId: req.body.studentId,
      answersCount: req.body.answers?.length
    });

    const { quizId, studentName, studentId, answers, timeTaken } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      console.log('❌ Quiz not found:', quizId);
      return res.status(404).json({ message: 'Quiz not found' });
    }

    console.log('✅ Quiz found:', quiz.title);

    // Grade answers
    let score = 0;
    const gradedAnswers = answers.map(answer => {
      const question = quiz.questions.id(answer.questionId);
      if (!question) {
        console.log('⚠️ Question not found:', answer.questionId);
        return null;
      }
      const isCorrect = question.correctAnswer === answer.selectedAnswer;
      if (isCorrect) score++;
      
      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect
      };
    }).filter(a => a !== null);

    console.log('📊 Grading complete. Score:', score, '/', gradedAnswers.length);

    const submission = await Submission.create({
      quiz: quizId,
      studentName,
      studentId,
      answers: gradedAnswers,
      score,
      totalQuestions: answers.length,
      timeTaken
    });

    console.log('✅ Submission saved:', submission._id);

    res.status(201).json({
      score,
      totalQuestions: answers.length,
      submissionId: submission._id,
      answers: gradedAnswers
    });
  } catch (error) {
    console.error('❌ Submission error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get submissions for a quiz (teacher)
router.get('/quiz/:quizId', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ 
      _id: req.params.quizId, 
      teacher: req.user._id 
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const submissions = await Submission.find({ quiz: req.params.quizId })
      .sort('-submittedAt');

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get analytics for a quiz (teacher)
router.get('/analytics/:quizId', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ 
      _id: req.params.quizId, 
      teacher: req.user._id 
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const submissions = await Submission.find({ quiz: req.params.quizId });

    if (submissions.length === 0) {
      return res.json({
        totalSubmissions: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0
      });
    }

    const scores = submissions.map(s => s.score);
    const totalQuestions = submissions[0].totalQuestions;

    // Calculate question statistics
    const questionStatsMap = new Map();
    
    submissions.forEach(submission => {
      submission.answers.forEach(answer => {
        const questionId = answer.questionId.toString();
        
        if (!questionStatsMap.has(questionId)) {
          // Find the question text from the quiz
          const question = quiz.questions.id(answer.questionId);
          questionStatsMap.set(questionId, {
            questionId,
            question: question ? question.question : 'Unknown question',
            correctCount: 0,
            totalAttempts: 0
          });
        }
        
        const stats = questionStatsMap.get(questionId);
        stats.totalAttempts++;
        if (answer.isCorrect) {
          stats.correctCount++;
        }
      });
    });

    // Convert map to array and calculate accuracy rates
    const questionStats = Array.from(questionStatsMap.values()).map(stat => ({
      ...stat,
      accuracyRate: stat.totalAttempts > 0 
        ? parseFloat(((stat.correctCount / stat.totalAttempts) * 100).toFixed(1))
        : 0
    }));

    // Sort by accuracy rate (lowest first) to highlight most missed questions
    questionStats.sort((a, b) => a.accuracyRate - b.accuracyRate);

    const analytics = {
      totalSubmissions: submissions.length,
      averageScore: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      totalQuestions,
      submissions: submissions.map(s => ({
        studentName: s.studentName,
        studentId: s.studentId,
        score: s.score,
        totalQuestions: s.totalQuestions,
        percentage: ((s.score / s.totalQuestions) * 100).toFixed(1),
        timeTaken: s.timeTaken,
        submittedAt: s.submittedAt
      })),
      questionStats
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
