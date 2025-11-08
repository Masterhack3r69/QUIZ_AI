'use client';

import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export interface ErrorAlertProps {
  title?: string;
  message: string;
  variant?: 'default' | 'destructive';
  onRetry?: () => void;
  retryLabel?: string;
  showIcon?: boolean;
  className?: string;
}

export function ErrorAlert({
  title = 'Error',
  message,
  variant = 'destructive',
  onRetry,
  retryLabel = 'Try Again',
  showIcon = true,
  className,
}: ErrorAlertProps) {
  // Determine if this is a network error
  const isNetworkError = message.toLowerCase().includes('network') || 
                        message.toLowerCase().includes('connection') ||
                        message.toLowerCase().includes('offline');

  const Icon = isNetworkError ? WifiOff : AlertCircle;

  return (
    <Alert variant={variant} className={className}>
      {showIcon && <Icon className="h-4 w-4" />}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <span>{message}</span>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="w-fit"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {retryLabel}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Network Error Dialog Component
export interface NetworkErrorDialogProps {
  open: boolean;
  onRetry: () => void;
  onCancel?: () => void;
  message?: string;
}

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

export function NetworkErrorDialog({
  open,
  onRetry,
  onCancel,
  message = 'Unable to connect to the server. Please check your internet connection and try again.',
}: NetworkErrorDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-destructive/10 p-2">
              <WifiOff className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle>Connection Lost</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {onCancel && (
            <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          )}
          <AlertDialogAction onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
