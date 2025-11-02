'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';
import { WizardProgress, WizardStep } from '@/components/quiz/WizardProgress';
import { FileUpload } from '@/components/quiz/FileUpload';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { TemplateSelector } from '@/components/quiz/TemplateSelector';
import { ContentSourceSelector } from '@/components/quiz/ContentSourceSelector';
import { QuestionDistribution } from '@/components/quiz/QuestionDistribution';
import { apiClient } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import type { Question, QuizTemplate, ContentSource, QuizDistribution } from '@/types';

const WIZARD_STEPS: WizardStep[] = [
  { id: 0, title: 'Template', description: 'Select template' },
  { id: 1, title: 'Content', description: 'Source selection' },
  { id: 2, title: 'Processing', description: 'AI generation' },
  { id: 3, title: 'Configure', description: 'Quiz settings' },
  { id: 4, title: 'Review', description: 'Review & save' },
];

// ReviewAndSave Component
interface ReviewAndSaveProps {
  quizConfig: QuizConfig;
  questionDistribution: QuizDistribution;
  generatedQuestions: Question[];
  selectedSource: ContentSource | null;
  onBack: () => void;
  onEditConfig: () => void;
  onEditContent: () => void;
}

function ReviewAndSave({
  quizConfig,
  questionDistribution,
  generatedQuestions,
  selectedSource,
  onBack,
  onEditConfig,
  onEditContent,
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
      const formData = new FormData();
      
      // Add the content source with proper type indication
      if (selectedSource) {
        if (selectedSource.type === 'file' && selectedSource.content instanceof File) {
          formData.append('file', selectedSource.content);
          formData.append('sourceType', 'file');
        } else if (selectedSource.type === 'topic' && typeof selectedSource.content === 'string') {
          formData.append('textContent', selectedSource.content);
          formData.append('sourceType', 'topic');
        } else if (selectedSource.type === 'video' && typeof selectedSource.content === 'string') {
          formData.append('videoUrl', selectedSource.content);
          formData.append('sourceType', 'video');
        } else if (selectedSource.type === 'url' && typeof selectedSource.content === 'string') {
          formData.append('webUrl', selectedSource.content);
          formData.append('sourceType', 'url');
        }
      }
      
      // Add final configuration
      formData.append('title', quizConfig.title);
      formData.append('duration', quizConfig.duration);
      formData.append('questionsPerStudent', quizConfig.questionsPerStudent);
      formData.append('expiresAt', quizConfig.expiresAt);
      
      // Add optional fields
      if (quizConfig.startDate) {
        formData.append('startDate', quizConfig.startDate);
      }
      if (quizConfig.maxStudents) {
        formData.append('maxStudents', quizConfig.maxStudents);
      }
      if (quizConfig.subjects.length > 0) {
        formData.append('subjects', JSON.stringify(quizConfig.subjects));
      }
      
      // Add question distribution
      formData.append('questionDistribution', JSON.stringify(questionDistribution));

      // Call backend API to create quiz
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
              <Icon name="check" className="w-10 h-10 text-green-600" />
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
                <Icon 
                  name={copiedCode ? "check" : "copy"} 
                  size="lg" 
                  className={copiedCode ? "text-green-600" : "text-gray-600"} 
                />
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
              <Icon name="home" className="mr-2" />
              Back to Dashboard
            </Button>
            <Button
              variant="primary"
              onClick={handleGoToQuizManagement}
              className="flex-1"
            >
              View Quiz Details
              <Icon name="arrow-right" className="ml-2" />
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
              <Icon name="edit" size="sm" className="mr-1" />
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

            {quizConfig.startDate && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Starts At</p>
                <p className="text-base font-semibold text-gray-900">
                  {new Date(quizConfig.startDate).toLocaleString()}
                </p>
              </div>
            )}

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Expires At</p>
              <p className="text-base font-semibold text-gray-900">
                {new Date(quizConfig.expiresAt).toLocaleString()}
              </p>
            </div>

            {quizConfig.maxStudents && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Maximum Students</p>
                <p className="text-base font-semibold text-gray-900">{quizConfig.maxStudents}</p>
              </div>
            )}

            {quizConfig.subjects.length > 0 && (
              <div className="bg-white rounded-lg p-4 shadow-sm col-span-full">
                <p className="text-sm text-gray-600 mb-2">Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {quizConfig.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg p-4 shadow-sm col-span-full">
              <p className="text-sm text-gray-600 mb-2">Question Distribution</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {questionDistribution.multipleChoice > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{questionDistribution.multipleChoice}%</p>
                    <p className="text-xs text-gray-600">Multiple Choice</p>
                  </div>
                )}
                {questionDistribution.trueFalse > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{questionDistribution.trueFalse}%</p>
                    <p className="text-xs text-gray-600">True/False</p>
                  </div>
                )}
                {questionDistribution.fillInBlank > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{questionDistribution.fillInBlank}%</p>
                    <p className="text-xs text-gray-600">Fill-in-the-Blank</p>
                  </div>
                )}
                {questionDistribution.matching > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{questionDistribution.matching}%</p>
                    <p className="text-xs text-gray-600">Matching</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Generated Questions Preview - Note: Full editing will be in task 16 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Generated Questions ({generatedQuestions.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditContent}
              aria-label="Change content source"
            >
              <Icon name="upload" size="sm" className="mr-1" />
              Change Content
            </Button>
          </div>

          {/* Question Type Summary */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Questions by Type:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['multipleChoice', 'trueFalse', 'fillInBlank', 'matching'].map((type) => {
                const count = generatedQuestions.filter((q) => q.type === type).length;
                if (count === 0) return null;
                
                const labels = {
                  multipleChoice: 'Multiple Choice',
                  trueFalse: 'True/False',
                  fillInBlank: 'Fill-in-the-Blank',
                  matching: 'Matching',
                };
                
                return (
                  <div key={type} className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{count}</p>
                    <p className="text-xs text-gray-600">{labels[type as keyof typeof labels]}</p>
                  </div>
                );
              })}
            </div>
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
                    {/* Question Type Badge */}
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {question.type === 'multipleChoice' && 'Multiple Choice'}
                        {question.type === 'trueFalse' && 'True/False'}
                        {question.type === 'fillInBlank' && 'Fill-in-the-Blank'}
                        {question.type === 'matching' && 'Matching'}
                      </span>
                    </div>
                    
                    <p className="text-base font-medium text-gray-900 mb-3">
                      {question.question}
                    </p>
                    
                    {/* Display based on question type */}
                    {question.type === 'multipleChoice' && (
                      <div className="space-y-2">
                        {(question as any).options.map((option: string, optionIndex: number) => (
                          <div
                            key={optionIndex}
                            className={`
                              flex items-start space-x-2 p-2 rounded-md text-sm
                              ${
                                optionIndex === (question as any).correctAnswer
                                  ? 'bg-green-50 border border-green-200'
                                  : 'bg-gray-50'
                              }
                            `}
                          >
                            <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs font-medium">
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            <span className="text-gray-700 flex-1">{option}</span>
                            {optionIndex === (question as any).correctAnswer && (
                              <Icon name="check" className="text-green-600 flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {question.type === 'trueFalse' && (
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded text-sm font-medium ${
                          (question as any).correctAnswer === true
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          True {(question as any).correctAnswer === true && '✓'}
                        </span>
                        <span className={`px-3 py-1 rounded text-sm font-medium ${
                          (question as any).correctAnswer === false
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          False {(question as any).correctAnswer === false && '✓'}
                        </span>
                      </div>
                    )}
                    
                    {question.type === 'fillInBlank' && (
                      <div className="bg-green-50 border border-green-200 rounded p-2">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Answer:</span> {(question as any).correctAnswer}
                        </p>
                      </div>
                    )}
                    
                    {question.type === 'matching' && (
                      <div className="space-y-2">
                        {(question as any).correctPairs?.map((pair: any, pairIndex: number) => (
                          <div key={pairIndex} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                            <span className="text-gray-700">{(question as any).leftColumn[pair.left]}</span>
                            <Icon name="arrow-right" className="text-gray-400" />
                            <span className="text-gray-700">{(question as any).rightColumn[pair.right]}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon name="info" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                Question editing will be available in the next update. For now, you can regenerate questions by changing the content source.
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <Icon name="error" className="text-red-600 mt-0.5 flex-shrink-0" />
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
            <Icon name="arrow-left" className="mr-2" />
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
            {!isCreating && <Icon name="check" className="ml-2" />}
          </Button>
        </div>
      </div>
    </>
  );
}

type ProcessingStage = 'extracting' | 'generating' | 'complete';

interface QuizConfig {
  title: string;
  duration: string;
  expiresAt: string;
  questionsPerStudent: string;
  startDate: string;
  maxStudents: string;
  subjects: string[];
}

interface ConfigErrors {
  title?: string;
  duration?: string;
  expiresAt?: string;
  questionsPerStudent?: string;
  startDate?: string;
  maxStudents?: string;
  subjects?: string;
}

export default function CreateQuizPage() {
  // Step 0: Template Selection
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<QuizTemplate | null>(null);
  
  // Step 1: Content Source Selection
  const [selectedSource, setSelectedSource] = useState<ContentSource | null>(null);
  const [sourceError, setSourceError] = useState('');
  
  // Step 2: AI Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('extracting');
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  
  // Step 3: Configuration state
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({
    title: '',
    duration: '30',
    expiresAt: '',
    questionsPerStudent: '10',
    startDate: '',
    maxStudents: '',
    subjects: [],
  });
  const [questionDistribution, setQuestionDistribution] = useState<QuizDistribution>({
    multipleChoice: 100,
    trueFalse: 0,
    fillInBlank: 0,
    matching: 0,
  });
  const [configErrors, setConfigErrors] = useState<ConfigErrors>({});
  
  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('error');

  // Step 0: Template Selection Handlers
  const handleTemplateSelect = (template: QuizTemplate | null) => {
    setSelectedTemplate(template);
    
    if (template) {
      // Pre-fill configuration with template values
      setQuizConfig((prev) => ({
        ...prev,
        duration: template.duration.toString(),
        questionsPerStudent: template.questionCount.toString(),
      }));
      setQuestionDistribution(template.questionDistribution);
      
      // Calculate expiration date based on template's expiration period
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + template.expirationPeriod);
      setQuizConfig((prev) => ({
        ...prev,
        expiresAt: expirationDate.toISOString().slice(0, 16),
      }));
      
      if (template.subjects && template.subjects.length > 0) {
        setQuizConfig((prev) => ({
          ...prev,
          subjects: template.subjects || [],
        }));
      }
    }
  };

  const handleTemplateNext = () => {
    setCurrentStep(1);
  };

  // Step 1: Content Source Selection Handlers
  const handleSourceSelect = (source: ContentSource | null) => {
    setSelectedSource(source);
    setSourceError('');
  };

  const handleConfigChange = (field: keyof QuizConfig, value: string | string[]) => {
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
    
    // Validate start date (optional)
    if (quizConfig.startDate) {
      const startDate = new Date(quizConfig.startDate);
      const now = new Date();
      
      if (isNaN(startDate.getTime())) {
        errors.startDate = 'Invalid date format';
      } else if (startDate <= now) {
        errors.startDate = 'Start date must be in the future';
      }
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
      } else if (quizConfig.startDate) {
        const startDate = new Date(quizConfig.startDate);
        if (expirationDate <= startDate) {
          errors.expiresAt = 'Expiration date must be after start date';
        }
      }
    }
    
    // Validate max students (optional)
    if (quizConfig.maxStudents) {
      const maxStudents = parseInt(quizConfig.maxStudents);
      if (isNaN(maxStudents) || maxStudents < 1) {
        errors.maxStudents = 'Must be at least 1 student';
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

  const handleBackToContent = () => {
    setCurrentStep(1);
    setConfigErrors({});
  };

  const handleConfigNext = () => {
    if (validateConfiguration()) {
      setCurrentStep(4);
    }
  };

  const handleContentNext = async () => {
    // Validate content source is selected
    if (!selectedSource) {
      setSourceError('Please select a content source');
      return;
    }

    // Proceed to AI processing step
    setCurrentStep(2);
    setIsProcessing(true);
    setSourceError('');

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const token = getAuthToken();
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let extractedContent = '';

      // Stage 1: Extracting content
      setProcessingStage('extracting');
      
      // Extract content based on source type
      if (selectedSource.type === 'video' && typeof selectedSource.content === 'string') {
        // Extract video transcript
        const videoResponse = await fetch(`${API_BASE_URL}/api/quiz/process-video`, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ videoUrl: selectedSource.content }),
        });
        
        if (!videoResponse.ok) {
          const errorData = await videoResponse.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to extract video content');
        }
        
        const videoData = await videoResponse.json();
        extractedContent = videoData.content;
        
      } else if (selectedSource.type === 'url' && typeof selectedSource.content === 'string') {
        // Extract web page content
        const urlResponse = await fetch(`${API_BASE_URL}/api/quiz/process-url`, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ webUrl: selectedSource.content }),
        });
        
        if (!urlResponse.ok) {
          const errorData = await urlResponse.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to extract web content');
        }
        
        const urlData = await urlResponse.json();
        extractedContent = urlData.content;
      }
      
      // Stage 2: Generating questions
      setProcessingStage('generating');
      
      // Prepare form data for question generation
      const formData = new FormData();
      
      if (selectedSource.type === 'file' && selectedSource.content instanceof File) {
        formData.append('file', selectedSource.content);
      } else if (selectedSource.type === 'topic' && typeof selectedSource.content === 'string') {
        formData.append('textContent', selectedSource.content);
      } else if (extractedContent) {
        // Use extracted content from video or URL
        formData.append('textContent', extractedContent);
      }
      
      // Add placeholder values for required fields (will be configured in step 3)
      formData.append('title', 'Untitled Quiz');
      formData.append('duration', quizConfig.duration || '30');
      formData.append('questionsPerStudent', quizConfig.questionsPerStudent || '10');
      formData.append('expiresAt', quizConfig.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
      
      // Add question distribution
      formData.append('questionDistribution', JSON.stringify(questionDistribution));

      // Use test endpoint to generate questions without saving
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
        setCurrentStep(3);
      }, 1000);
      
    } catch (err: any) {
      setIsProcessing(false);
      setCurrentStep(1); // Go back to content selection step
      
      // Display user-friendly error message
      let errorMessage = 'Failed to process content. Please try again.';
      
      if (err.message) {
        // Customize error messages based on common scenarios
        if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again with smaller content.';
        } else if (err.message.includes('transcript')) {
          errorMessage = 'Unable to extract video transcript. The video may not have captions available.';
        } else if (err.message.includes('URL') || err.message.includes('webpage')) {
          errorMessage = 'Unable to extract content from the URL. Please check if the URL is accessible.';
        } else if (err.message.includes('file') || err.message.includes('content')) {
          errorMessage = 'Unable to extract content. Please try a different source.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setSourceError(errorMessage);
      
      // Show toast notification
      setToastType('error');
      setToastMessage(errorMessage);
      setShowToast(true);
      
      console.error('AI processing error:', err);
    }
  };

  const canProceedFromContent = !!selectedSource;

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
        {/* Step 0: Template Selection */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Step 0: Select a Template (Optional)
              </h2>
              <p className="text-gray-600">
                Choose a template to pre-fill quiz settings, or skip to start from scratch
              </p>
            </div>

            <TemplateSelector
              onSelect={handleTemplateSelect}
              selectedTemplateId={selectedTemplate?._id}
            />

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
                onClick={handleTemplateNext}
              >
                {selectedTemplate ? 'Next: Content Source' : 'Skip Template'}
                <Icon name="arrow-right" className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 1: Content Source Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Step 1: Select Content Source
              </h2>
              <p className="text-gray-600">
                Choose how you want to provide content for AI to generate quiz questions
              </p>
            </div>

            <ContentSourceSelector
              onSourceSelect={handleSourceSelect}
              selectedSource={selectedSource}
              error={sourceError}
            />

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentStep(0)}
              >
                <Icon name="arrow-left" className="mr-2" />
                Back
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={handleContentNext}
                disabled={!canProceedFromContent}
              >
                Next: AI Processing
                <Icon name="arrow-right" className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: AI Processing */}
        {currentStep === 2 && (
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
        {currentStep === 3 && (
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
                showValidIndicator={true}
              />

              {/* Question Distribution */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Question Type Distribution</h3>
                <QuestionDistribution
                  totalQuestions={parseInt(quizConfig.questionsPerStudent) || 10}
                  distribution={questionDistribution}
                  onChange={setQuestionDistribution}
                  mode="percentage"
                />
              </div>

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
                  showValidIndicator={true}
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
                  showValidIndicator={true}
                />
              </div>

              {/* Start Date and Max Students - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date (Optional) */}
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Start Date & Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    value={quizConfig.startDate}
                    onChange={(e) => handleConfigChange('startDate', e.target.value)}
                    className={`
                      block w-full px-3 py-2 border rounded-lg shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors
                      ${
                        configErrors.startDate
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      }
                    `}
                    aria-invalid={!!configErrors.startDate}
                    aria-describedby={configErrors.startDate ? 'startDate-error' : 'startDate-helper'}
                  />
                  {configErrors.startDate && (
                    <p id="startDate-error" className="mt-1 text-sm text-red-600" role="alert">
                      {configErrors.startDate}
                    </p>
                  )}
                  {!configErrors.startDate && (
                    <p id="startDate-helper" className="mt-1 text-sm text-gray-500">
                      Quiz will be available starting from this date
                    </p>
                  )}
                </div>

                {/* Max Students (Optional) */}
                <Input
                  type="number"
                  label="Maximum Students (Optional)"
                  value={quizConfig.maxStudents}
                  onChange={(e) => handleConfigChange('maxStudents', e.target.value)}
                  error={configErrors.maxStudents}
                  placeholder="Leave empty for unlimited"
                  min="1"
                  helperText="Limit the number of students who can take this quiz"
                  showValidIndicator={false}
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

              {/* Subjects (Multi-select) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjects (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Math', 'Science', 'History', 'English', 'Geography', 'Physics', 'Chemistry', 'Biology'].map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => {
                        const subjects = quizConfig.subjects.includes(subject)
                          ? quizConfig.subjects.filter((s) => s !== subject)
                          : [...quizConfig.subjects, subject];
                        handleConfigChange('subjects', subjects);
                      }}
                      className={`px-3 py-1.5 text-sm rounded-full border-2 transition-colors ${
                        quizConfig.subjects.includes(subject)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Select one or more subjects to categorize this quiz
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Icon name="info" className="text-blue-600 mt-0.5 flex-shrink-0" />
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
                onClick={handleBackToContent}
              >
                <Icon name="arrow-left" className="mr-2" />
                Back
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={handleConfigNext}
              >
                Next: Review
                <Icon name="arrow-right" className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Save */}
        {currentStep === 4 && (
          <ReviewAndSave
            quizConfig={quizConfig}
            questionDistribution={questionDistribution}
            generatedQuestions={generatedQuestions}
            selectedSource={selectedSource}
            onBack={() => setCurrentStep(3)}
            onEditConfig={() => setCurrentStep(3)}
            onEditContent={() => setCurrentStep(1)}
          />
        )}
      </Card>
      </div>
    </>
  );
}
