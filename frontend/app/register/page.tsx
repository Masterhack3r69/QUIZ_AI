'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { registerSchema, type RegisterFormData } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Check } from 'lucide-react';
import { APIRequestError } from '@/lib/api';
import { ERROR_MESSAGES } from '@/lib/config';
import PublicLayout from '@/components/layout/PublicLayout';
import { toast } from 'sonner';
import { OTPVerification } from '@/components/auth/OTPVerification';
import { setAuthToken, setUser as setStoredUser } from '@/lib/auth';

// Registration state interface
interface RegistrationState {
  step: 'form' | 'otp-verification';
  email: string;
  name: string;
  otpSentAt: Date | null;
}

// Password strength calculator
function calculatePasswordStrength(password: string): {
  strength: number;
  label: string;
  color: string;
} {
  let strength = 0;
  
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 10;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
  
  let label = 'Weak';
  let color = 'bg-red-500';
  
  if (strength >= 75) {
    label = 'Strong';
    color = 'bg-green-500';
  } else if (strength >= 50) {
    label = 'Medium';
    color = 'bg-yellow-500';
  }
  
  return { strength, label, color };
}

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { register: registerUser } = useAuth();
  const router = useRouter();

  // Multi-step registration state
  const [registrationState, setRegistrationState] = useState<RegistrationState>({
    step: 'form',
    email: '',
    name: '',
    otpSentAt: null,
  });

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = form.watch('password');
  const passwordStrength = password ? calculatePasswordStrength(password) : null;

  const onSubmit = async (data: RegisterFormData) => {
    if (!acceptedTerms) {
      setErrorMessage('You must accept the terms of service to continue');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Call backend to create unverified user and send OTP
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const result = await response.json();

      // Transition to OTP verification step
      setRegistrationState({
        step: 'otp-verification',
        email: data.email,
        name: data.name,
        otpSentAt: new Date(),
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('exists')) {
          setErrorMessage(ERROR_MESSAGES.USER_EXISTS);
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage(ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle successful OTP verification
  const handleVerified = (authData?: { token: string; user: any }) => {
    if (authData && authData.token && authData.user) {
      // Validate token structure (basic JWT format check)
      const tokenParts = authData.token.split('.');
      if (tokenParts.length !== 3) {
        toast.error('Invalid authentication token received. Please try again.');
        router.push('/login');
        return;
      }

      // Validate user object has required fields
      if (!authData.user._id || !authData.user.email) {
        toast.error('Invalid user data received. Please try again.');
        router.push('/login');
        return;
      }

      // Store authentication data
      setAuthToken(authData.token);
      setStoredUser(authData.user);
      
      // Display success message
      toast.success('Account verified successfully! Redirecting to dashboard...');
      
      // Force a page reload to ensure AuthContext picks up the new auth state
      window.location.href = '/dashboard';
    } else {
      // Fallback: redirect to login if no auth data received
      toast.success('Account verified successfully! Please log in to continue.');
      router.push('/login');
    }
  };

  // Handle back navigation from OTP screen
  const handleBack = () => {
    // Return to registration form with pre-filled data
    setRegistrationState({
      step: 'form',
      email: registrationState.email,
      name: registrationState.name,
      otpSentAt: null,
    });

    // Pre-fill form fields with stored values
    form.setValue('name', registrationState.name);
    form.setValue('email', registrationState.email);

    // Clear error message and OTP-related state
    setErrorMessage(null);

    // Note: If the user modifies the email and resubmits, a new OTP will be generated
    // The backend will automatically invalidate any previous OTPs for the old email
    // when the new registration request is made
  };

  // Render OTP verification step
  if (registrationState.step === 'otp-verification') {
    return (
      <PublicLayout>
        <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-muted">
          <div className="w-full max-w-md">
            <Card>
              <CardContent className="pt-6">
                <OTPVerification
                  email={registrationState.email}
                  onVerified={handleVerified}
                  onBack={handleBack}
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </PublicLayout>
    );
  }

  // Render registration form
  return (
    <PublicLayout>
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-muted">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Create Teacher Account</h1>
            <p className="mt-2 text-muted-foreground">Sign up to start creating quizzes</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Get started</CardTitle>
              <CardDescription>Create your account to access the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {errorMessage && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="John Doe"
                            autoComplete="name"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="teacher@example.com"
                            autoComplete="email"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Create a strong password"
                            autoComplete="new-password"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        {passwordStrength && (
                          <div className="space-y-2 mt-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Password strength:</span>
                              <span className={`font-medium ${
                                passwordStrength.label === 'Strong' ? 'text-green-600 dark:text-green-400' :
                                passwordStrength.label === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-red-600 dark:text-red-400'
                              }`}>
                                {passwordStrength.label}
                              </span>
                            </div>
                            <Progress value={passwordStrength.strength} className="h-2" />
                          </div>
                        )}
                        <FormDescription>
                          Must be at least 8 characters with uppercase, lowercase, and number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Re-enter your password"
                            autoComplete="new-password"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the{' '}
                      <Link
                        href="/terms"
                        className="font-medium text-primary hover:underline"
                        target="_blank"
                      >
                        terms of service
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="/privacy"
                        className="font-medium text-primary hover:underline"
                        target="_blank"
                      >
                        privacy policy
                      </Link>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !acceptedTerms}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                >
                  Sign in
                </Link>
              </div>
              <div className="text-sm text-center">
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                >
                  ← Back to home
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </PublicLayout>
  );
}
