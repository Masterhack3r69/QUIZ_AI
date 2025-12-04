/**
 * Backward Compatibility Layer for Agentic Pipeline
 * 
 * Ensures agentic pipeline output matches the existing quiz system format
 * Maps agent output to existing database schema
 */

/**
 * Convert agentic pipeline result to existing quiz format
 * 
 * @param {Object} agenticResult - Result from agentic pipeline
 * @returns {Array} Questions in existing format
 */
export const convertAgenticToQuizFormat = (agenticResult) => {
  if (!agenticResult || !agenticResult.questions) {
    throw new Error('Invalid agentic result: missing questions');
  }

  // Extract questions from agentic result
  const questions = agenticResult.questions;

  // Validate and normalize each question to match existing format
  const normalizedQuestions = questions.map((question, index) => {
    try {
      return normalizeQuestion(question);
    } catch (error) {
      console.error(`[AgenticCompatibility] Error normalizing question ${index}:`, error.message);
      // Skip invalid questions
      return null;
    }
  }).filter(q => q !== null);

  if (normalizedQuestions.length === 0) {
    throw new Error('No valid questions after normalization');
  }

  return normalizedQuestions;
};

/**
 * Normalize a single question to match existing format
 * 
 * @param {Object} question - Question from agentic pipeline
 * @returns {Object} Normalized question
 */
const normalizeQuestion = (question) => {
  if (!question || !question.type || !question.question) {
    throw new Error('Invalid question: missing type or question text');
  }

  const baseQuestion = {
    type: question.type,
    question: question.question.trim()
  };

  // Normalize based on question type
  switch (question.type) {
    case 'multipleChoice':
      return normalizeMultipleChoice(question, baseQuestion);
    
    case 'trueFalse':
      return normalizeTrueFalse(question, baseQuestion);
    
    case 'fillInBlank':
      return normalizeFillInBlank(question, baseQuestion);
    
    case 'matching':
      return normalizeMatching(question, baseQuestion);
    
    default:
      throw new Error(`Unknown question type: ${question.type}`);
  }
};

/**
 * Normalize multiple choice question
 */
const normalizeMultipleChoice = (question, baseQuestion) => {
  if (!Array.isArray(question.options) || question.options.length !== 4) {
    throw new Error('Multiple choice question must have exactly 4 options');
  }

  if (typeof question.correctAnswer !== 'number' || 
      question.correctAnswer < 0 || 
      question.correctAnswer > 3) {
    throw new Error('Multiple choice correctAnswer must be 0-3');
  }

  return {
    ...baseQuestion,
    options: question.options.map(opt => String(opt).trim()),
    correctAnswer: question.correctAnswer,
    explanation: question.explanation || undefined,
    difficulty: question.difficulty || undefined,
    conceptTested: question.conceptTested || undefined
  };
};

/**
 * Normalize true/false question
 */
const normalizeTrueFalse = (question, baseQuestion) => {
  let correctAnswer;
  
  // Handle two formats:
  // 1. Boolean correctAnswer (true/false)
  // 2. Options array with numeric correctAnswer (0 or 1)
  if (typeof question.correctAnswer === 'boolean') {
    correctAnswer = question.correctAnswer;
  } else if (typeof question.correctAnswer === 'number' && Array.isArray(question.options)) {
    // Convert numeric index to boolean
    // Assume options[0] = "True" and options[1] = "False"
    if (question.correctAnswer === 0) {
      correctAnswer = true;
    } else if (question.correctAnswer === 1) {
      correctAnswer = false;
    } else {
      throw new Error('True/false correctAnswer must be 0 (true) or 1 (false)');
    }
  } else if (typeof question.correctAnswer === 'string') {
    // Handle string values like "true" or "false"
    const lowerAnswer = question.correctAnswer.toLowerCase().trim();
    if (lowerAnswer === 'true') {
      correctAnswer = true;
    } else if (lowerAnswer === 'false') {
      correctAnswer = false;
    } else {
      throw new Error('True/false correctAnswer string must be "true" or "false"');
    }
  } else {
    throw new Error('True/false correctAnswer must be boolean, number (0/1), or string ("true"/"false")');
  }

  return {
    ...baseQuestion,
    correctAnswer: correctAnswer,
    explanation: question.explanation || undefined
  };
};

/**
 * Normalize fill-in-the-blank question
 */
const normalizeFillInBlank = (question, baseQuestion) => {
  if (typeof question.correctAnswer !== 'string' || question.correctAnswer.trim().length === 0) {
    throw new Error('Fill-in-blank correctAnswer must be non-empty string');
  }

  return {
    ...baseQuestion,
    correctAnswer: question.correctAnswer.trim(),
    caseSensitive: question.caseSensitive === true,
    explanation: question.explanation || undefined
  };
};

/**
 * Normalize matching question
 */
const normalizeMatching = (question, baseQuestion) => {
  if (!Array.isArray(question.leftColumn) || question.leftColumn.length < 3) {
    throw new Error('Matching question must have at least 3 items in leftColumn');
  }

  if (!Array.isArray(question.rightColumn) || question.rightColumn.length < 3) {
    throw new Error('Matching question must have at least 3 items in rightColumn');
  }

  if (!Array.isArray(question.correctPairs) || question.correctPairs.length < 3) {
    throw new Error('Matching question must have at least 3 correctPairs');
  }

  // Validate all pairs
  const validPairs = question.correctPairs.every(pair => 
    typeof pair.left === 'number' && 
    typeof pair.right === 'number' &&
    pair.left >= 0 && pair.left < question.leftColumn.length &&
    pair.right >= 0 && pair.right < question.rightColumn.length
  );

  if (!validPairs) {
    throw new Error('Matching question has invalid correctPairs');
  }

  return {
    ...baseQuestion,
    leftColumn: question.leftColumn.map(item => String(item).trim()),
    rightColumn: question.rightColumn.map(item => String(item).trim()),
    correctPairs: question.correctPairs.map(pair => ({
      left: pair.left,
      right: pair.right
    })),
    explanation: question.explanation || undefined
  };
};

/**
 * Validate question distribution matches request
 * 
 * @param {Array} questions - Questions to validate
 * @param {Object} requestedDistribution - Requested distribution
 * @returns {Object} Validation result with actual distribution
 */
export const validateQuestionDistribution = (questions, requestedDistribution) => {
  const actualDistribution = {
    multipleChoice: 0,
    trueFalse: 0,
    fillInBlank: 0,
    matching: 0
  };

  questions.forEach(question => {
    const type = question.type || 'multipleChoice';
    if (actualDistribution[type] !== undefined) {
      actualDistribution[type]++;
    }
  });

  // Check if distribution matches (with some tolerance)
  const matches = Object.keys(requestedDistribution).every(type => {
    const requested = requestedDistribution[type] || 0;
    const actual = actualDistribution[type] || 0;
    
    // Allow up to 20% variance or 1 question difference
    const tolerance = Math.max(1, Math.ceil(requested * 0.2));
    return Math.abs(requested - actual) <= tolerance;
  });

  return {
    matches,
    requested: requestedDistribution,
    actual: actualDistribution
  };
};

/**
 * Generate questions using agentic pipeline with fallback
 * 
 * @param {Object} agenticPipeline - Agentic pipeline instance
 * @param {string} content - Content to generate questions from
 * @param {Object} distribution - Question distribution
 * @param {number} totalQuestions - Total questions to generate
 * @param {Function} fallbackFn - Fallback function (traditional generateQuestions)
 * @param {Object} options - Additional options
 * @param {string} [options.targetLanguage] - Target language for question generation (default: 'English')
 * @param {string} [options.difficulty] - Difficulty level (default: 'medium')
 * @returns {Promise<Array>} Generated questions
 */
export const generateQuestionsWithAgentic = async (
  agenticPipeline,
  content,
  distribution,
  totalQuestions,
  fallbackFn,
  options = {}
) => {
  // Check if agentic pipeline is available
  if (!agenticPipeline) {
    console.log('[AgenticCompatibility] Agentic pipeline not available, using fallback');
    return await fallbackFn(content, distribution, totalQuestions);
  }

  const targetLanguage = options.targetLanguage || 'English';
  const difficulty = options.difficulty || 'medium';

  try {
    console.log('[AgenticCompatibility] Generating questions with agentic pipeline', {
      contentLength: content.length,
      distribution,
      totalQuestions,
      targetLanguage
    });

    // Generate questions using agentic pipeline
    const agenticResult = await agenticPipeline.generateQuiz(content, {
      totalQuestions,
      distribution,
      difficulty,
      targetLanguage
    });

    // Convert to existing format
    const questions = convertAgenticToQuizFormat(agenticResult);

    // Validate distribution
    const validation = validateQuestionDistribution(questions, distribution);
    
    if (!validation.matches) {
      console.warn('[AgenticCompatibility] Distribution mismatch', {
        requested: validation.requested,
        actual: validation.actual
      });
    }

    console.log('[AgenticCompatibility] Questions generated successfully', {
      count: questions.length,
      distribution: validation.actual,
      metadata: agenticResult.metadata
    });

    return questions;

  } catch (error) {
    console.error('[AgenticCompatibility] Agentic generation failed, using fallback:', error.message);
    return await fallbackFn(content, distribution, totalQuestions);
  }
};
