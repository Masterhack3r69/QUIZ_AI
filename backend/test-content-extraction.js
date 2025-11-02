import { 
  extractVideoContent, 
  extractWebContent, 
  validateTopicContent 
} from './src/utils/quiz.utils.js';

console.log('Testing Content Extraction Functions\n');

// Test 1: Topic validation
console.log('=== Test 1: Topic Validation ===');
try {
  const shortTopic = 'This is too short';
  validateTopicContent(shortTopic);
  console.log('❌ Should have thrown error for short topic');
} catch (error) {
  console.log('✅ Correctly rejected short topic:', error.message);
}

try {
  const validTopic = 'This is a valid topic about artificial intelligence and machine learning. It contains enough content to generate meaningful quiz questions about the subject matter.';
  const result = validateTopicContent(validTopic);
  console.log('✅ Valid topic accepted:', result.length, 'characters\n');
} catch (error) {
  console.log('❌ Failed to validate valid topic:', error.message);
}

// Test 2: Video extraction (optional - requires valid YouTube video)
console.log('=== Test 2: Video Extraction ===');
console.log('Testing with a sample YouTube video...');
extractVideoContent('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  .then(content => {
    console.log('✅ Video content extracted:', content.substring(0, 100) + '...');
    console.log('   Total length:', content.length, 'characters\n');
  })
  .catch(error => {
    console.log('⚠️  Video extraction failed (expected if no transcript):', error.message, '\n');
  });

// Test 3: Web URL extraction
console.log('=== Test 3: Web URL Extraction ===');
console.log('Testing with a sample web page...');
extractWebContent('https://en.wikipedia.org/wiki/Artificial_intelligence')
  .then(content => {
    console.log('✅ Web content extracted:', content.substring(0, 100) + '...');
    console.log('   Total length:', content.length, 'characters\n');
  })
  .catch(error => {
    console.log('❌ Web extraction failed:', error.message, '\n');
  });

// Test 4: Invalid URL formats
console.log('=== Test 4: Invalid URL Handling ===');
extractWebContent('not-a-valid-url')
  .then(() => {
    console.log('❌ Should have rejected invalid URL');
  })
  .catch(error => {
    console.log('✅ Correctly rejected invalid URL:', error.message, '\n');
  });

console.log('Tests completed!');
