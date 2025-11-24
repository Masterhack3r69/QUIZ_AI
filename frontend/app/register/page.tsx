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
import { Card, CardContent } from '@/components/ui/card';
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
import { motion } from 'motion/react';

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
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-950">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
          
          {/* Left Column - Register Form */}
          <motion.div 
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative p-8 sm:p-12 flex flex-col justify-center order-2 md:order-1 bg-white dark:bg-gray-900 z-10"
          >
             <div className="md:hidden mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Sign up to get started</p>
            </div>

            <div className="w-full">
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
                            className="h-12 rounded-xl"
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
                            className="h-12 rounded-xl"
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
                            className="h-12 rounded-xl"
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
                            className="h-12 rounded-xl"
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
                    className="w-full h-12 text-lg font-semibold rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0"
                    disabled={isLoading || !acceptedTerms}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </Form>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-4 text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:underline transition-all"
                  >
                    Sign in
                  </Link>
                </div>
                <Link
                  href="/"
                  className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  ← Back to home
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Welcome/Branding */}
          <motion.div 
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden md:flex flex-col justify-center p-12 bg-purple-600 text-white overflow-hidden order-1 md:order-2 z-20"
          >
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft" style={{ animationDelay: '2s' }} />
            
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6 tracking-tight">Join the Community</h2>
              <p className="text-lg text-purple-100 mb-8 leading-relaxed">
                Start creating engaging quizzes in minutes. Join thousands of educators transforming their classrooms with AI.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Free to Start</h3>
                    <p className="text-sm text-purple-100">No credit card required</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Unlimited Quizzes</h3>
                    <p className="text-sm text-purple-100">Create as many as you need</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </PublicLayout>
  );
}
