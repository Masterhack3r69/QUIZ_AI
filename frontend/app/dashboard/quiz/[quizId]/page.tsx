'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Copy, BarChart3, Settings, Trash2, ArrowLeft, CheckCircle2, Users, Clock, Calendar, TrendingUp, Edit, Check } from 'lucide-react';
import { apiClient, APIRequestError } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/ui/shadcn-io/copy-button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { DetailPageLoadingSkeleton } from '@/components/shared/LoadingState';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import type { Quiz, Analytics } from '@/types';

interface EditFormData {
  title: string;
  duration: number;
  startDate: string;
  expiresAt: string;
  maxStudents: string;
  subjects: string;
}

interface EditFormErrors {
  title?: string;
  duration?: string;
  startDate?: string;
  expiresAt?: string;
  maxStudents?: string;
  subjects?: string;
}

export default function QuizManagementPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;
  const { showError, showSuccess } = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Edit form state
  const [editFormData, setEditFormData] = useState<EditFormData>({
    title: '',
    duration: 0,
    startDate: '',
    expiresAt: '',
    maxStudents: '',
    subjects: '',
  });
  const [editFormErrors, setEditFormErrors] = useState<EditFormErrors>({});

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch both quiz data and analytics in parallel
      const [quizData, analyticsData] = await Promise.all([
        apiClient.getQuiz(quizId),
        apiClient.getQuizAnalytics(quizId).catch(() => null), // Don't fail if analytics fails
      ]);
      
      console.log('Quiz data received:', quizData);
      console.log('Analytics data received:', analyticsData);
      
      setQuiz(quizData);
      setAnalytics(analyticsData);
    } catch (err) {
      let errorMessage = 'Failed to load quiz. Please try again.';
      if (err instanceof APIRequestError) {
        errorMessage = err.message;
        showError(err.message);
      } else {
        showError(errorMessage);
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuiz = async () => {
    try {
      setIsDeleting(true);
      await apiClient.deleteQuiz(quizId);
      showSuccess('Quiz deleted successfully');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      if (err instanceof APIRequestError) {
        showError(err.message);
      } else {
        showError('Failed to delete quiz. Please try again.');
      }
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleViewResults = () => {
    router.push(`/dashboard/quiz/${quizId}/results`);
  };

  const handleEditSettings = () => {
    if (!quiz) return;
    
    // Pre-populate form with current quiz values
    const expiresAtDate = new Date(quiz.expiresAt);
    const expiresAtLocal = new Date(expiresAtDate.getTime() - expiresAtDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    
    let startDateLocal = '';
    if (quiz.startDate) {
      const startDateObj = new Date(quiz.startDate);
      startDateLocal = new Date(startDateObj.getTime() - startDateObj.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    }
    
    setEditFormData({
      title: quiz.title,
      duration: quiz.duration,
      startDate: startDateLocal,
      expiresAt: expiresAtLocal,
      maxStudents: quiz.maxStudents?.toString() || '',
      subjects: quiz.subjects?.join(', ') || '',
    });
    setEditFormErrors({});
    setShowEditDialog(true);
  };

  const validateEditForm = (): boolean => {
    const errors: EditFormErrors = {};
    
    if (!editFormData.title.trim()) {
      errors.title = 'Title is required';
    } else if (editFormData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    
    if (!editFormData.duration || editFormData.duration <= 0) {
      errors.duration = 'Duration must be greater than 0';
    } else if (editFormData.duration > 300) {
      errors.duration = 'Duration cannot exceed 300 minutes';
    }
    
    let startDate: Date | null = null;
    if (editFormData.startDate) {
      startDate = new Date(editFormData.startDate);
      const now = new Date();
      if (startDate <= now) {
        errors.startDate = 'Start date must be in the future';
      }
    }
    
    if (!editFormData.expiresAt) {
      errors.expiresAt = 'Expiration date is required';
    } else {
      const expiresAt = new Date(editFormData.expiresAt);
      const now = new Date();
      if (expiresAt <= now) {
        errors.expiresAt = 'Expiration date must be in the future';
      }
      
      if (startDate && expiresAt <= startDate) {
        errors.expiresAt = 'Expiration date must be after start date';
      }
    }
    
    if (editFormData.maxStudents) {
      const maxStudents = parseInt(editFormData.maxStudents);
      if (isNaN(maxStudents) || maxStudents <= 0) {
        errors.maxStudents = 'Max students must be a positive number';
      } else if (maxStudents > 10000) {
        errors.maxStudents = 'Max students cannot exceed 10,000';
      }
    }
    
    if (editFormData.subjects) {
      const subjects = editFormData.subjects.split(',').map(s => s.trim()).filter(s => s);
      if (subjects.length === 0) {
        errors.subjects = 'Please enter at least one subject or leave empty';
      }
    }
    
    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateQuiz = async () => {
    if (!validateEditForm()) {
      return;
    }
    
    try {
      setIsUpdating(true);
      
      const updateData: any = {
        title: editFormData.title.trim(),
        duration: editFormData.duration,
        expiresAt: new Date(editFormData.expiresAt).toISOString(),
      };
      
      if (editFormData.startDate) {
        updateData.startDate = new Date(editFormData.startDate).toISOString();
      } else {
        updateData.startDate = null;
      }
      
      if (editFormData.maxStudents) {
        updateData.maxStudents = parseInt(editFormData.maxStudents);
      } else {
        updateData.maxStudents = null;
      }
      
      if (editFormData.subjects) {
        updateData.subjects = editFormData.subjects
          .split(',')
          .map(s => s.trim())
          .filter(s => s);
      } else {
        updateData.subjects = [];
      }
      
      const updatedQuiz = await apiClient.updateQuiz(quizId, updateData);
      
      setQuiz(updatedQuiz);
      setShowEditDialog(false);
      showSuccess('Quiz settings updated successfully!');
    } catch (err) {
      if (err instanceof APIRequestError) {
        showError(err.message);
      } else {
        showError('Failed to update quiz. Please try again.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditFormChange = (field: keyof EditFormData, value: string | number) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    if (editFormErrors[field]) {
      setEditFormErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Helper function to determine quiz status
  const getQuizStatus = (quiz: Quiz): { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' } => {
    const now = new Date();
    const expirationDate = new Date(quiz.expiresAt);
    const startDate = quiz.startDate ? new Date(quiz.startDate) : null;

    if (expirationDate < now) {
      return { label: 'Expired', variant: 'outline' };
    }

    if (quiz.maxStudents && quiz.submissionCount && quiz.submissionCount >= quiz.maxStudents) {
      return { label: 'Full', variant: 'secondary' };
    }

    if (startDate && startDate > now) {
      return { label: 'Scheduled', variant: 'secondary' };
    }

    if (quiz.status === 'draft') {
      return { label: 'Draft', variant: 'outline' };
    }

    return { label: 'Active', variant: 'default' };
  };

  // Calculate completion rate
  const getCompletionRate = (quiz: Quiz): number => {
    if (!quiz.maxStudents) return 0;
    return Math.min(((quiz.submissionCount || 0) / quiz.maxStudents) * 100, 100);
  };

  // Calculate average score from analytics data
  const getAverageScore = (): string => {
    if (!analytics || analytics.summary.totalSubmissions === 0) {
      return 'N/A';
    }
    return `${analytics.summary.averageScore.toFixed(1)}%`;
  };

  if (isLoading) {
    return <DetailPageLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <ErrorAlert
          title="Failed to Load Quiz"
          message={error}
          onRetry={loadQuiz}
          retryLabel="Retry"
        />
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  const status = getQuizStatus(quiz);

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="gap-1.5 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Badge variant={status.variant} className="text-xs">
          {status.label}
        </Badge>
      </div>

      {/* Compact Title & Code Section */}
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{quiz.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Quiz Management
          </p>
        </div>

        {/* Inline Access Code */}
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground mb-1">Access Code</p>
            <p className="text-2xl font-mono font-bold tracking-wider">
              {quiz.accessCode}
            </p>
          </div>
          <CopyButton
            content={quiz.accessCode}
            variant="outline"
            size="md"
            onCopy={() => showSuccess('Quiz code copied to clipboard!')}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent >
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <p className="text-sm text-muted-foreground">Submissions</p>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-3xl font-semibold tracking-tight">
                    {analytics?.summary.totalSubmissions ?? quiz.submissionCount ?? 0}
                  </p>
                  {quiz.maxStudents && (
                    <p className="text-xs text-muted-foreground mt-1">
                      of {quiz.maxStudents} max
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent >
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-3xl font-semibold tracking-tight">{getAverageScore()}</p>
                  {analytics && analytics.summary.totalSubmissions > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {analytics.summary.highestScore}% highest
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent >
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <p className="text-sm text-muted-foreground">Completion</p>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-3xl font-semibold tracking-tight">
                    {quiz.maxStudents ? `${Math.round(getCompletionRate(quiz))}%` : 'N/A'}
                  </p>
                  {quiz.maxStudents && (
                    <div className="mt-3">
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div 
                          className="bg-foreground h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(getCompletionRate(quiz), 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quiz Configuration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Quiz Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold">{quiz.duration} min</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Questions/Student</p>
                <p className="text-lg font-semibold">{quiz.questionsPerStudent}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Total Pool</p>
                <p className="text-lg font-semibold">{quiz.questions?.length || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Max Students</p>
                <p className="text-lg font-semibold">{quiz.maxStudents || 'Unlimited'}</p>
              </div>
            </div>

            {quiz.questionDistribution && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Question Types</p>
                  <div className="space-y-2">
                    {quiz.questionDistribution.multipleChoice > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Multiple Choice</span>
                        <Badge variant="secondary" className="font-semibold">
                          {quiz.questionDistribution.multipleChoice}
                        </Badge>
                      </div>
                    )}
                    {quiz.questionDistribution.trueFalse > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">True/False</span>
                        <Badge variant="secondary" className="font-semibold">
                          {quiz.questionDistribution.trueFalse}
                        </Badge>
                      </div>
                    )}
                    {quiz.questionDistribution.fillInBlank > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Fill in Blank</span>
                        <Badge variant="secondary" className="font-semibold">
                          {quiz.questionDistribution.fillInBlank}
                        </Badge>
                      </div>
                    )}
                    {quiz.questionDistribution.matching > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Matching</span>
                        <Badge variant="secondary" className="font-semibold">
                          {quiz.questionDistribution.matching}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Schedule & Metadata */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Schedule & Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              {quiz.startDate && (
                <div className="flex items-start justify-between py-2 border-b">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-muted-foreground">Start Date</p>
                    <p className="text-sm font-medium">
                      {new Date(quiz.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start justify-between py-2 border-b">
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-muted-foreground">Expiration Date</p>
                  <p className="text-sm font-medium">
                    {new Date(quiz.expiresAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start justify-between py-2 border-b">
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">
                    {new Date(quiz.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {quiz.subjects && quiz.subjects.length > 0 && (
              <>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Subjects</p>
                  <div className="flex flex-wrap gap-1.5">
                    {quiz.subjects.map((subject, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Compact Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={handleViewResults}
          className="gap-1.5"
        >
          <BarChart3 className="h-4 w-4" />
          Results
        </Button>

        <Button
          variant="outline"
          onClick={handleEditSettings}
          className="gap-1.5"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>

        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/quiz/${quizId}/edit`)}
          className="gap-1.5"
        >
          <Edit className="h-4 w-4" />
          Questions
        </Button>

        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
          className="gap-1.5"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      {/* Compact Edit Settings Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Edit Settings</DialogTitle>
            <DialogDescription className="text-sm">
              Update quiz configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs">Quiz Title *</Label>
              <Input
                id="title"
                value={editFormData.title}
                onChange={(e) => handleEditFormChange('title', e.target.value)}
                disabled={isUpdating}
                placeholder="Enter quiz title"
              />
              {editFormErrors.title && (
                <p className="text-xs text-destructive">{editFormErrors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="duration" className="text-xs">Duration (min) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={editFormData.duration.toString()}
                  onChange={(e) => handleEditFormChange('duration', parseInt(e.target.value) || 0)}
                  disabled={isUpdating}
                  min="1"
                  max="300"
                  placeholder="30"
                />
                {editFormErrors.duration && (
                  <p className="text-xs text-destructive">{editFormErrors.duration}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="maxStudents" className="text-xs">Max Students</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  value={editFormData.maxStudents}
                  onChange={(e) => handleEditFormChange('maxStudents', e.target.value)}
                  disabled={isUpdating}
                  min="1"
                  max="10000"
                  placeholder="Unlimited"
                />
                {editFormErrors.maxStudents && (
                  <p className="text-xs text-destructive">{editFormErrors.maxStudents}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="startDate" className="text-xs">Start Date & Time</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={editFormData.startDate}
                onChange={(e) => handleEditFormChange('startDate', e.target.value)}
                disabled={isUpdating}
              />
              {editFormErrors.startDate && (
                <p className="text-xs text-destructive">{editFormErrors.startDate}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expiresAt" className="text-xs">Expiration Date & Time *</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={editFormData.expiresAt}
                onChange={(e) => handleEditFormChange('expiresAt', e.target.value)}
                disabled={isUpdating}
              />
              {editFormErrors.expiresAt && (
                <p className="text-xs text-destructive">{editFormErrors.expiresAt}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subjects" className="text-xs">Subjects</Label>
              <Input
                id="subjects"
                value={editFormData.subjects}
                onChange={(e) => handleEditFormChange('subjects', e.target.value)}
                disabled={isUpdating}
                placeholder="Math, Science (comma-separated)"
              />
              {editFormErrors.subjects && (
                <p className="text-xs text-destructive">{editFormErrors.subjects}</p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isUpdating}
              size="sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateQuiz} 
              disabled={isUpdating}
              size="sm"
              className="gap-1.5"
            >
              {isUpdating ? (
                'Saving...'
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{quiz.title}"? This action cannot be undone and all student submissions will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuiz}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Quiz'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
