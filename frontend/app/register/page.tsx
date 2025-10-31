'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { APIRequestError } from '@/lib/api';
import { ERROR_MESSAGES } from '@/lib/config';
import PublicLayout from '@/components/layout/PublicLayout';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { showError } = useToast();
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    // Validate name
    if (!name) {
      newErrors.name = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (name.length > 100) {
      newErrors.name = 'Name must not exceed 100 characters';
    }

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

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: 'name' | 'email' | 'password' | 'confirmPassword', value: string) => {
    // Update the field value
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
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
      await register(name, email, password);
      // Navigation is handled by the register function
    } catch (error) {
      if (error instanceof APIRequestError) {
        if (error.status === 409 || error.message.includes('exists')) {
          showError(ERROR_MESSAGES.USER_EXISTS);
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
    <PublicLayout>
      <main id="main-content" className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Teacher Account</h1>
          <p className="mt-2 text-gray-600">Sign up to start creating quizzes</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Registration form">
            <Input
              type="text"
              label="Full Name"
              value={name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              error={errors.name}
              placeholder="John Doe"
              required
              autoComplete="name"
              disabled={isLoading}
              showValidIndicator={true}
            />

            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
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
              onChange={(e) => handleFieldChange('password', e.target.value)}
              error={errors.password}
              placeholder="At least 6 characters"
              required
              autoComplete="new-password"
              disabled={isLoading}
              helperText="Password must be at least 6 characters"
              showValidIndicator={true}
            />

            <Input
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
              disabled={isLoading}
              showValidIndicator={true}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
              aria-label={isLoading ? "Creating account..." : "Create your teacher account"}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                Sign in
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
      </main>
    </PublicLayout>
  );
}
