'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowRight, Mail, Lock, Sparkles, Users } from 'lucide-react';
import { APIRequestError } from '@/lib/api';
import { ERROR_MESSAGES } from '@/lib/config';
import PublicLayout from '@/components/layout/PublicLayout';
import { toast } from 'sonner';
import { motion } from 'motion/react';

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      toast.warning(ERROR_MESSAGES.SESSION_EXPIRED);
    }
  }, [searchParams]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    setUnverifiedEmail(null);

    try {
      await login(data.email, data.password);
    } catch (error) {
      if (error instanceof APIRequestError) {
        if (error.status === 401) {
          setErrorMessage(ERROR_MESSAGES.INVALID_CREDENTIALS);
        } else if (error.status === 403) {
          setUnverifiedEmail(data.email);
          setErrorMessage('Your email is not verified.');
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

  const handleResendVerification = () => {
    if (unverifiedEmail) {
      router.push(`/register?email=${encodeURIComponent(unverifiedEmail)}&resend=true`);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10">
      {/* <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          Welcome Back
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Log in to access your dashboard
        </p>
      </div> */}

      <Card className="border-0">
        <CardContent className="pt-8 pb-8 px-6 sm:px-8">
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800 dark:bg-red-900/20 dark:border-red-900 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>
                  {errorMessage}
                  {unverifiedEmail && (
                    <div className="mt-2">
                      <Button
                        variant="link"
                        className="p-0 h-auto font-semibold text-red-800 dark:text-red-300 underline"
                        onClick={handleResendVerification}
                      >
                        Resend verification code
                      </Button>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          disabled={isLoading}
                          className="pl-12 h-14 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white dark:bg-gray-950 dark:border-gray-700 shadow-sm group-hover:border-blue-300 dark:group-hover:border-blue-800"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="ml-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Password</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          disabled={isLoading}
                          className="pl-12 h-14 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white dark:bg-gray-950 dark:border-gray-700 shadow-sm group-hover:border-blue-300 dark:group-hover:border-blue-800"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="ml-1" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Log In <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-4 text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-all"
              >
                Sign up for free
              </Link>
            </div>
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <PublicLayout>
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-950">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
          
          {/* Left Column - Welcome/Branding */}
          <motion.div 
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden md:flex flex-col justify-center p-12 bg-blue-600 text-white overflow-hidden z-20"
          >
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft" style={{ animationDelay: '2s' }} />
            
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6 tracking-tight">Welcome Back!</h2>
              <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                We're glad to see you again. Sign in to continue managing your quizzes and tracking student progress.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI-Powered</h3>
                    <p className="text-sm text-blue-100">Generate quizzes in seconds</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Student Insights</h3>
                    <p className="text-sm text-blue-100">Track performance in real-time</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Login Form */}
          <motion.div 
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative p-8 sm:p-12 flex flex-col justify-center bg-white dark:bg-gray-900 z-10"
          >
            <div className="md:hidden mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to your account</p>
            </div>

            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            }>
              <LoginForm />
            </Suspense>
          </motion.div>
        </div>
      </main>
    </PublicLayout>
  );
}
