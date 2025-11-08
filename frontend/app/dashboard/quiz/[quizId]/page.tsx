'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Copy, BarChart3, Settings, Trash2, ArrowLeft, CheckCircle2, Users, Clock, Calendar, TrendingUp } from 'lucide-react';
import { apiClient, APIRequestError } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import type { Quiz } from '@/types';

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
      const data = await apiClient.getQuiz(quizId);
      setQuiz(data);
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

  const handleCopyAccessCode = async () => {
    if (!quiz) return;
    
    try {
      await navigator.clipboard.writeText(quiz.accessCode);
      showSuccess('Quiz code copied to clipboard!');
    } catch (err) {
      showError('Failed to copy quiz code');
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

  // Calculate average score (placeholder - would come from API)
  const getAverageScore = (): string => {
    // This would typically come from the quiz data or a separate API call
    return 'N/A';
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
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/dashboard')}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
          <p className="mt-2 text-muted-foreground">
            Manage quiz settings and view performance
          </p>
        </div>
        <Badge variant={status.variant} className="w-fit">
          {status.label}
        </Badge>
      </div>

      {/* Quiz Code Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Access Code</CardTitle>
          <CardDescription>
            Share this code with students to access the quiz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted px-6 py-4 rounded-lg">
              <p className="text-4xl font-mono font-bold text-center tracking-widest">
                {quiz.accessCode}
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleCopyAccessCode}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="text-lg font-medium">{quiz.duration} minutes</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Questions per Student</p>
              <p className="text-lg font-medium">{quiz.questionsPerStudent} questions</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Questions in Pool</p>
              <p className="text-lg font-medium">{quiz.questions?.length || 0} questions</p>
            </div>

            {quiz.startDate && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="text-lg font-medium">
                  {new Date(quiz.startDate).toLocaleString()}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Expiration Date</p>
              <p className="text-lg font-medium">
                {new Date(quiz.expiresAt).toLocaleString()}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-lg font-medium">
                {new Date(quiz.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {quiz.subjects && quiz.subjects.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="space-y-3">
                <p className="text-sm font-medium">Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {quiz.subjects.map((subject, index) => (
                    <Badge key={index} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {quiz.questionDistribution && (
            <>
              <Separator className="my-6" />
              <div className="space-y-3">
                <p className="text-sm font-medium">Question Distribution</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quiz.questionDistribution.multipleChoice > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Multiple Choice</p>
                      <p className="text-2xl font-bold">{quiz.questionDistribution.multipleChoice}</p>
                    </div>
                  )}
                  {quiz.questionDistribution.trueFalse > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">True/False</p>
                      <p className="text-2xl font-bold">{quiz.questionDistribution.trueFalse}</p>
                    </div>
                  )}
                  {quiz.questionDistribution.fillInBlank > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Fill in Blank</p>
                      <p className="text-2xl font-bold">{quiz.questionDistribution.fillInBlank}</p>
                    </div>
                  )}
                  {quiz.questionDistribution.matching > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Matching</p>
                      <p className="text-2xl font-bold">{quiz.questionDistribution.matching}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quiz.submissionCount || 0}</div>
            {quiz.maxStudents && (
              <p className="text-xs text-muted-foreground">
                of {quiz.maxStudents} max students
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageScore()}</div>
            <p className="text-xs text-muted-foreground">
              View detailed analytics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quiz.maxStudents ? `${Math.round(getCompletionRate(quiz))}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {quiz.maxStudents ? 'Based on student limit' : 'No limit set'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <Button
          size="lg"
          onClick={handleViewResults}
          className="w-full gap-2 min-h-[48px] touch-manipulation"
        >
          <BarChart3 className="h-4 w-4" />
          View Results
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={handleEditSettings}
          className="w-full gap-2 min-h-[48px] touch-manipulation"
        >
          <Settings className="h-4 w-4" />
          Edit Settings
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => router.push(`/dashboard/quiz/${quizId}/edit`)}
          className="w-full gap-2 min-h-[48px] touch-manipulation"
        >
          <Settings className="h-4 w-4" />
          Edit Questions
        </Button>

        <Button
          variant="destructive"
          size="lg"
          onClick={() => setShowDeleteDialog(true)}
          className="w-full gap-2 min-h-[48px] touch-manipulation"
        >
          <Trash2 className="h-4 w-4" />
          Delete Quiz
        </Button>
      </div>

      {/* Edit Settings Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Quiz Settings</DialogTitle>
            <DialogDescription>
              Update quiz configuration. The access code and questions will remain unchanged.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">Quiz Title *</Label>
              <Input
                id="title"
                value={editFormData.title}
                onChange={(e) => handleEditFormChange('title', e.target.value)}
                disabled={isUpdating}
                placeholder="Enter quiz title"
                className="min-h-[44px]"
              />
              {editFormErrors.title && (
                <p className="text-sm text-destructive">{editFormErrors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-medium">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                value={editFormData.duration.toString()}
                onChange={(e) => handleEditFormChange('duration', parseInt(e.target.value) || 0)}
                disabled={isUpdating}
                min="1"
                max="300"
                placeholder="e.g., 30"
                className="min-h-[44px]"
              />
              {editFormErrors.duration && (
                <p className="text-sm text-destructive">{editFormErrors.duration}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium">Start Date & Time (Optional)</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={editFormData.startDate}
                onChange={(e) => handleEditFormChange('startDate', e.target.value)}
                disabled={isUpdating}
                className="min-h-[44px]"
              />
              {editFormErrors.startDate && (
                <p className="text-sm text-destructive">{editFormErrors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt" className="text-sm font-medium">Expiration Date & Time *</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={editFormData.expiresAt}
                onChange={(e) => handleEditFormChange('expiresAt', e.target.value)}
                disabled={isUpdating}
                className="min-h-[44px]"
              />
              {editFormErrors.expiresAt && (
                <p className="text-sm text-destructive">{editFormErrors.expiresAt}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStudents" className="text-sm font-medium">Maximum Students (Optional)</Label>
              <Input
                id="maxStudents"
                type="number"
                value={editFormData.maxStudents}
                onChange={(e) => handleEditFormChange('maxStudents', e.target.value)}
                disabled={isUpdating}
                min="1"
                max="10000"
                placeholder="Leave empty for unlimited"
                className="min-h-[44px]"
              />
              {editFormErrors.maxStudents && (
                <p className="text-sm text-destructive">{editFormErrors.maxStudents}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subjects" className="text-sm font-medium">Subjects (Optional)</Label>
              <Input
                id="subjects"
                value={editFormData.subjects}
                onChange={(e) => handleEditFormChange('subjects', e.target.value)}
                disabled={isUpdating}
                placeholder="e.g., Math, Science, History (comma-separated)"
                className="min-h-[44px]"
              />
              {editFormErrors.subjects && (
                <p className="text-sm text-destructive">{editFormErrors.subjects}</p>
              )}
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isUpdating}
              className="w-full sm:w-auto min-h-[44px]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateQuiz} 
              disabled={isUpdating}
              className="w-full sm:w-auto min-h-[44px]"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
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
