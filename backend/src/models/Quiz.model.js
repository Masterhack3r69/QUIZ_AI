import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accessCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  questions: [questionSchema],
  questionsPerStudent: {
    type: Number,
    required: true,
    default: 10
  },
  duration: {
    type: Number,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'draft'],
    default: 'active'
  },
  sourceContent: {
    type: String
  }
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema);
