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
      studentInfo: req.body.studentInfo,
      answersCount: req.body.answers?.length
    });

    const { quizId, studentInfo, answers, timeTaken } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      console.log('❌ Quiz not found:', quizId);
      return res.status(404).json({ message: 'Quiz not found' });
    }

    console.log('✅ Quiz found:', quiz.title);

    // Check if quiz has expired
    const now = new Date();
    const expiresAt = new Date(quiz.expiresAt);
    if (now > expiresAt) {
      if (quiz.status !== 'expired') {
        quiz.status = 'expired';
        await quiz.save();
      }
      console.log('❌ Quiz has expired');
      return res.status(400).json({ 
        message: 'This quiz has expired and is no longer accepting submissions',
        expiresAt: quiz.expiresAt
      });
    }

    // Check if quiz has reached max students limit before accepting submission
    if (quiz.maxStudents) {
      const currentSubmissionCount = await Submission.countDocuments({ quiz: quizId });
      
      if (currentSubmissionCount >= quiz.maxStudents) {
        console.log('❌ Quiz is full:', currentSubmissionCount, '>=', quiz.maxStudents);
        return res.status(400).json({ 
          message: 'This quiz has reached its maximum number of participants',
          maxStudents: quiz.maxStudents,
          currentSubmissions: currentSubmissionCount
        });
      }
    }

    // Grade answers using the Submission model's grading method
    let score = 0;
    const gradedAnswers = answers.map(answer => {
      const question = quiz.questions.id(answer.questionId);
      if (!question) {
        console.log('⚠️ Question not found:', answer.questionId);
        return null;
      }
      
      // Use the static grading method that handles all question types
      const isCorrect = Submission.gradeAnswer(question, answer.selectedAnswer);
      if (isCorrect) score++;
      
      return {
        questionId: answer.questionId,
        questionType: answer.questionType || question.type || 'multipleChoice',
        selectedAnswer: answer.selectedAnswer,
        isCorrect
      };
    }).filter(a => a !== null);

    console.log('📊 Grading complete. Score:', score, '/', gradedAnswers.length);

    // Build full name for legacy compatibility
    const fullName = [
      studentInfo?.firstName,
      studentInfo?.middleName,
      studentInfo?.lastName,
      studentInfo?.suffix
    ].filter(Boolean).join(' ') || 'Unknown Student';

    const submission = await Submission.create({
      quiz: quizId,
      studentInfo: studentInfo || {},
      studentName: fullName, // Legacy field
      studentId: studentInfo?.studentId || '', // Legacy field
      answers: gradedAnswers,
      score,
      totalQuestions: answers.length,
      timeTaken
    });

    console.log('✅ Submission saved:', submission._id);

    // Check if quiz has now reached max students limit and update status
    if (quiz.maxStudents) {
      const newSubmissionCount = await Submission.countDocuments({ quiz: quizId });
      
      if (newSubmissionCount >= quiz.maxStudents && quiz.status !== 'full') {
        quiz.status = 'full';
        await quiz.save();
        console.log('📊 Quiz status updated to full:', newSubmissionCount, '>=', quiz.maxStudents);
      }
    }

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

    // Calculate question statistics and type breakdown
    const questionStatsMap = new Map();
    const typeStats = {
      multipleChoice: { correct: 0, total: 0 },
      trueFalse: { correct: 0, total: 0 },
      fillInBlank: { correct: 0, total: 0 },
      matching: { correct: 0, total: 0 }
    };
    
    submissions.forEach(submission => {
      submission.answers.forEach(answer => {
        const questionId = answer.questionId.toString();
        
        if (!questionStatsMap.has(questionId)) {
          // Find the question text from the quiz
          const question = quiz.questions.id(answer.questionId);
          questionStatsMap.set(questionId, {
            questionId,
            question: question ? question.question : 'Unknown question',
            questionType: question ? question.type : 'multipleChoice',
            correctCount: 0,
            totalAttempts: 0
          });
        }
        
        const stats = questionStatsMap.get(questionId);
        stats.totalAttempts++;
        if (answer.isCorrect) {
          stats.correctCount++;
        }

        // Track by question type
        const questionType = answer.questionType || 'multipleChoice';
        if (typeStats[questionType]) {
          typeStats[questionType].total++;
          if (answer.isCorrect) {
            typeStats[questionType].correct++;
          }
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

    // Calculate average score by question type
    const scoresByType = {};
    Object.keys(typeStats).forEach(type => {
      const stats = typeStats[type];
      scoresByType[type] = stats.total > 0
        ? parseFloat(((stats.correct / stats.total) * 100).toFixed(1))
        : 0;
    });

    // Calculate question type distribution
    const questionTypeBreakdown = {};
    Object.keys(typeStats).forEach(type => {
      questionTypeBreakdown[type] = typeStats[type].total;
    });

    const analytics = {
      summary: {
        totalSubmissions: submissions.length,
        averageScore: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)),
        highestScore: Math.max(...scores),
        lowestScore: Math.min(...scores),
        questionTypeBreakdown,
        averageScoreByType: scoresByType
      },
      totalQuestions,
      submissions: submissions.map(s => {
        // Build display name from studentInfo or fall back to legacy field
        const displayName = s.studentInfo && Object.keys(s.studentInfo).length > 0
          ? [
              s.studentInfo.firstName,
              s.studentInfo.middleName,
              s.studentInfo.lastName,
              s.studentInfo.suffix
            ].filter(Boolean).join(' ')
          : s.studentName || 'Unknown Student';

        return {
          studentName: displayName,
          studentId: s.studentInfo?.studentId || s.studentId,
          studentInfo: s.studentInfo,
          score: s.score,
          totalQuestions: s.totalQuestions,
          percentage: ((s.score / s.totalQuestions) * 100).toFixed(1),
          timeTaken: s.timeTaken,
          submittedAt: s.submittedAt
        };
      }),
      questionStats
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
