import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { GoogleGenAI } from '@google/genai';
import { Innertube } from 'youtubei.js';
import * as cheerio from 'cheerio';
import axios from 'axios';

// Generate random 6-character access code
export const generateAccessCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Extract content from uploaded file
export const extractContent = async (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  try {
    if (ext === '.pdf') {
      const dataBuffer = await fs.readFile(file.path);
      const data = await pdfParse(dataBuffer);
      await fs.unlink(file.path); // Clean up
      return data.text;
    } 
    else if (ext === '.docx' || ext === '.doc') {
      const result = await mammoth.extractRawText({ path: file.path });
      await fs.unlink(file.path); // Clean up
      return result.value;
    }
    else if (ext === '.txt') {
      const content = await fs.readFile(file.path, 'utf-8');
      await fs.unlink(file.path); // Clean up
      return content;
    }
    else {
      await fs.unlink(file.path); // Clean up
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error extracting content:', error);
    throw error;
  }
};

// Extract content from YouTube video transcript
export const extractVideoContent = async (videoUrl) => {
  try {
    // Extract video ID from various YouTube URL formats
    let videoId = null;
    
    // Handle youtube.com/watch?v=VIDEO_ID
    const watchMatch = videoUrl.match(/[?&]v=([^&]+)/);
    if (watchMatch) {
      videoId = watchMatch[1];
    }
    
    // Handle youtu.be/VIDEO_ID
    const shortMatch = videoUrl.match(/youtu\.be\/([^?]+)/);
    if (shortMatch) {
      videoId = shortMatch[1];
    }
    
    // Handle youtube.com/embed/VIDEO_ID
    const embedMatch = videoUrl.match(/\/embed\/([^?]+)/);
    if (embedMatch) {
      videoId = embedMatch[1];
    }
    
    if (!videoId) {
      throw new Error('Invalid YouTube URL format');
    }
    
    console.log(`Attempting to fetch transcript for video ID: ${videoId}`);
    
    // Initialize YouTube client
    const youtube = await Innertube.create();
    
    // Get video info
    const info = await youtube.getInfo(videoId);
    
    // Get transcript
    const transcriptData = await info.getTranscript();
    
    if (!transcriptData || !transcriptData.transcript) {
      throw new Error('No transcript/captions available for this video. Please ensure the video has captions enabled or try a different video.');
    }
    
    // Extract text from transcript segments
    const transcript = transcriptData.transcript;
    const segments = transcript.content?.body?.initial_segments;
    
    if (!segments || segments.length === 0) {
      throw new Error('Transcript is empty. Please try a video with more substantial content.');
    }
    
    // Combine all transcript segments into a single text
    const content = segments
      .map(segment => segment.snippet?.text?.toString() || '')
      .filter(text => text.trim().length > 0)
      .join(' ');
    
    if (!content || content.trim().length < 100) {
      throw new Error('Transcript content is too short (less than 100 characters). Please try a video with more substantial content.');
    }
    
    console.log(`Successfully extracted ${content.length} characters from video transcript`);
    return content;
  } catch (error) {
    console.error('Error extracting video content:', error);
    
    // Provide more helpful error messages
    if (error.message.includes('transcript') || error.message.includes('captions')) {
      throw error; // Re-throw our custom transcript errors
    } else if (error.message.includes('Video unavailable') || error.message.includes('private') || error.message.includes('not found')) {
      throw new Error('Video is unavailable, private, or not found. Please use a public video.');
    } else if (error.message.includes('Too Many Requests') || error.message.includes('429')) {
      throw new Error('YouTube rate limit reached. Please try again in a few minutes.');
    } else {
      throw new Error(`Failed to extract video content: ${error.message}`);
    }
  }
};

// Extract content from web URL
export const extractWebContent = async (webUrl) => {
  try {
    // Validate URL format
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(webUrl)) {
      throw new Error('Invalid URL format. URL must start with http:// or https://');
    }
    
    // Fetch the webpage
    const response = await axios.get(webUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000 // 10 second timeout
    });
    
    if (!response.data) {
      throw new Error('No content received from URL');
    }
    
    // Parse HTML with cheerio
    const $ = cheerio.load(response.data);
    
    // Remove script, style, and other non-content elements
    $('script, style, nav, header, footer, aside, iframe, noscript').remove();
    
    // Try to extract main content from common article containers
    let content = '';
    const contentSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.content',
      'body'
    ];
    
    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        content = element.text();
        if (content.trim().length > 200) {
          break;
        }
      }
    }
    
    // Clean up the text
    content = content
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();
    
    if (!content || content.length < 100) {
      throw new Error('Could not extract sufficient content from the webpage');
    }
    
    console.log(`Extracted ${content.length} characters from web URL`);
    return content;
  } catch (error) {
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Could not connect to the URL. Please check if the URL is accessible');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('Request timed out. The website took too long to respond');
    } else {
      console.error('Error extracting web content:', error.message);
      throw new Error(`Failed to extract web content: ${error.message}`);
    }
  }
};

// Validate topic content
export const validateTopicContent = (topicText) => {
  if (!topicText || typeof topicText !== 'string') {
    throw new Error('Topic text is required');
  }
  
  const trimmedText = topicText.trim();
  
  if (trimmedText.length < 50) {
    throw new Error('Topic text must be at least 50 characters long');
  }
  
  if (trimmedText.length > 10000) {
    throw new Error('Topic text must not exceed 10,000 characters');
  }
  
  console.log(`Validated topic content: ${trimmedText.length} characters`);
  return trimmedText;
};

// Generate questions using Google Gemini AI
export const generateQuestions = async (content, distribution = null, totalQuestions = 20) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not set, using mock questions');
      return getMockQuestions(distribution, totalQuestions);
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Calculate question counts based on distribution
    let questionCounts = {
      multipleChoice: totalQuestions,
      trueFalse: 0,
      fillInBlank: 0,
      matching: 0
    };
    
    if (distribution) {
      questionCounts = {
        multipleChoice: distribution.multipleChoice || 0,
        trueFalse: distribution.trueFalse || 0,
        fillInBlank: distribution.fillInBlank || 0,
        matching: distribution.matching || 0
      };
    }
    
    const prompt = `You are an expert quiz generator. Analyze the following educational content and generate questions with the specified distribution.

IMPORTANT: Return ONLY a valid JSON array with no additional text, markdown, or formatting.

Generate exactly:
- ${questionCounts.multipleChoice} Multiple Choice questions
- ${questionCounts.trueFalse} True/False questions
- ${questionCounts.fillInBlank} Fill-in-the-Blank questions
- ${questionCounts.matching} Matching questions

Each question type must follow its specific format:

MULTIPLE CHOICE:
{
  "type": "multipleChoice",
  "question": "Question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0
}

TRUE/FALSE:
{
  "type": "trueFalse",
  "question": "Statement to evaluate as true or false.",
  "correctAnswer": true
}

FILL-IN-THE-BLANK:
{
  "type": "fillInBlank",
  "question": "Question with a _____ to fill in.",
  "correctAnswer": "correct answer text",
  "caseSensitive": false
}

MATCHING:
{
  "type": "matching",
  "question": "Match the following items:",
  "leftColumn": ["Item 1", "Item 2", "Item 3", "Item 4"],
  "rightColumn": ["Match A", "Match B", "Match C", "Match D"],
  "correctPairs": [
    {"left": 0, "right": 1},
    {"left": 1, "right": 0},
    {"left": 2, "right": 3},
    {"left": 3, "right": 2}
  ]
}

Rules:
- Multiple Choice: 4 options, correctAnswer is index (0-3)
- True/False: correctAnswer is boolean (true or false)
- Fill-in-the-Blank: Use _____ to indicate blank, correctAnswer is the text
- Matching: 4 items in each column, correctPairs maps left index to right index
- Questions should test understanding, not just memorization
- Vary difficulty levels
- Return ONLY the JSON array, no other text

Content to analyze:
${content.substring(0, 8000)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt
    });

    const text = response.text.trim();
    
    // Remove markdown code blocks if present
    let jsonText = text;
    if (text.startsWith('```')) {
      jsonText = text.replace(/```json?\n?/g, '').replace(/```\n?$/g, '').trim();
    }

    const questions = JSON.parse(jsonText);
    
    // Validate questions format
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format');
    }

    // Parse and validate questions by type
    const parsedQuestions = questions
      .map(q => parseQuestion(q))
      .filter(q => q !== null);

    if (parsedQuestions.length < Math.floor(totalQuestions * 0.5)) {
      throw new Error('Not enough valid questions generated');
    }

    console.log(`Generated ${parsedQuestions.length} questions using Gemini AI`);
    
    // Validate and adjust distribution
    const adjustedQuestions = validateAndAdjustDistribution(
      parsedQuestions, 
      distribution, 
      totalQuestions
    );
    
    return adjustedQuestions;

  } catch (error) {
    console.error('Error generating questions with Gemini:', error.message);
    console.log('Falling back to mock questions');
    return getMockQuestions(distribution, totalQuestions);
  }
};

// Validate and adjust question distribution
const validateAndAdjustDistribution = (questions, requestedDistribution, totalQuestions) => {
  // If no distribution specified, return all questions
  if (!requestedDistribution) {
    return questions.slice(0, totalQuestions);
  }
  
  // Group questions by type
  const questionsByType = {
    multipleChoice: questions.filter(q => q.type === 'multipleChoice'),
    trueFalse: questions.filter(q => q.type === 'trueFalse'),
    fillInBlank: questions.filter(q => q.type === 'fillInBlank'),
    matching: questions.filter(q => q.type === 'matching')
  };
  
  // Log actual generated counts
  const actualCounts = {
    multipleChoice: questionsByType.multipleChoice.length,
    trueFalse: questionsByType.trueFalse.length,
    fillInBlank: questionsByType.fillInBlank.length,
    matching: questionsByType.matching.length
  };
  console.log('Requested distribution:', requestedDistribution);
  console.log('Actual generated counts:', actualCounts);
  
  // Adjust distribution if AI couldn't generate enough of a type
  const adjustedDistribution = { ...requestedDistribution };
  let totalAdjusted = 0;
  let shortfall = 0;
  
  // First pass: cap each type at what was actually generated
  for (const type of ['multipleChoice', 'trueFalse', 'fillInBlank', 'matching']) {
    const requested = requestedDistribution[type] || 0;
    const available = actualCounts[type];
    
    if (requested > 0 && available === 0) {
      // Type was requested but none generated
      console.warn(`Warning: Requested ${requested} ${type} questions but none were generated`);
      shortfall += requested;
      adjustedDistribution[type] = 0;
    } else if (requested > available) {
      // Not enough generated
      console.warn(`Warning: Requested ${requested} ${type} questions but only ${available} were generated`);
      shortfall += (requested - available);
      adjustedDistribution[type] = available;
    } else {
      adjustedDistribution[type] = requested;
    }
    
    totalAdjusted += adjustedDistribution[type];
  }
  
  // Second pass: distribute shortfall to types that have extra capacity
  if (shortfall > 0) {
    console.log(`Redistributing ${shortfall} questions to available types`);
    
    for (const type of ['multipleChoice', 'trueFalse', 'fillInBlank', 'matching']) {
      if (shortfall === 0) break;
      
      const current = adjustedDistribution[type];
      const available = actualCounts[type];
      const capacity = available - current;
      
      if (capacity > 0) {
        const toAdd = Math.min(capacity, shortfall);
        adjustedDistribution[type] += toAdd;
        shortfall -= toAdd;
        totalAdjusted += toAdd;
      }
    }
  }
  
  console.log('Adjusted distribution:', adjustedDistribution);
  
  // Ensure minimum 1 question per type if percentage > 0 in original request
  for (const type of ['multipleChoice', 'trueFalse', 'fillInBlank', 'matching']) {
    if (requestedDistribution[type] > 0 && adjustedDistribution[type] === 0 && actualCounts[type] > 0) {
      adjustedDistribution[type] = 1;
      console.log(`Ensuring minimum 1 ${type} question as requested`);
    }
  }
  
  // Select questions according to adjusted distribution
  const selectedQuestions = [];
  
  for (const type of ['multipleChoice', 'trueFalse', 'fillInBlank', 'matching']) {
    const count = adjustedDistribution[type];
    if (count > 0) {
      const typeQuestions = questionsByType[type].slice(0, count);
      selectedQuestions.push(...typeQuestions);
    }
  }
  
  console.log(`Final selection: ${selectedQuestions.length} questions`);
  
  return selectedQuestions;
};

// Parse and normalize question based on type
const parseQuestion = (q) => {
  if (!q.type || !q.question) return null;
  
  try {
    switch (q.type) {
      case 'multipleChoice':
        if (!Array.isArray(q.options) || q.options.length !== 4) return null;
        if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) return null;
        
        return {
          type: 'multipleChoice',
          question: q.question.trim(),
          options: q.options.map(opt => String(opt).trim()),
          correctAnswer: q.correctAnswer
        };
      
      case 'trueFalse':
        if (typeof q.correctAnswer !== 'boolean') return null;
        
        return {
          type: 'trueFalse',
          question: q.question.trim(),
          correctAnswer: q.correctAnswer
        };
      
      case 'fillInBlank':
        if (typeof q.correctAnswer !== 'string' || q.correctAnswer.trim().length === 0) return null;
        
        return {
          type: 'fillInBlank',
          question: q.question.trim(),
          correctAnswer: q.correctAnswer.trim(),
          caseSensitive: q.caseSensitive === true
        };
      
      case 'matching':
        if (!Array.isArray(q.leftColumn) || !Array.isArray(q.rightColumn) || !Array.isArray(q.correctPairs)) return null;
        if (q.leftColumn.length < 3 || q.rightColumn.length < 3 || q.correctPairs.length < 3) return null;
        
        // Validate all pairs
        const validPairs = q.correctPairs.every(pair => 
          typeof pair.left === 'number' && 
          typeof pair.right === 'number' &&
          pair.left >= 0 && pair.left < q.leftColumn.length &&
          pair.right >= 0 && pair.right < q.rightColumn.length
        );
        
        if (!validPairs) return null;
        
        return {
          type: 'matching',
          question: q.question.trim(),
          leftColumn: q.leftColumn.map(item => String(item).trim()),
          rightColumn: q.rightColumn.map(item => String(item).trim()),
          correctPairs: q.correctPairs.map(pair => ({
            left: pair.left,
            right: pair.right
          }))
        };
      
      default:
        return null;
    }
  } catch (error) {
    console.error('Error parsing question:', error);
    return null;
  }
};

// Validate question based on type
const validateQuestion = (q) => {
  return parseQuestion(q) !== null;
};

// Mock questions fallback
const getMockQuestions = (distribution = null, totalQuestions = 20) => {
  const questions = [];
  
  // Default to all multiple choice if no distribution
  let counts = {
    multipleChoice: totalQuestions,
    trueFalse: 0,
    fillInBlank: 0,
    matching: 0
  };
  
  if (distribution) {
    counts = {
      multipleChoice: distribution.multipleChoice || 0,
      trueFalse: distribution.trueFalse || 0,
      fillInBlank: distribution.fillInBlank || 0,
      matching: distribution.matching || 0
    };
  }
  
  // Generate multiple choice questions
  for (let i = 0; i < counts.multipleChoice; i++) {
    questions.push({
      type: 'multipleChoice',
      question: `Sample multiple choice question ${i + 1} based on the content?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: i % 4
    });
  }
  
  // Generate true/false questions
  for (let i = 0; i < counts.trueFalse; i++) {
    questions.push({
      type: 'trueFalse',
      question: `Sample true/false statement ${i + 1} based on the content.`,
      correctAnswer: i % 2 === 0
    });
  }
  
  // Generate fill-in-the-blank questions
  for (let i = 0; i < counts.fillInBlank; i++) {
    questions.push({
      type: 'fillInBlank',
      question: `Sample question ${i + 1} with a _____ to fill in based on the content.`,
      correctAnswer: `answer${i + 1}`,
      caseSensitive: false
    });
  }
  
  // Generate matching questions
  for (let i = 0; i < counts.matching; i++) {
    questions.push({
      type: 'matching',
      question: `Match the following items from the content (Set ${i + 1}):`,
      leftColumn: [`Item ${i * 4 + 1}`, `Item ${i * 4 + 2}`, `Item ${i * 4 + 3}`, `Item ${i * 4 + 4}`],
      rightColumn: [`Match A`, `Match B`, `Match C`, `Match D`],
      correctPairs: [
        { left: 0, right: 1 },
        { left: 1, right: 0 },
        { left: 2, right: 3 },
        { left: 3, right: 2 }
      ]
    });
  }
  
  return questions;
};
