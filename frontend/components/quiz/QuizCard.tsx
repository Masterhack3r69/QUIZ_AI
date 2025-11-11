'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Eye, Pencil, BarChart3, Trash2, Clock, Users, FileQuestion, Calendar, Copy } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/ui/shadcn-io/copy-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { apiClient } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import type { Quiz } from '@/types';

interface QuizCardProps {
  quiz: Quiz;
  submissionCount?: number;
  onDelete?: () => void;
}

export function QuizCard({ quiz, submissionCount = 0, onDelete }: QuizCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSuccess, showError } = useToast();

  // Determine quiz status based on dates and current status
  const status = getEnhancedQuizStatus(quiz);

  const handleCardClick = () => {
    router.push(`/dashboard/quiz/${quiz._id}`);
  };

  const handleManageClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    router.push(`/dashboard/quiz/${quiz._id}`);
  };

  const handleViewResults = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    router.push(`/dashboard/quiz/${quiz._id}/results`);
  };

  const handleEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    router.push(`/dashboard/quiz/${quiz._id}/edit`);
  };

  const handleDeleteClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await apiClient.deleteQuiz(quiz._id);
      showSuccess('Quiz deleted successfully');
      setShowDeleteDialog(false);
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      showError('Failed to delete quiz. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };



  return (
    <>
      <Card
        className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50"
        onClick={handleCardClick}
      >
        {/* Status Indicator Bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${getStatusColor(status)}`} />
        
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <StatusBadge status={status} />
            </div>
            
            {/* Quick Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Quick actions menu"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={handleManageClick}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Quiz
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleViewResults}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Results
                </DropdownMenuItem>
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={handleDeleteClick}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Quiz
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pb-4 space-y-4">
          {/* Quiz Title */}
          <div>
            <h3 className="text-xl font-bold mb-1 line-clamp-2 group-hover:text-primary transition-colors">
              {quiz.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              Created {new Date(quiz.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Access Code - Prominent Display */}
          <div className="relative p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">Access Code</p>
                <p className="text-2xl font-mono font-bold tracking-wider truncate" aria-label={`Access code: ${quiz.accessCode}`}>
                  {quiz.accessCode}
                </p>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <CopyButton
                  content={quiz.accessCode}
                  variant="ghost"
                  size="default"
                  onCopy={() => showSuccess('Access code copied to clipboard')}
                  className="hover:bg-primary/20"
                  aria-label="Copy access code"
                />
              </div>
            </div>
          </div>

          {/* Quiz Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
              <div className="p-1.5 rounded-md bg-background">
                <FileQuestion className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Questions</p>
                <p className="text-sm font-semibold">
                  {quiz.questions?.length || quiz.questionsPerStudent || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
              <div className="p-1.5 rounded-md bg-background">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-semibold">{quiz.duration} min</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
              <div className="p-1.5 rounded-md bg-background">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Submissions</p>
                <p className="text-sm font-semibold">{submissionCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
              <div className="p-1.5 rounded-md bg-background">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Expires</p>
                <p className="text-sm font-semibold truncate">
                  {new Date(quiz.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewResults}
            className="flex-1"
            aria-label="View results"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Results
          </Button>
          <Button
            size="sm"
            onClick={handleManageClick}
            className="flex-1"
            aria-label={`Manage quiz: ${quiz.title}`}
          >
            <Eye className="mr-2 h-4 w-4" />
            Manage
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{quiz.title}"? This action cannot be undone and all student submissions will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Helper component for status badge
function StatusBadge({ status }: { status: Quiz['status'] }) {
  const statusConfig = {
    scheduled: {
      label: 'Scheduled',
      variant: 'secondary' as const,
      className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    },
    active: {
      label: 'Active',
      variant: 'default' as const,
      className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    },
    full: {
      label: 'Full',
      variant: 'secondary' as const,
      className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
    },
    expired: {
      label: 'Expired',
      variant: 'outline' as const,
      className: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
    },
    draft: {
      label: 'Draft',
      variant: 'outline' as const,
      className: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    },
  };

  const config = statusConfig[status] || statusConfig.active;

  return (
    <Badge
      variant={config.variant}
      className={config.className}
      role="status"
      aria-label={`Quiz status: ${config.label}`}
    >
      {config.label}
    </Badge>
  );
}

// Helper function to get status color for top bar
function getStatusColor(status: Quiz['status']): string {
  const colors = {
    scheduled: 'bg-blue-500',
    active: 'bg-green-500',
    full: 'bg-orange-500',
    expired: 'bg-gray-400',
    draft: 'bg-purple-500',
  };
  return colors[status] || colors.active;
}

// Helper function to determine enhanced quiz status
function getEnhancedQuizStatus(quiz: Quiz): Quiz['status'] {
  const now = new Date();
  const expirationDate = new Date(quiz.expiresAt);
  const startDate = quiz.startDate ? new Date(quiz.startDate) : null;

  // Check if expired
  if (expirationDate < now) {
    return 'expired';
  }

  // Check if full
  if (quiz.maxStudents && quiz.submissionCount && quiz.submissionCount >= quiz.maxStudents) {
    return 'full';
  }

  // Check if scheduled (not started yet)
  if (startDate && startDate > now) {
    return 'scheduled';
  }

  // Check database status
  if (quiz.status === 'draft') {
    return 'draft';
  }

  // Default to active
  return 'active';
}
