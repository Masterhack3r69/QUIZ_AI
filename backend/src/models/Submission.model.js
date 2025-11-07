import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  questionType: {
    type: String,
    enum: ['multipleChoice', 'trueFalse', 'fillInBlank', 'matching'],
    required: true
  },
  // Support multiple answer types:
  // - multipleChoice: Number (index)
  // - trueFalse: Boolean
  // - fillInBlank: String
  // - matching: Array of {left: Number, right: Number}
  selectedAnswer: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  isCorrect: { 
    type: Boolean, 
    required: true 
  }
});

const submissionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  studentInfo: {
    firstName: { type: String, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    suffix: { type: String, trim: true },
    studentId: { type: String, trim: true },
    course: { type: String, trim: true },
    year: { type: String, trim: true },
    section: { type: String, trim: true },
    email: { type: String, trim: true }
  },
  // Legacy fields for backward compatibility
  studentName: {
    type: String,
    trim: true
  },
  studentId: {
    type: String,
    trim: true
  },
  answers: [answerSchema],
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Static method to grade an answer based on question type
submissionSchema.statics.gradeAnswer = function(question, selectedAnswer) {
  switch (question.type) {
    case 'multipleChoice':
      return selectedAnswer === question.correctAnswer;
    
    case 'trueFalse':
      return selectedAnswer === question.correctAnswer;
    
    case 'fillInBlank':
      if (typeof selectedAnswer !== 'string' || typeof question.correctAnswer !== 'string') {
        return false;
      }
      const studentAnswer = question.caseSensitive 
        ? selectedAnswer.trim() 
        : selectedAnswer.trim().toLowerCase();
      const correctAnswer = question.caseSensitive 
        ? question.correctAnswer.trim() 
        : question.correctAnswer.trim().toLowerCase();
      return studentAnswer === correctAnswer;
    
    case 'matching':
      if (!Array.isArray(selectedAnswer) || !Array.isArray(question.correctPairs)) {
        return false;
      }
      // Check if all pairs match and have same length
      if (selectedAnswer.length !== question.correctPairs.length) {
        return false;
      }
      return selectedAnswer.every(pair => 
        question.correctPairs.some(cp => 
          cp.left === pair.left && cp.right === pair.right
        )
      );
    
    default:
      return false;
  }
};

export default mongoose.model('Submission', submissionSchema);
