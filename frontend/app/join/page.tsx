'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { joinQuizSchema, type JoinQuizFormData } from '@/lib/validations';
import { apiClient, APIRequestError } from '@/lib/api';
import PublicLayout from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, GraduationCap } from 'lucide-react';

export default function JoinPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<JoinQuizFormData>({
    resolver: zodResolver(joinQuizSchema),
    defaultValues: {
      quizCode: '',
      studentName: '',
      studentId: '',
      school: '',
    },
  });

  const onSubmit = async (data: JoinQuizFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const code = data.quizCode.toUpperCase();
      
      // Validate quiz code with API
      await apiClient.validateQuizCode(code);
      
      // Store student info in sessionStorage
      sessionStorage.setItem('studentInfo', JSON.stringify({
        firstName: data.studentName.split(' ')[0],
        lastName: data.studentName.split(' ').slice(1).join(' ') || data.studentName,
        studentId: data.studentId,
        school: data.school,
      }));

      // Navigate to quiz lobby
      router.push(`/quiz/${code}/start`);
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
      <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-blue-100 p-4">
                  <GraduationCap className="w-12 h-12 text-blue-600" />
                </div>
              </div>
              <div>
                <CardTitle className="text-3xl font-bold">Join Quiz</CardTitle>
                <CardDescription className="text-base mt-2">
                  Enter your quiz code and information to get started
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="quizCode" className="text-base font-semibold">
                    Quiz Code
                  </Label>
                  <Input
                    id="quizCode"
                    type="text"
                    placeholder="ABC123"
                    maxLength={6}
                    className="text-2xl font-bold text-center uppercase tracking-widest h-14"
                    {...form.register('quizCode')}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      form.setValue('quizCode', value);
                    }}
                    disabled={isLoading}
                    autoFocus
                  />
                  {form.formState.errors.quizCode && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.quizCode.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentName" className="text-base">
                    Your Name
                  </Label>
                  <Input
                    id="studentName"
                    type="text"
                    placeholder="Enter your full name"
                    {...form.register('studentName')}
                    disabled={isLoading}
                  />
                  {form.formState.errors.studentName && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.studentName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId" className="text-base">
                    Student ID <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    id="studentId"
                    type="text"
                    placeholder="Enter your student ID"
                    {...form.register('studentId')}
                    disabled={isLoading}
                  />
                  {form.formState.errors.studentId && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.studentId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school" className="text-base">
                    School
                  </Label>
                  <Input
                    id="school"
                    type="text"
                    placeholder="Enter your school name"
                    {...form.register('school')}
                    disabled={isLoading}
                  />
                  {form.formState.errors.school && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.school.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Validating...' : 'Join Quiz'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have a quiz code?{' '}
                  <span className="text-blue-600 font-medium">
                    Ask your teacher for the access code
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Info Section */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Before you start:</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Make sure you have a stable internet connection
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  The quiz will have a countdown timer
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Your quiz will auto-submit when time expires
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  You cannot pause or restart once you begin
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </PublicLayout>
  );
}
