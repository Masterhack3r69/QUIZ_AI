import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
  console.error('❌ GEMINI_API_KEY not set in .env file');
  console.log('Get your key from: https://aistudio.google.com/app/apikey');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  try {
    console.log('Testing Gemini AI...\n');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: "Say hello in one sentence.",
    });
    
    console.log('✅ Success! AI Response:');
    console.log(response.text);
    console.log('\n🎉 Gemini AI is working correctly!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
      console.log('\n⚠️  Rate limit reached - but this means your API key is working!');
      console.log('Wait a few seconds and try again, or the backend will work fine in production.');
    } else if (error.message.includes('API key')) {
      console.log('\n💡 Make sure you set GEMINI_API_KEY in your .env file');
      console.log('Get your key from: https://aistudio.google.com/app/apikey');
    }
  }
}

await main();
