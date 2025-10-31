'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { APIRequestError } from '@/lib/api';
import { ERROR_MESSAGES } from '@/lib/config';
import PublicLayout from '@/components/layout/PublicLayout';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { showError, showWarning } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if redirected due to session expiration
  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      showWarning(ERROR_MESSAGES.SESSION_EXPIRED);
    }
  }, [searchParams, showWarning]);

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    // Validate email
    if (!email) {
      newErrors.email = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }

    // Validate password
    if (!password) {
      newErrors.password = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (password.length < 6) {
      newErrors.password = ERROR_MESSAGES.INVALID_PASSWORD;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    // Clear error when user starts typing
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    // Clear error when user starts typing
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation is handled by the login function
    } catch (error) {
      if (error instanceof APIRequestError) {
        if (error.status === 401) {
          showError(ERROR_MESSAGES.INVALID_CREDENTIALS);
        } else {
          showError(error.message);
        }
      } else {
        showError(ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Teacher Login</h1>
          <p className="mt-2 text-gray-600">Sign in to your teacher account</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Login form">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={handleEmailChange}
              error={errors.email}
              placeholder="teacher@example.com"
              required
              autoComplete="email"
              disabled={isLoading}
              showValidIndicator={true}
            />

            <Input
              type="password"
              label="Password"
              value={password}
              onChange={handlePasswordChange}
              error={errors.password}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={isLoading}
              showValidIndicator={true}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
              aria-label={isLoading ? "Signing in..." : "Sign in to your account"}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="Back to home page"
            >
              ← Back to home
            </Link>
          </div>
        </Card>
      </div>
  );
}

export default function LoginPage() {
  return (
    <PublicLayout>
      <main id="main-content" className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 py-12">
        <Suspense fallback={
          <div className="w-full max-w-md">
            <div className="text-center" role="status" aria-live="polite">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" aria-label="Loading"></div>
              <span className="sr-only">Loading login form...</span>
            </div>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </main>
    </PublicLayout>
  );
}
