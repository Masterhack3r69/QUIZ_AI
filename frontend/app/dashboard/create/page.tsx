'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ArrowLeft, ArrowRight, Check, Copy, Home, Upload, Info, Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import type { Question, ContentSource, QuizDistribution } from '@/types';

// Dynamically import heavy components with loading states
const ContentSourceSelector = dynamic(
  () => import('@/components/quiz/ContentSourceSelector').then(mod => ({ default: mod.ContentSourceSelector })),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    ),
    ssr: false,
  }
);

const QuestionDistribution = dynamic(
  () => import('@/components/quiz/QuestionDistribution').then(mod => ({ default: mod.QuestionDistribution })),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    ),
    ssr: false,
  }
);

const WIZARD_STEPS = [
  { id: 'upload', title: 'Upload', description: 'Source selection' },
  { id: 'processing', title: 'Processing', description: 'AI generation' },
  { id: 'configure', title: 'Configure', description: 'Quiz settings' },
  { id: 'review', title: 'Review', description: 'Review & save' },
] as const;

type WizardStep = typeof WIZARD_STEPS[number]['id'];

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
      toast.error('Error', {
        description: errorMessage,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyAccessCode = async () => {
    if (!createdQuiz) return;

    try {
      await navigator.clipboard.writeText(createdQuiz.accessCode);
      setCopiedCode(true);
      toast.success('Success', {
        description: 'Access code copied to clipboard!',
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Error', {
        description: 'Failed to copy access code',
      });
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
      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Quiz Created Successfully!</DialogTitle>
            <DialogDescription className="text-center">
              Your quiz has been created and is ready to share with students!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-green-600" />
              </div>
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
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <Copy className="h-5 w-5 text-gray-600" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-3 text-center">
                Share this code with your students to give them access to the quiz
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              onClick={handleGoToDashboard}
              className="flex-1"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button
              onClick={handleGoToQuizManagement}
              className="flex-1"
            >
              View Quiz Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Content */}
      <div className="space-y-6">

        {/* Quiz Configuration Summary */}
        <Card className="bg-muted/30 border-2 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Check className="w-5 h-5 text-primary-foreground" />
                </div>
                <CardTitle className="text-lg">Quiz Configuration</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEditConfig}
                aria-label="Edit configuration"
              >
                <Edit className="mr-1 h-4 w-4" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">Quiz Title</p>
                <p className="text-base font-semibold">{quizConfig.title}</p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <p className="text-base font-semibold">{quizConfig.duration} minutes</p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">Questions Per Student</p>
                <p className="text-base font-semibold">
                  {quizConfig.questionsPerStudent} of {generatedQuestions.length} questions
                </p>
              </div>

              {quizConfig.startDate && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-muted-foreground mb-1">Starts At</p>
                  <p className="text-base font-semibold">
                    {new Date(quizConfig.startDate).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">Expires At</p>
                <p className="text-base font-semibold">
                  {new Date(quizConfig.expiresAt).toLocaleString()}
                </p>
              </div>

              {quizConfig.maxStudents && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-muted-foreground mb-1">Maximum Students</p>
                  <p className="text-base font-semibold">{quizConfig.maxStudents}</p>
                </div>
              )}

              {quizConfig.subjects.length > 0 && (
                <div className="bg-white rounded-lg p-4 shadow-sm col-span-full">
                  <p className="text-sm text-muted-foreground mb-2">Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {quizConfig.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg p-4 shadow-sm col-span-full">
                <p className="text-sm text-muted-foreground mb-2">Question Distribution</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {questionDistribution.multipleChoice > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{questionDistribution.multipleChoice}%</p>
                      <p className="text-xs text-muted-foreground">Multiple Choice</p>
                    </div>
                  )}
                  {questionDistribution.trueFalse > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{questionDistribution.trueFalse}%</p>
                      <p className="text-xs text-muted-foreground">True/False</p>
                    </div>
                  )}
                  {questionDistribution.fillInBlank > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{questionDistribution.fillInBlank}%</p>
                      <p className="text-xs text-muted-foreground">Fill-in-the-Blank</p>
                    </div>
                  )}
                  {questionDistribution.matching > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{questionDistribution.matching}%</p>
                      <p className="text-xs text-muted-foreground">Matching</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generated Questions Preview */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-muted/50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">{generatedQuestions.length}</span>
                </div>
                <CardTitle className="text-lg">Generated Questions</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEditContent}
                aria-label="Change content source"
              >
                <Upload className="mr-1 h-4 w-4" />
                Change Content
              </Button>
            </div>
          </CardHeader>
          <CardContent>

            {/* Question Type Summary */}
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Questions by Type:</p>
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
                      <p className="text-xs text-muted-foreground">{labels[type as keyof typeof labels]}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {generatedQuestions.map((question, index) => (
                <Card key={question._id || index} className="hover:border-blue-300 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Question Type Badge */}
                        <div className="mb-2">
                          <Badge variant="secondary">
                            {question.type === 'multipleChoice' && 'Multiple Choice'}
                            {question.type === 'trueFalse' && 'True/False'}
                            {question.type === 'fillInBlank' && 'Fill-in-the-Blank'}
                            {question.type === 'matching' && 'Matching'}
                          </Badge>
                        </div>
                        
                        <p className="text-base font-medium mb-3">
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
                                      : 'bg-muted'
                                  }
                                `}
                              >
                                <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs font-medium">
                                  {String.fromCharCode(65 + optionIndex)}
                                </span>
                                <span className="flex-1">{option}</span>
                                {optionIndex === (question as any).correctAnswer && (
                                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {question.type === 'trueFalse' && (
                          <div className="flex gap-2">
                            <Badge variant={(question as any).correctAnswer === true ? 'default' : 'secondary'}>
                              True {(question as any).correctAnswer === true && '✓'}
                            </Badge>
                            <Badge variant={(question as any).correctAnswer === false ? 'default' : 'secondary'}>
                              False {(question as any).correctAnswer === false && '✓'}
                            </Badge>
                          </div>
                        )}
                        
                        {question.type === 'fillInBlank' && (
                          <div className="bg-green-50 border border-green-200 rounded p-2">
                            <p className="text-sm">
                              <span className="font-medium">Answer:</span> {(question as any).correctAnswer}
                            </p>
                          </div>
                        )}
                        
                        {question.type === 'matching' && (
                          <div className="space-y-2">
                            {(question as any).correctPairs?.map((pair: any, pairIndex: number) => (
                              <div key={pairIndex} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                                <span>{(question as any).leftColumn[pair.left]}</span>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <span>{(question as any).rightColumn[pair.right]}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>
                Question editing will be available in the next update. For now, you can regenerate questions by changing the content source.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isCreating}
            className="px-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button
            type="button"
            onClick={handleCreateQuiz}
            disabled={isCreating}
            className="px-8 font-semibold shadow-lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Quiz...
              </>
            ) : (
              <>
                Create Quiz
                <Check className="ml-2 h-4 w-4" />
              </>
            )}
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
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
  
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
    setCurrentStep('upload');
    setConfigErrors({});
  };

  const handleConfigNext = () => {
    if (validateConfiguration()) {
      setCurrentStep('review');
    }
  };

  const handleContentNext = async () => {
    // Validate content source is selected
    if (!selectedSource) {
      setSourceError('Please select a content source');
      return;
    }

    // Proceed to AI processing step
    setCurrentStep('processing');
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
        setCurrentStep('configure');
      }, 1000);
      
    } catch (err: any) {
      setIsProcessing(false);
      setCurrentStep('upload'); // Go back to content selection step
      
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
      toast.error('Error', {
        description: errorMessage,
      });
      
      console.error('AI processing error:', err);
    }
  };

  const canProceedFromContent = !!selectedSource;
  
  // Determine which step index we're on for the tabs
  const getStepIndex = () => {
    return WIZARD_STEPS.findIndex(step => step.id === currentStep);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-muted/50">
      <div className="max-w-6xl mx-auto p-6 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Create New Quiz
          </h1>
          <p className="text-muted-foreground text-lg">
            Follow the steps to create a new quiz from your content
          </p>
        </div>

        {/* Custom Step Indicator */}
        <div className="mb-12">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-muted -z-10">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-in-out"
                style={{ width: `${(getStepIndex() / (WIZARD_STEPS.length - 1)) * 100}%` }}
              />
            </div>

            {/* Step Circles */}
            <div className="flex justify-between items-start">
              {WIZARD_STEPS.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = index < getStepIndex();
                const isCurrent = index === getStepIndex();
                
                return (
                  <div key={step.id} className="flex flex-col items-center flex-1">
                    {/* Circle */}
                    <div className={`
                      relative w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg
                      transition-all duration-300 transform
                      ${isCompleted 
                        ? 'bg-primary/90 text-primary-foreground scale-100 shadow-lg' 
                        : isCurrent
                        ? 'bg-primary text-primary-foreground scale-110 shadow-xl ring-4 ring-primary/20 animate-pulse'
                        : 'bg-background border-2 border-muted-foreground/30 text-muted-foreground scale-100'
                      }
                    `}>
                      {isCompleted ? (
                        <Check className="w-8 h-8" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    
                    {/* Label */}
                    <div className="mt-3 text-center max-w-[120px]">
                      <p className={`
                        font-semibold text-sm mb-1 transition-colors
                        ${isCurrent ? 'text-primary' : isCompleted ? 'text-primary/80' : 'text-muted-foreground'}
                      `}>
                        {step.title}
                      </p>
                      <p className={`
                        text-xs transition-colors
                        ${isCurrent ? 'text-primary/70' : isCompleted ? 'text-primary/60' : 'text-muted-foreground/70'}
                      `}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      <Tabs value={currentStep} className="space-y-6">
        {/* Hidden TabsList for accessibility */}
        <TabsList className="sr-only">
          {WIZARD_STEPS.map((step) => (
            <TabsTrigger key={step.id} value={step.id}>
              {step.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Step 1: Upload/Content Source Selection */}
        <TabsContent value="upload" className="space-y-6 animate-in fade-in-50 duration-500">
          <Card className="border-2 shadow-xl bg-card/80 backdrop-blur">
            <CardHeader className="bg-muted/50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  1
                </div>
                <div>
                  <CardTitle className="text-xl">Select Content Source</CardTitle>
                  <CardDescription className="text-base">
                    Choose how you want to provide content for AI to generate quiz questions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <ContentSourceSelector
                onSourceSelect={handleSourceSelect}
                selectedSource={selectedSource}
                error={sourceError}
              />

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="px-6"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleContentNext}
                  disabled={!canProceedFromContent}
                  className="px-6"
                >
                  Next: AI Processing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: AI Processing */}
        <TabsContent value="processing" className="space-y-6 animate-in fade-in-50 duration-500">
          <Card className="border-2 shadow-xl bg-card/80 backdrop-blur overflow-hidden">
            <CardHeader className="bg-muted/50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  2
                </div>
                <div>
                  <CardTitle className="text-xl">AI Processing</CardTitle>
                  <CardDescription className="text-base">
                    Our AI is analyzing your content and generating quiz questions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Processing Animation and Status */}
              <div className="py-16 flex flex-col items-center justify-center">
                {/* Animated Spinner */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                  <Loader2 className="relative h-24 w-24 animate-spin text-primary" />
                </div>

                {/* Progress Messages */}
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold text-foreground">
                    {processingStage === 'extracting' && 'Extracting content...'}
                    {processingStage === 'generating' && 'Generating questions...'}
                    {processingStage === 'complete' && 'Complete!'}
                  </h3>
                  
                  <p className="text-muted-foreground max-w-md text-lg">
                    {processingStage === 'extracting' && 
                      'Reading and analyzing your learning material'}
                    {processingStage === 'generating' && 
                      'Creating intelligent quiz questions based on the content'}
                    {processingStage === 'complete' && 
                      'Questions generated successfully. Proceeding to configuration...'}
                  </p>

                  {/* Progress Indicators */}
                  <div className="flex items-center justify-center space-x-3 pt-6">
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                        processingStage === 'extracting' ? 'bg-primary animate-pulse scale-125' : 'bg-primary/80'
                      }`}></div>
                      <span className="text-xs font-medium">Extract</span>
                    </div>
                    <div className="w-12 h-0.5 bg-muted"></div>
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                        processingStage === 'generating' ? 'bg-primary animate-pulse scale-125' : 
                        processingStage === 'complete' ? 'bg-primary/80' : 'bg-muted'
                      }`}></div>
                      <span className="text-xs font-medium">Generate</span>
                    </div>
                    <div className="w-12 h-0.5 bg-muted"></div>
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                        processingStage === 'complete' ? 'bg-primary scale-125' : 'bg-muted'
                      }`}></div>
                      <span className="text-xs font-medium">Complete</span>
                    </div>
                  </div>
                </div>

                {/* Processing Info */}
                <div className="mt-12 p-4 bg-muted rounded-lg border text-sm text-muted-foreground text-center max-w-md">
                  <p className="font-medium">⏱️ This may take 30-60 seconds</p>
                  <p className="mt-1">Please do not close this window.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: Configuration */}
        <TabsContent value="configure" className="space-y-6 animate-in fade-in-50 duration-500">
          <Card className="border-2 shadow-xl bg-card/80 backdrop-blur overflow-visible">
            <CardHeader className="bg-muted/50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl">Configure Quiz Settings</CardTitle>
                  <CardDescription className="text-base">
                    Set up your quiz parameters and preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 overflow-visible">
              {/* Success Message */}
              <div className="rounded-lg bg-primary/10 border-2 border-primary/30 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center mt-0.5">
                    <Check className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base text-foreground mb-1">
                      AI Processing Complete
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Successfully generated <span className="font-semibold text-primary">{generatedQuestions.length}</span> questions from your content
                    </p>
                  </div>
                </div>
              </div>

              {/* Configuration Form */}
              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                {/* Quiz Title */}
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-base font-semibold">
                    Quiz Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    value={quizConfig.title}
                    onChange={(e) => handleConfigChange('title', e.target.value)}
                    placeholder="e.g., Chapter 5: Photosynthesis Quiz"
                    required
                    className="h-11 text-base"
                  />
                  {configErrors.title && (
                    <p className="text-sm text-destructive font-medium">{configErrors.title}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Give your quiz a descriptive title
                  </p>
                </div>

                {/* Question Distribution */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Question Type Distribution</Label>
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
                  <div className="space-y-3">
                    <Label htmlFor="duration" className="text-base font-semibold">
                      Duration (minutes) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      value={quizConfig.duration}
                      onChange={(e) => handleConfigChange('duration', e.target.value)}
                      placeholder="30"
                      min="1"
                      max="300"
                      required
                      className="h-11 text-base"
                    />
                    {configErrors.duration && (
                      <p className="text-sm text-destructive font-medium">{configErrors.duration}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Time limit for students to complete the quiz
                    </p>
                  </div>

                  {/* Questions Per Student */}
                  <div className="space-y-3">
                    <Label htmlFor="questionsPerStudent" className="text-base font-semibold">
                      Questions Per Student <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="questionsPerStudent"
                      type="number"
                      value={quizConfig.questionsPerStudent}
                      onChange={(e) => handleConfigChange('questionsPerStudent', e.target.value)}
                      placeholder="10"
                      min="1"
                      max={generatedQuestions.length}
                      required
                      className="h-11 text-base"
                    />
                    {configErrors.questionsPerStudent && (
                      <p className="text-sm text-destructive font-medium">{configErrors.questionsPerStudent}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Max: {generatedQuestions.length} questions available
                    </p>
                  </div>
                </div>

                {/* Start Date and Max Students - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date (Optional) */}
                  <div className="space-y-3">
                    <Label htmlFor="startDate" className="text-base font-semibold">Start Date & Time (Optional)</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={quizConfig.startDate}
                      onChange={(e) => handleConfigChange('startDate', e.target.value)}
                      className="h-11 text-base"
                    />
                    {configErrors.startDate && (
                      <p className="text-sm text-destructive font-medium">{configErrors.startDate}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Quiz will be available starting from this date
                    </p>
                  </div>

                  {/* Max Students (Optional) */}
                  <div className="space-y-3">
                    <Label htmlFor="maxStudents" className="text-base font-semibold">Maximum Students (Optional)</Label>
                    <Input
                      id="maxStudents"
                      type="number"
                      value={quizConfig.maxStudents}
                      onChange={(e) => handleConfigChange('maxStudents', e.target.value)}
                      placeholder="Leave empty for unlimited"
                      min="1"
                      className="h-11 text-base"
                    />
                    {configErrors.maxStudents && (
                      <p className="text-sm text-destructive font-medium">{configErrors.maxStudents}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Limit the number of students who can take this quiz
                    </p>
                  </div>
                </div>

                {/* Expiration Date/Time */}
                <div className="space-y-3">
                  <Label htmlFor="expiresAt" className="text-base font-semibold">
                    Expiration Date & Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={quizConfig.expiresAt}
                    onChange={(e) => handleConfigChange('expiresAt', e.target.value)}
                    required
                    className="h-11 text-base"
                  />
                  {configErrors.expiresAt && (
                    <p className="text-sm text-destructive font-medium">{configErrors.expiresAt}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Students will not be able to access the quiz after this date and time
                  </p>
                </div>

                {/* Subjects (Multi-select) */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Subjects (Optional)</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Math', 'Science', 'History', 'English', 'Geography', 'Physics', 'Chemistry', 'Biology'].map((subject) => (
                      <Badge
                        key={subject}
                        variant={quizConfig.subjects.includes(subject) ? 'default' : 'outline'}
                        className="cursor-pointer px-4 py-2 text-sm font-medium hover:scale-105 transition-transform"
                        onClick={() => {
                          const subjects = quizConfig.subjects.includes(subject)
                            ? quizConfig.subjects.filter((s) => s !== subject)
                            : [...quizConfig.subjects, subject];
                          handleConfigChange('subjects', subjects);
                        }}
                      >
                        {subject}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Select one or more subjects to categorize this quiz
                  </p>
                </div>

                {/* Info Box */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>About Question Randomization</AlertTitle>
                  <AlertDescription>
                    Each student will receive a random selection of{' '}
                    <span className="font-semibold">{quizConfig.questionsPerStudent || '?'}</span>{' '}
                    questions from the pool of{' '}
                    <span className="font-semibold">{generatedQuestions.length}</span>{' '}
                    generated questions. This ensures academic integrity while maintaining fairness.
                  </AlertDescription>
                </Alert>
              </form>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToContent}
                  className="px-6"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                <Button
                  type="button"
                  onClick={handleConfigNext}
                  className="px-6"
                >
                  Next: Review
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 4: Review & Save */}
        <TabsContent value="review" className="space-y-6 animate-in fade-in-50 duration-500">
          <div className="space-y-6">
            <Card className="border-2 shadow-xl bg-card/80 backdrop-blur">
              <CardHeader className="bg-muted/50 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    4
                  </div>
                  <div>
                    <CardTitle className="text-xl">Review & Save</CardTitle>
                    <CardDescription className="text-base">
                      Review your quiz configuration and generated questions before creating
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ReviewAndSave
                  quizConfig={quizConfig}
                  questionDistribution={questionDistribution}
                  generatedQuestions={generatedQuestions}
                  selectedSource={selectedSource}
                  onBack={() => setCurrentStep('configure')}
                  onEditConfig={() => setCurrentStep('configure')}
                  onEditContent={() => setCurrentStep('upload')}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
