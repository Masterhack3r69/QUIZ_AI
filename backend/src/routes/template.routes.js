import express from 'express';
import QuizTemplate from '../models/QuizTemplate.model.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Predefined templates configuration
const PREDEFINED_TEMPLATES = {
  short: {
    name: 'Short Quiz',
    type: 'short',
    questionCount: 10,
    duration: 15,
    questionDistribution: {
      multipleChoice: 100,
      trueFalse: 0,
      fillInBlank: 0,
      matching: 0
    },
    expirationPeriod: 7,
    subjects: []
  },
  long: {
    name: 'Long Quiz',
    type: 'long',
    questionCount: 25,
    duration: 45,
    questionDistribution: {
      multipleChoice: 70,
      trueFalse: 20,
      fillInBlank: 10,
      matching: 0
    },
    expirationPeriod: 14,
    subjects: []
  },
  exam: {
    name: 'Exam',
    type: 'exam',
    questionCount: 50,
    duration: 90,
    questionDistribution: {
      multipleChoice: 60,
      trueFalse: 20,
      fillInBlank: 10,
      matching: 10
    },
    expirationPeriod: 30,
    subjects: []
  }
};

// Create new template
router.post('/', protect, async (req, res) => {
  try {
    const { name, type, questionCount, duration, questionDistribution, expirationPeriod, subjects } = req.body;

    // Validation
    if (!name || !type || !questionCount || !duration || !expirationPeriod) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate question count
    if (questionCount < 1) {
      return res.status(400).json({ message: 'Question count must be at least 1' });
    }

    // Validate duration
    if (duration < 1) {
      return res.status(400).json({ message: 'Duration must be at least 1 minute' });
    }

    // Validate expiration period
    if (expirationPeriod < 1) {
      return res.status(400).json({ message: 'Expiration period must be at least 1 day' });
    }

    // Validate question distribution if provided
    if (questionDistribution) {
      const { multipleChoice = 0, trueFalse = 0, fillInBlank = 0, matching = 0 } = questionDistribution;
      const total = multipleChoice + trueFalse + fillInBlank + matching;
      
      if (total !== 100 && total !== 0) {
        return res.status(400).json({ message: 'Question distribution must sum to 100%' });
      }

      // Validate individual percentages
      if (multipleChoice < 0 || multipleChoice > 100 ||
          trueFalse < 0 || trueFalse > 100 ||
          fillInBlank < 0 || fillInBlank > 100 ||
          matching < 0 || matching > 100) {
        return res.status(400).json({ message: 'Each question type percentage must be between 0 and 100' });
      }
    }

    // Validate type
    if (!['short', 'long', 'exam', 'custom'].includes(type)) {
      return res.status(400).json({ message: 'Invalid template type' });
    }

    // Prevent creating predefined template types
    if (['short', 'long', 'exam'].includes(type)) {
      return res.status(400).json({ message: 'Cannot create templates with predefined types. Use type "custom" instead.' });
    }

    const template = await QuizTemplate.create({
      teacher: String(req.user.id),
      name: name.trim(),
      type,
      questionCount,
      duration,
      questionDistribution: questionDistribution || {
        multipleChoice: 100,
        trueFalse: 0,
        fillInBlank: 0,
        matching: 0
      },
      expirationPeriod,
      subjects: subjects || []
    });

    res.status(201).json(template);
  } catch (error) {
    if (error.message.includes('Question distribution')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// Get all templates for logged-in teacher (including predefined)
router.get('/', protect, async (req, res) => {
  try {
    // Get custom templates created by the teacher
    const customTemplates = await QuizTemplate.find({ teacher: String(req.user.id) })
      .sort('-createdAt');

    // Add predefined templates
    const predefinedTemplates = Object.values(PREDEFINED_TEMPLATES).map(template => ({
      ...template,
      _id: `predefined-${template.type}`,
      teacher: null,
      isPredefined: true,
      createdAt: null,
      updatedAt: null
    }));

    // Combine predefined and custom templates
    const allTemplates = [...predefinedTemplates, ...customTemplates];

    res.json(allTemplates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific template
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if it's a predefined template
    if (id.startsWith('predefined-')) {
      const type = id.replace('predefined-', '');
      const predefinedTemplate = PREDEFINED_TEMPLATES[type];
      
      if (!predefinedTemplate) {
        return res.status(404).json({ message: 'Template not found' });
      }

      return res.json({
        ...predefinedTemplate,
        _id: id,
        teacher: null,
        isPredefined: true,
        createdAt: null,
        updatedAt: null
      });
    }

    // Get custom template
    const template = await QuizTemplate.findOne({
      _id: id,
      teacher: String(req.user.id)
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update template
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, questionCount, duration, questionDistribution, expirationPeriod, subjects } = req.body;

    // Prevent updating predefined templates
    if (id.startsWith('predefined-')) {
      return res.status(403).json({ message: 'Cannot update predefined templates' });
    }

    // Find template and ensure it belongs to the teacher
    const template = await QuizTemplate.findOne({
      _id: id,
      teacher: String(req.user.id)
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Validate question count if provided
    if (questionCount !== undefined && questionCount < 1) {
      return res.status(400).json({ message: 'Question count must be at least 1' });
    }

    // Validate duration if provided
    if (duration !== undefined && duration < 1) {
      return res.status(400).json({ message: 'Duration must be at least 1 minute' });
    }

    // Validate expiration period if provided
    if (expirationPeriod !== undefined && expirationPeriod < 1) {
      return res.status(400).json({ message: 'Expiration period must be at least 1 day' });
    }

    // Validate question distribution if provided
    if (questionDistribution) {
      const { multipleChoice = 0, trueFalse = 0, fillInBlank = 0, matching = 0 } = questionDistribution;
      const total = multipleChoice + trueFalse + fillInBlank + matching;
      
      if (total !== 100 && total !== 0) {
        return res.status(400).json({ message: 'Question distribution must sum to 100%' });
      }

      // Validate individual percentages
      if (multipleChoice < 0 || multipleChoice > 100 ||
          trueFalse < 0 || trueFalse > 100 ||
          fillInBlank < 0 || fillInBlank > 100 ||
          matching < 0 || matching > 100) {
        return res.status(400).json({ message: 'Each question type percentage must be between 0 and 100' });
      }
    }

    // Validate type if provided
    if (type !== undefined) {
      if (!['short', 'long', 'exam', 'custom'].includes(type)) {
        return res.status(400).json({ message: 'Invalid template type' });
      }

      // Prevent changing to predefined template types
      if (['short', 'long', 'exam'].includes(type)) {
        return res.status(400).json({ message: 'Cannot use predefined types. Use type "custom" instead.' });
      }
    }

    // Update fields
    if (name !== undefined) template.name = name.trim();
    if (type !== undefined) template.type = type;
    if (questionCount !== undefined) template.questionCount = questionCount;
    if (duration !== undefined) template.duration = duration;
    if (questionDistribution !== undefined) template.questionDistribution = questionDistribution;
    if (expirationPeriod !== undefined) template.expirationPeriod = expirationPeriod;
    if (subjects !== undefined) template.subjects = subjects;

    await template.save();

    res.json(template);
  } catch (error) {
    if (error.message.includes('Question distribution')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// Delete template
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting predefined templates
    if (id.startsWith('predefined-')) {
      return res.status(403).json({ message: 'Cannot delete predefined templates' });
    }

    const template = await QuizTemplate.findOneAndDelete({
      _id: id,
      teacher: String(req.user.id)
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
