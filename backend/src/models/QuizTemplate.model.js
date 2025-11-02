import mongoose from 'mongoose';

const quizTemplateSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['short', 'long', 'exam', 'custom'],
    required: true
  },
  questionCount: {
    type: Number,
    required: true,
    min: 1
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  questionDistribution: {
    multipleChoice: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 100
    },
    trueFalse: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 100
    },
    fillInBlank: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 100
    },
    matching: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 100
    }
  },
  expirationPeriod: {
    type: Number,
    required: true,
    min: 1
  },
  subjects: [{
    type: String,
    trim: true
  }]
}, { timestamps: true });

// Create indexes for efficient querying
quizTemplateSchema.index({ teacher: 1, type: 1 });
quizTemplateSchema.index({ teacher: 1, name: 1 });

// Validation to ensure distribution percentages sum to 100
quizTemplateSchema.pre('save', function(next) {
  const dist = this.questionDistribution;
  const total = dist.multipleChoice + dist.trueFalse + dist.fillInBlank + dist.matching;
  
  if (total !== 100 && total !== 0) {
    return next(new Error('Question distribution must sum to 100%'));
  }
  
  next();
});

export default mongoose.model('QuizTemplate', quizTemplateSchema);
