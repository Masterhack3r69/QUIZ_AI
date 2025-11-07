import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['multipleChoice', 'trueFalse', 'fillInBlank', 'matching'],
    required: true,
    default: 'multipleChoice'
  },
  question: { 
    type: String, 
    required: true 
  },
  // For multipleChoice type
  options: [{ 
    type: String 
  }],
  // Union type for different question types
  // - multipleChoice: Number (index)
  // - trueFalse: Boolean
  // - fillInBlank: String
  // - matching: not used (uses correctPairs instead)
  correctAnswer: { 
    type: mongoose.Schema.Types.Mixed
  },
  // For fillInBlank type
  caseSensitive: {
    type: Boolean,
    default: false
  },
  // For matching type
  leftColumn: [{
    type: String
  }],
  rightColumn: [{
    type: String
  }],
  correctPairs: [{
    left: { type: Number },
    right: { type: Number }
  }]
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
  startDate: {
    type: Date
  },
  expiresAt: {
    type: Date,
    required: true
  },
  maxStudents: {
    type: Number
  },
  subjects: [{
    type: String,
    trim: true
  }],
  questionDistribution: {
    multipleChoice: { type: Number, default: 0 },
    trueFalse: { type: Number, default: 0 },
    fillInBlank: { type: Number, default: 0 },
    matching: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'draft', 'scheduled', 'full'],
    default: 'active'
  },
  sourceContent: {
    type: {
      type: String,
      enum: ['file', 'topic', 'video', 'url']
    },
    content: String
  },
  studentInfoRequirements: {
    firstName: { type: Boolean, default: true },
    middleName: { type: Boolean, default: false },
    lastName: { type: Boolean, default: true },
    suffix: { type: Boolean, default: false },
    studentId: { type: Boolean, default: true },
    course: { type: Boolean, default: false },
    year: { type: Boolean, default: false },
    section: { type: Boolean, default: false },
    email: { type: Boolean, default: false }
  }
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema);
