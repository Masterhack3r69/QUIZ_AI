'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface OTPVerificationProps {
  email: string;
  onVerified: (authData?: { token: string; user: any }) => void;
  onBack: () => void;
}

export function OTPVerification({ email, onVerified, onBack }: OTPVerificationProps) {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const { toast } = useToast();

  // Countdown timer for OTP expiration
  useEffect(() => {
    if (timeRemaining <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setCanResend(true);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0 || canResend) {
      return;
    }

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        const newCooldown = prev - 1;
        if (newCooldown <= 0) {
          setCanResend(true);
          return 0;
        }
        return newCooldown;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown, canResend]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP verification
  const handleVerifyOTP = useCallback(async (code: string) => {
    if (code.length !== 6 || isVerifying || isRateLimited) {
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
      }

      const data = await response.json();
      
      // Mark verification as successful to prevent re-submission
      setVerificationSuccessful(true);
      
      // Show success message
      toast({
        title: 'Email verified!',
        description: 'Your account has been verified successfully.',
      });
      
      // Call onVerified with the auth data (token and user)
      onVerified(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      
      // Handle specific error cases
      if (errorMessage.includes('Invalid verification code')) {
        setError('Invalid verification code. Please try again.');
        setOtp(''); // Clear input on invalid code
      } else if (errorMessage.includes('expired')) {
        setError('Verification code has expired. Please request a new code.');
        setCanResend(true); // Enable resend immediately
        setTimeRemaining(0);
        setOtp(''); // Clear input
      } else if (errorMessage.includes('Too many failed attempts')) {
        setError('Too many failed attempts. Please try again in 15 minutes.');
        setIsRateLimited(true); // Disable all inputs
        setOtp(''); // Clear input
      } else if (errorMessage.includes('already verified')) {
        // User is already verified, just redirect to login
        toast({
          title: 'Already verified',
          description: 'Your account is already verified. Please log in.',
        });
        onVerified();
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(errorMessage);
      }
      
      setIsVerifying(false);
    }
  }, [email, isVerifying, isRateLimited, onVerified, toast]);

  // Track if verification was successful to prevent re-submission
  const [verificationSuccessful, setVerificationSuccessful] = useState(false);

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (otp.length === 6 && !isVerifying && timeRemaining > 0 && !isRateLimited && !verificationSuccessful) {
      handleVerifyOTP(otp);
    }
  }, [otp, isVerifying, timeRemaining, isRateLimited, verificationSuccessful, handleVerifyOTP]);

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!canResend || isResending) {
      return;
    }

    setIsResending(true);
    setError(null);

    try {
      // TODO: Replace with actual API call when resendOTP is added to AuthContext
      // await resendOTP(email);
      
      // Temporary mock for development
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resend code');
      }

      // Reset state
      setOtp('');
      setTimeRemaining(600); // Reset to 10 minutes
      setResendCooldown(60); // Reset cooldown
      setCanResend(false);
      setIsRateLimited(false);

      toast({
        title: 'Code sent',
        description: `New code sent to ${email}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend code';
      setError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const isExpired = timeRemaining <= 0;
  const isInputDisabled = isVerifying || isExpired || isRateLimited || verificationSuccessful;

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Verify Your Email</h2>
        <p className="text-muted-foreground">
          We've sent a 6-digit code to
        </p>
        <p className="font-medium">{email}</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            disabled={isInputDisabled}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          {isVerifying && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying...</span>
            </div>
          )}
        </div>

        {/* Timer display */}
        <div className="text-center">
          {isExpired ? (
            <p className="text-sm text-destructive font-medium">Code expired</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Time remaining: <span className="font-medium">{formatTime(timeRemaining)}</span>
            </p>
          )}
        </div>

        {/* Success message */}
        {verificationSuccessful && (
          <div className="text-sm text-green-600 dark:text-green-400 text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-md flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verification successful! Redirecting...</span>
          </div>
        )}

        {/* Error message */}
        {error && !verificationSuccessful && (
          <div className="text-sm text-destructive text-center p-3 bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        {/* Resend button */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleResendOTP}
          disabled={!canResend || isResending}
        >
          {isResending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : canResend ? (
            'Resend Code'
          ) : (
            `Resend Code (${resendCooldown}s)`
          )}
        </Button>

        {/* Back button */}
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Change Email
        </Button>
      </div>
    </div>
  );
}
