'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WizardProgress, WizardStep } from '@/components/quiz/WizardProgress';
import { FileUpload } from '@/components/quiz/FileUpload';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { apiClient } from '@/lib/api';
import type { Question } from '@/types';

const WIZARD_STEPS: WizardStep[] = [
  { id: 1, title: 'Upload', description: 'Upload content' },
  { id: 2, title: 'Processing', description: 'AI generation' },
  { id: 3, title: 'Configure', description: 'Quiz settings' },
  { id: 4, title: 'Review', description: 'Review & save' },
];

// ReviewAndSave Component
interface ReviewAndSaveProps {
  quizConfig: QuizConfig;
  generatedQuestions: Question[];
  uploadedFile: File | null;
  uploadedTextContent: string;
  onBack: () => void;
  onEditConfig: () => void;
  onEditUpload: () => void;
}

function ReviewAndSave({
  quizConfig,
  generatedQuestions,
  uploadedFile,
  uploadedTextContent,
  onBack,
  onEditConfig,
  onEditUpload,
}: ReviewAndSaveProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdQuiz, setCreatedQuiz] = useState<{ accessCode: string; _id: string } | null>(null);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('error');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCreateQuiz = async () => {
    setIsCreating(true);
    setError('');

    try {
      // Now create the quiz with the final configuration
      // We need to send the file/text content again along with the final config
      const formData = new FormData();
      
      // Add the original file or text content
      if (uploadedFile) {
        formData.append('file', uploadedFile);
      } else if (uploadedTextContent) {
        formData.append('textContent', uploadedTextContent);
      }
      
      // Add final configuration
      formData.append('title', quizConfig.title);
      formData.append('duration', quizConfig.duration);
      formData.append('questionsPerStudent', quizConfig.questionsPerStudent);
      formData.append('expiresAt', quizConfig.expiresAt);

      // Call backend API to create quiz (this will regenerate questions, but that's okay)
      // In a production app, you'd want to cache the questions or have a separate endpoint
      const response = await apiClient.createQuiz(formData);

      // Store created quiz info
      setCreatedQuiz({
        accessCode: response.accessCode,
        _id: response._id,
      });

      // Show success modal
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Failed to create quiz:', err);
      
      let errorMessage = 'Failed to create quiz. Please try again.';
      if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setToastType('error');
      setToastMessage(errorMessage);
      setShowToast(true);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyAccessCode = async () => {
    if (!createdQuiz) return;

    try {
      await navigator.clipboard.writeText(createdQuiz.accessCode);
      setCopiedCode(true);
      setToastType('success');
      setToastMessage('Access code copied to clipboard!');
      setShowToast(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setToastType('error');
      setToastMessage('Failed to copy access code');
      setShowToast(true);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleGoToQuizManagement = () => {
    if (createdQuiz) {
      router.push(`/dashboard/quiz/${createdQuiz._id}`);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <Toast
          type={toastType}
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {}}
        title="Quiz Created Successfully!"
        size="md"
      >
        <div className="space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-4">
              Your quiz has been created and is ready to share with students!
            </p>
          </div>

          {/* Access Code Display */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <p className="text-sm font-medium text-gray-700 mb-2 text-center">
              Quiz Access Code
            </p>
            <div className="flex items-center justify-center space-x-3">
              <div className="text-4xl font-bold text-blue-600 tracking-wider">
                {createdQuiz?.accessCode}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAccessCode}
                aria-label="Copy access code"
              >
                {copiedCode ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-3 text-center">
              Share this code with your students to give them access to the quiz
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              onClick={handleGoToDashboard}
              className="flex-1"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Back to Dashboard
            </Button>
            <Button
              variant="primary"
              onClick={handleGoToQuizManagement}
              className="flex-1"
            >
              View Quiz Details
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Review Content */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Step 4: Review & Save
          </h2>
          <p className="text-gray-600">
            Review your quiz configuration and generated questions before creating
          </p>
        </div>

        {/* Quiz Configuration Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quiz Configuration</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditConfig}
              aria-label="Edit configuration"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Quiz Title</p>
              <p className="text-base font-semibold text-gray-900">{quizConfig.title}</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Duration</p>
              <p className="text-base font-semibold text-gray-900">{quizConfig.duration} minutes</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Questions Per Student</p>
              <p className="text-base font-semibold text-gray-900">
                {quizConfig.questionsPerStudent} of {generatedQuestions.length} questions
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Expires At</p>
              <p className="text-base font-semibold text-gray-900">
                {new Date(quizConfig.expiresAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Generated Questions Preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Generated Questions ({generatedQuestions.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditUpload}
              aria-label="Upload different content"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Re-upload Content
            </Button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {generatedQuestions.map((question, index) => (
              <div
                key={question._id || index}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-gray-900 mb-3">
                      {question.question}
                    </p>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`
                            flex items-start space-x-2 p-2 rounded-md text-sm
                            ${
                              optionIndex === question.correctAnswer
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-gray-50'
                            }
                          `}
                        >
                          <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs font-medium">
                            {String.fromCharCode(65 + optionIndex)}
                          </span>
                          <span className="text-gray-700 flex-1">{option}</span>
                          {optionIndex === question.correctAnswer && (
                            <svg
                              className="w-5 h-5 text-green-600 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={isCreating}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 17l-5-5m0 0l5-5m-5 5h12"
              />
            </svg>
            Back
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleCreateQuiz}
            loading={isCreating}
            disabled={isCreating}
          >
            {isCreating ? 'Creating Quiz...' : 'Create Quiz'}
            {!isCreating && (
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

type UploadMethod = 'file' | 'text';
type ProcessingStage = 'extracting' | 'generating' | 'complete';

interface QuizConfig {
  title: string;
  duration: string;
  expiresAt: string;
  questionsPerStudent: string;
}

interface ConfigErrors {
  title?: string;
  duration?: string;
  expiresAt?: string;
  questionsPerStudent?: string;
}

export default function CreateQuizPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [error, setError] = useState('');
  
  // AI Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('extracting');
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [createdQuizId, setCreatedQuizId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedTextContent, setUploadedTextContent] = useState<string>('');
  
  // Configuration state
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({
    title: '',
    duration: '30',
    expiresAt: '',
    questionsPerStudent: '10',
  });
  const [configErrors, setConfigErrors] = useState<ConfigErrors>({});
  
  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('error');

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setUploadedFile(file);
    setError('');
  };

  const handleTextContentChange = (value: string) => {
    setTextContent(value);
    setUploadedTextContent(value);
    setError('');
  };

  const handleConfigChange = (field: keyof QuizConfig, value: string) => {
    setQuizConfig((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (configErrors[field]) {
      setConfigErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateConfiguration = (): boolean => {
    const errors: ConfigErrors = {};
    
    // Validate title
    if (!quizConfig.title.trim()) {
      errors.title = 'Quiz title is required';
    } else if (quizConfig.title.trim().length < 3) {
      errors.title = 'Quiz title must be at least 3 characters';
    } else if (quizConfig.title.trim().length > 100) {
      errors.title = 'Quiz title must not exceed 100 characters';
    }
    
    // Validate duration
    const duration = parseInt(quizConfig.duration);
    if (!quizConfig.duration || isNaN(duration)) {
      errors.duration = 'Duration is required';
    } else if (duration < 1) {
      errors.duration = 'Duration must be at least 1 minute';
    } else if (duration > 300) {
      errors.duration = 'Duration must not exceed 300 minutes (5 hours)';
    }
    
    // Validate expiration date
    if (!quizConfig.expiresAt) {
      errors.expiresAt = 'Expiration date and time is required';
    } else {
      const expirationDate = new Date(quizConfig.expiresAt);
      const now = new Date();
      
      if (isNaN(expirationDate.getTime())) {
        errors.expiresAt = 'Invalid date format';
      } else if (expirationDate <= now) {
        errors.expiresAt = 'Expiration date must be in the future';
      }
    }
    
    // Validate questions per student
    const questionsPerStudent = parseInt(quizConfig.questionsPerStudent);
    if (!quizConfig.questionsPerStudent || isNaN(questionsPerStudent)) {
      errors.questionsPerStudent = 'Number of questions is required';
    } else if (questionsPerStudent < 1) {
      errors.questionsPerStudent = 'Must have at least 1 question';
    } else if (questionsPerStudent > generatedQuestions.length) {
      errors.questionsPerStudent = `Cannot exceed ${generatedQuestions.length} (total generated questions)`;
    }
    
    setConfigErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBackToUpload = () => {
    setCurrentStep(0);
    setConfigErrors({});
  };

  const handleConfigNext = () => {
    if (validateConfiguration()) {
      // TODO: Proceed to review step (task 10)
      setCurrentStep(3);
    }
  };

  const handleNext = async () => {
    // Validate input before proceeding
    if (uploadMethod === 'file' && !selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (uploadMethod === 'text' && !textContent.trim()) {
      setError('Please enter some text content');
      return;
    }

    // Proceed to AI processing step
    setCurrentStep(1);
    setIsProcessing(true);
    setError('');

    try {
      // Stage 1: Extracting content
      setProcessingStage('extracting');
      
      // Prepare form data
      const formData = new FormData();
      
      if (uploadMethod === 'file' && selectedFile) {
        formData.append('file', selectedFile);
      } else if (uploadMethod === 'text') {
        formData.append('textContent', textContent);
      }
      
      // Add placeholder values for required fields (will be configured in step 3)
      formData.append('title', 'Untitled Quiz');
      formData.append('duration', '30');
      formData.append('questionsPerStudent', '10');
      formData.append('expiresAt', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

      // Stage 2: Generating questions
      setProcessingStage('generating');
      
      // Use test endpoint to generate questions without saving
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/quiz/test-create`, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to generate questions');
      }
      
      const data = await response.json();
      
      // Store generated questions (quiz not saved yet)
      setGeneratedQuestions(data.questions);
      
      // Stage 3: Complete
      setProcessingStage('complete');
      
      // Wait a moment to show completion message
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentStep(2);
      }, 1000);
      
    } catch (err: any) {
      setIsProcessing(false);
      setCurrentStep(0); // Go back to upload step
      
      // Display user-friendly error message
      let errorMessage = 'Failed to process content. Please try again.';
      
      if (err.message) {
        // Customize error messages based on common scenarios
        if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again with a smaller file.';
        } else if (err.message.includes('file') || err.message.includes('content')) {
          errorMessage = 'Unable to extract content from the file. Please try a different file or use text input.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      
      // Show toast notification
      setToastType('error');
      setToastMessage(errorMessage);
      setShowToast(true);
      
      console.error('AI processing error:', err);
    }
  };

  const canProceed = uploadMethod === 'file' ? !!selectedFile : !!textContent.trim();

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <Toast
          type={toastType}
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Quiz</h1>

        <WizardProgress steps={WIZARD_STEPS} currentStep={currentStep} />

        <Card>
        {/* Step 1: Upload */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Step 1: Upload Learning Material
              </h2>
              <p className="text-gray-600">
                Upload a file or paste text content for AI to generate quiz questions
              </p>
            </div>

          {/* Upload Method Toggle */}
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setUploadMethod('file')}
              className={`
                px-4 py-2 font-medium text-sm border-b-2 transition-colors
                ${
                  uploadMethod === 'file'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span>Upload File</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setUploadMethod('text')}
              className={`
                px-4 py-2 font-medium text-sm border-b-2 transition-colors
                ${
                  uploadMethod === 'text'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Paste Text</span>
              </div>
            </button>
          </div>

          {/* File Upload Section */}
          {uploadMethod === 'file' && (
            <div>
              <FileUpload
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                error={error}
              />
            </div>
          )}

          {/* Text Content Section */}
          {uploadMethod === 'text' && (
            <div>
              <label
                htmlFor="text-content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Text Content
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                id="text-content"
                value={textContent}
                onChange={(e) => handleTextContentChange(e.target.value)}
                placeholder="Paste your learning material here..."
                rows={12}
                className={`
                  block w-full px-3 py-2 border rounded-lg shadow-sm 
                  focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors
                  ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}
                `}
                aria-invalid={!!error}
                aria-describedby={error ? 'text-content-error' : undefined}
              />
              {error && (
                <p id="text-content-error" className="mt-2 text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Paste text from your learning materials, lecture notes, or study guides
              </p>
            </div>
          )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="ghost"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                disabled={!canProceed}
              >
                Next: AI Processing
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: AI Processing */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Step 2: AI Processing
              </h2>
              <p className="text-gray-600">
                Our AI is analyzing your content and generating quiz questions
              </p>
            </div>

            {/* Processing Animation and Status */}
            <div className="py-12 flex flex-col items-center justify-center">
              {/* Animated Spinner */}
              <div className="relative mb-8">
                <div className="w-24 h-24 border-8 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
              </div>

              {/* Progress Messages */}
              <div className="text-center space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {processingStage === 'extracting' && 'Extracting content...'}
                  {processingStage === 'generating' && 'Generating questions...'}
                  {processingStage === 'complete' && 'Complete!'}
                </h3>
                
                <p className="text-gray-600 max-w-md">
                  {processingStage === 'extracting' && 
                    'Reading and analyzing your learning material'}
                  {processingStage === 'generating' && 
                    'Creating intelligent quiz questions based on the content'}
                  {processingStage === 'complete' && 
                    'Questions generated successfully. Proceeding to configuration...'}
                </p>

                {/* Progress Indicators */}
                <div className="flex items-center justify-center space-x-2 pt-4">
                  <div className={`w-3 h-3 rounded-full ${
                    processingStage === 'extracting' ? 'bg-blue-600 animate-pulse' : 'bg-green-500'
                  }`}></div>
                  <div className={`w-3 h-3 rounded-full ${
                    processingStage === 'generating' ? 'bg-blue-600 animate-pulse' : 
                    processingStage === 'complete' ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div className={`w-3 h-3 rounded-full ${
                    processingStage === 'complete' ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                </div>
              </div>

              {/* Processing Info */}
              <div className="mt-8 text-sm text-gray-500 text-center max-w-md">
                <p>This may take 30-60 seconds depending on the content length.</p>
                <p className="mt-1">Please do not close this window.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Configuration */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Step 3: Configure Quiz Settings
              </h2>
              <p className="text-gray-600">
                Set up your quiz parameters and preferences
              </p>
            </div>

            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-800">
                  AI Processing Complete
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Successfully generated {generatedQuestions.length} questions from your content
                </p>
              </div>
            </div>

            {/* Configuration Form */}
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {/* Quiz Title */}
              <Input
                type="text"
                label="Quiz Title"
                value={quizConfig.title}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                error={configErrors.title}
                placeholder="e.g., Chapter 5: Photosynthesis Quiz"
                required
                helperText="Give your quiz a descriptive title"
              />

              {/* Duration and Questions Per Student - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Duration */}
                <Input
                  type="number"
                  label="Duration (minutes)"
                  value={quizConfig.duration}
                  onChange={(e) => handleConfigChange('duration', e.target.value)}
                  error={configErrors.duration}
                  placeholder="30"
                  min="1"
                  max="300"
                  required
                  helperText="Time limit for students to complete the quiz"
                />

                {/* Questions Per Student */}
                <Input
                  type="number"
                  label="Questions Per Student"
                  value={quizConfig.questionsPerStudent}
                  onChange={(e) => handleConfigChange('questionsPerStudent', e.target.value)}
                  error={configErrors.questionsPerStudent}
                  placeholder="10"
                  min="1"
                  max={generatedQuestions.length}
                  required
                  helperText={`Max: ${generatedQuestions.length} questions available`}
                />
              </div>

              {/* Expiration Date/Time */}
              <div>
                <label
                  htmlFor="expiresAt"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Expiration Date & Time
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="expiresAt"
                  value={quizConfig.expiresAt}
                  onChange={(e) => handleConfigChange('expiresAt', e.target.value)}
                  className={`
                    block w-full px-3 py-2 border rounded-lg shadow-sm 
                    focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors
                    ${
                      configErrors.expiresAt
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }
                  `}
                  required
                  aria-invalid={!!configErrors.expiresAt}
                  aria-describedby={configErrors.expiresAt ? 'expiresAt-error' : 'expiresAt-helper'}
                />
                {configErrors.expiresAt && (
                  <p id="expiresAt-error" className="mt-1 text-sm text-red-600" role="alert">
                    {configErrors.expiresAt}
                  </p>
                )}
                {!configErrors.expiresAt && (
                  <p id="expiresAt-helper" className="mt-1 text-sm text-gray-500">
                    Students will not be able to access the quiz after this date and time
                  </p>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">About Question Randomization</p>
                    <p>
                      Each student will receive a random selection of{' '}
                      <span className="font-semibold">{quizConfig.questionsPerStudent || '?'}</span>{' '}
                      questions from the pool of{' '}
                      <span className="font-semibold">{generatedQuestions.length}</span>{' '}
                      generated questions. This ensures academic integrity while maintaining fairness.
                    </p>
                  </div>
                </div>
              </div>
            </form>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBackToUpload}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 17l-5-5m0 0l5-5m-5 5h12"
                  />
                </svg>
                Back
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={handleConfigNext}
              >
                Next: Review
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Save */}
        {currentStep === 3 && (
          <ReviewAndSave
            quizConfig={quizConfig}
            generatedQuestions={generatedQuestions}
            uploadedFile={uploadedFile}
            uploadedTextContent={uploadedTextContent}
            onBack={() => setCurrentStep(2)}
            onEditConfig={() => setCurrentStep(2)}
            onEditUpload={() => setCurrentStep(0)}
          />
        )}
      </Card>
      </div>
    </>
  );
}
