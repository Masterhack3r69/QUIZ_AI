/**
 * Test script for quiz validation and status logic
 * Tests start date, max students, and expiration validation
 */

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Helper function to create a test quiz
async function createTestQuiz(token, overrides = {}) {
  const defaultQuiz = {
    title: 'Test Quiz - Validation',
    duration: 30,
    questionsPerStudent: 5,
    totalQuestions: 10,
    textContent: 'This is test content for generating quiz questions. It needs to be long enough to generate meaningful questions. The content should cover various topics and concepts that can be tested through multiple choice questions.',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    ...overrides
  };

  const response = await axios.post(`${API_URL}/quiz/create`, defaultQuiz, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return response.data;
}

// Test 1: Start date validation
async function testStartDateValidation(token) {
  console.log('\n=== Test 1: Start Date Validation ===');
  
  try {
    // Create quiz with start date in the future
    const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
    const quiz = await createTestQuiz(token, {
      startDate: futureDate.toISOString(),
      title: 'Test Quiz - Future Start Date'
    });
    
    console.log('✅ Quiz created with future start date');
    console.log('   Status:', quiz.status);
    console.log('   Start Date:', quiz.startDate);
    
    // Try to validate the quiz code (should fail)
    try {
      await axios.post(`${API_URL}/quiz/validate`, {
        accessCode: quiz.accessCode
      });
      console.log('❌ FAILED: Should not allow access to scheduled quiz');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('not started')) {
        console.log('✅ Correctly rejected access to scheduled quiz');
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('❌ FAILED: Wrong error response');
      }
    }
    
    // Create quiz with start date in the past (should be active)
    const pastDate = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1 hour ago
    const activeQuiz = await createTestQuiz(token, {
      startDate: pastDate.toISOString(),
      title: 'Test Quiz - Past Start Date'
    });
    
    console.log('✅ Quiz created with past start date');
    console.log('   Status:', activeQuiz.status);
    
    // Try to validate (should succeed)
    const validateResponse = await axios.post(`${API_URL}/quiz/validate`, {
      accessCode: activeQuiz.accessCode
    });
    console.log('✅ Successfully validated active quiz');
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test 2: Max students validation
async function testMaxStudentsValidation(token) {
  console.log('\n=== Test 2: Max Students Validation ===');
  
  try {
    // Create quiz with max students = 2
    const quiz = await createTestQuiz(token, {
      maxStudents: 2,
      title: 'Test Quiz - Max Students'
    });
    
    console.log('✅ Quiz created with maxStudents = 2');
    console.log('   Access Code:', quiz.accessCode);
    
    // Submit first quiz
    const startResponse1 = await axios.post(`${API_URL}/quiz/start`, {
      accessCode: quiz.accessCode
    });
    
    await axios.post(`${API_URL}/submission/submit`, {
      quizId: quiz._id,
      studentName: 'Student 1',
      studentId: 'S001',
      answers: startResponse1.data.questions.map(q => ({
        questionId: q._id,
        questionType: q.type || 'multipleChoice',
        selectedAnswer: 0
      })),
      timeTaken: 300
    });
    console.log('✅ First submission successful');
    
    // Submit second quiz
    const startResponse2 = await axios.post(`${API_URL}/quiz/start`, {
      accessCode: quiz.accessCode
    });
    
    await axios.post(`${API_URL}/submission/submit`, {
      quizId: quiz._id,
      studentName: 'Student 2',
      studentId: 'S002',
      answers: startResponse2.data.questions.map(q => ({
        questionId: q._id,
        questionType: q.type || 'multipleChoice',
        selectedAnswer: 0
      })),
      timeTaken: 300
    });
    console.log('✅ Second submission successful');
    
    // Try to validate for third student (should fail)
    try {
      await axios.post(`${API_URL}/quiz/validate`, {
        accessCode: quiz.accessCode
      });
      console.log('❌ FAILED: Should not allow access when quiz is full');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('maximum')) {
        console.log('✅ Correctly rejected access to full quiz');
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('❌ FAILED: Wrong error response');
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test 3: Expiration validation
async function testExpirationValidation(token) {
  console.log('\n=== Test 3: Expiration Validation ===');
  
  try {
    // Create quiz that expires in 1 second
    const expiresAt = new Date(Date.now() + 1000); // 1 second from now
    const quiz = await createTestQuiz(token, {
      expiresAt: expiresAt.toISOString(),
      title: 'Test Quiz - Expiring Soon'
    });
    
    console.log('✅ Quiz created with expiration in 1 second');
    console.log('   Expires At:', quiz.expiresAt);
    
    // Validate immediately (should succeed)
    await axios.post(`${API_URL}/quiz/validate`, {
      accessCode: quiz.accessCode
    });
    console.log('✅ Successfully validated before expiration');
    
    // Wait for expiration
    console.log('⏳ Waiting for quiz to expire...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try to validate after expiration (should fail)
    try {
      await axios.post(`${API_URL}/quiz/validate`, {
        accessCode: quiz.accessCode
      });
      console.log('❌ FAILED: Should not allow access to expired quiz');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('expired')) {
        console.log('✅ Correctly rejected access to expired quiz');
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('❌ FAILED: Wrong error response');
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data || error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 Starting Quiz Validation Tests');
  console.log('===================================');
  
  try {
    // Login as teacher
    console.log('\n📝 Logging in as teacher...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'teacher@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Run tests
    await testStartDateValidation(token);
    await testMaxStudentsValidation(token);
    await testExpirationValidation(token);
    
    console.log('\n===================================');
    console.log('✅ All tests completed!');
    
  } catch (error) {
    console.log('\n❌ Test suite failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n⚠️  Note: Make sure you have a test teacher account:');
      console.log('   Email: teacher@test.com');
      console.log('   Password: password123');
    }
  }
}

// Run tests
runTests();
