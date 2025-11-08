'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Eye, Pencil, BarChart3, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <StatusBadge status={status} />
            
            {/* Quick Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon-sm"
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

        <CardContent className="pb-4">
          {/* Quiz Title */}
          <h3 className="text-lg font-semibold mb-3 line-clamp-2">
            {quiz.title}
          </h3>

          {/* Access Code */}
          <div className="mb-4 p-3 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground mb-1">Access Code</p>
            <p className="text-lg font-mono font-bold" aria-label={`Access code: ${quiz.accessCode}`}>
              {quiz.accessCode}
            </p>
          </div>

          {/* Quiz Info */}
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Questions:</dt>
              <dd className="font-medium">
                {quiz.questions?.length || quiz.questionsPerStudent || 0}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Duration:</dt>
              <dd className="font-medium">
                {quiz.duration} min
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Submissions:</dt>
              <dd className="font-medium">
                {submissionCount}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Expires:</dt>
              <dd className="font-medium">
                {new Date(quiz.expiresAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </CardContent>

        <CardFooter className="pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManageClick}
            className="w-full"
            aria-label={`Manage quiz: ${quiz.title}`}
          >
            Manage Quiz
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
    },
    active: {
      label: 'Active',
      variant: 'default' as const,
    },
    full: {
      label: 'Full',
      variant: 'secondary' as const,
    },
    expired: {
      label: 'Expired',
      variant: 'outline' as const,
    },
    draft: {
      label: 'Draft',
      variant: 'outline' as const,
    },
  };

  const config = statusConfig[status] || statusConfig.active;

  return (
    <Badge
      variant={config.variant}
      role="status"
      aria-label={`Quiz status: ${config.label}`}
    >
      {config.label}
    </Badge>
  );
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
