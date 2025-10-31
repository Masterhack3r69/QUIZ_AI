import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { GoogleGenAI } from '@google/genai';

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

// Generate questions using Google Gemini AI
export const generateQuestions = async (content) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not set, using mock questions');
      return getMockQuestions();
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are an expert quiz generator. Analyze the following educational content and generate 20 high-quality multiple-choice questions.

IMPORTANT: Return ONLY a valid JSON array with no additional text, markdown, or formatting. Each question must follow this exact structure:

[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]

Rules:
- Generate exactly 20 questions
- Each question must have exactly 4 options
- correctAnswer is the index (0-3) of the correct option
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

    // Validate each question
    const validQuestions = questions.filter(q => 
      q.question && 
      Array.isArray(q.options) && 
      q.options.length === 4 &&
      typeof q.correctAnswer === 'number' &&
      q.correctAnswer >= 0 && 
      q.correctAnswer < 4
    );

    if (validQuestions.length < 10) {
      throw new Error('Not enough valid questions generated');
    }

    console.log(`Generated ${validQuestions.length} questions using Gemini AI`);
    return validQuestions;

  } catch (error) {
    console.error('Error generating questions with Gemini:', error.message);
    console.log('Falling back to mock questions');
    return getMockQuestions();
  }
};

// Mock questions fallback
const getMockQuestions = () => {
  return [
    {
      question: "Sample question 1 based on the content?",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 0
    },
    {
      question: "Sample question 2 based on the content?",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 1
    },
    {
      question: "Sample question 3 based on the content?",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 2
    },
    {
      question: "Sample question 4 based on the content?",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 3
    },
    {
      question: "Sample question 5 based on the content?",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 0
    }
  ];
};
