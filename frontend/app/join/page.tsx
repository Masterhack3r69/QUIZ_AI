'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient, APIRequestError } from '@/lib/api';
import PublicLayout from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

const quizCodeSchema = z.object({
  quizCode: z
    .string()
    .length(6, "Quiz code must be 6 characters")
    .regex(/^[A-Z0-9]+$/, "Quiz code must contain only uppercase letters and numbers")
    .transform((val) => val.toUpperCase()),
});

type QuizCodeFormData = z.infer<typeof quizCodeSchema>;

export default function JoinPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<QuizCodeFormData>({
    resolver: zodResolver(quizCodeSchema),
    defaultValues: {
      quizCode: '',
    },
  });

  const onSubmit = async (data: QuizCodeFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const code = data.quizCode.toUpperCase();
      
      // Validate quiz code with API
      await apiClient.validateQuizCode(code);

      // Navigate to student info verification page
      router.push(`/join/verify?code=${code}`);
    } catch (err) {
      console.error('Error validating quiz code:', err);
      
      if (err instanceof APIRequestError) {
        if (err.status === 404) {
          setError('Invalid quiz code. Please check and try again.');
        } else if (err.status === 400) {
          const errorMsg = err.message.toLowerCase();
          
          if (errorMsg.includes('not started') || errorMsg.includes('has not started yet')) {
            setError('This quiz has not started yet. Please try again later.');
          } else if (errorMsg.includes('expired') || errorMsg.includes('no longer available')) {
            setError('This quiz has expired and is no longer available.');
          } else if (errorMsg.includes('maximum') || errorMsg.includes('full') || errorMsg.includes('reached')) {
            setError('This quiz has reached its maximum number of participants.');
          } else {
            setError(err.message);
          }
        } else {
          setError('Unable to validate quiz code. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout>
      <main className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-soft hidden md:block"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-soft hidden md:block" style={{ animationDelay: '1s' }}></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
              Ready to Quiz?
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Enter your code to join the session
            </p>
          </div>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 ring-1 ring-gray-200 dark:ring-gray-800">
            <CardContent className="pt-8 pb-8 px-6 sm:px-8">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800 dark:bg-red-900/20 dark:border-red-900 dark:text-red-300">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Oops!</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="quizCode" className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">
                    Quiz Access Code
                  </Label>
                  <div className="relative group">
                    <Input
                      id="quizCode"
                      type="text"
                      placeholder="ABC123"
                      maxLength={6}
                      className="text-3xl font-bold text-center uppercase tracking-[0.2em] h-16 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white dark:bg-gray-950 dark:border-gray-700 placeholder:text-gray-300 dark:placeholder:text-gray-700 shadow-sm group-hover:border-blue-300 dark:group-hover:border-blue-800"
                      {...form.register('quizCode')}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        form.setValue('quizCode', value);
                      }}
                      disabled={isLoading}
                      autoFocus
                      autoComplete="off"
                    />
                  </div>
                  {form.formState.errors.quizCode && (
                    <p className="text-sm text-red-500 font-medium flex items-center gap-1 ml-1 animate-fade-in">
                      <AlertCircle className="w-3 h-3" />
                      {form.formState.errors.quizCode.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Checking Code...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Join Session <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Ask your teacher for the code</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </PublicLayout>
  );
}
