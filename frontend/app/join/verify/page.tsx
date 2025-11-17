'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient, APIRequestError } from '@/lib/api';
import PublicLayout from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, UserCheck } from 'lucide-react';

interface StudentInfoRequirements {
  firstName: boolean
  middleName: boolean
  lastName: boolean
  suffix: boolean
  studentId: boolean
  course: boolean
  year: boolean
  section: boolean
  email: boolean
}

function VerifyStudentInfoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizCode = searchParams.get('code');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requirements, setRequirements] = useState<StudentInfoRequirements | null>(null);
  const [quizTitle, setQuizTitle] = useState<string>('');

  // Build dynamic schema based on requirements
  const buildSchema = (reqs: StudentInfoRequirements) => {
    const schemaFields: any = {};
    
    if (reqs.firstName) schemaFields.firstName = z.string().min(1, "First name is required");
    if (reqs.middleName) schemaFields.middleName = z.string().min(1, "Middle name is required");
    if (reqs.lastName) schemaFields.lastName = z.string().min(1, "Last name is required");
    if (reqs.suffix) schemaFields.suffix = z.string().min(1, "Suffix is required");
    if (reqs.studentId) schemaFields.studentId = z.string().min(1, "Student ID is required");
    if (reqs.course) schemaFields.course = z.string().min(1, "Course is required");
    if (reqs.year) schemaFields.year = z.string().min(1, "Year level is required");
    if (reqs.section) schemaFields.section = z.string().min(1, "Section is required");
    if (reqs.email) schemaFields.email = z.string().email("Invalid email address");
    
    return z.object(schemaFields);
  };

  const [schema, setSchema] = useState<any>(null);

  const form = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      studentId: '',
      course: '',
      year: '',
      section: '',
      email: '',
    },
  });

  useEffect(() => {
    if (!quizCode) {
      router.push('/join');
      return;
    }

    // Fetch quiz requirements
    const fetchRequirements = async () => {
      try {
        const quizInfo = await apiClient.validateQuizCode(quizCode);
        setQuizTitle(quizInfo.title);
        
        // Use quiz-specific requirements or default
        const reqs = quizInfo.studentInfoRequirements || {
          firstName: true,
          middleName: false,
          lastName: true,
          suffix: false,
          studentId: true,
          course: false,
          year: false,
          section: false,
          email: false,
        };
        
        setRequirements(reqs);
        setSchema(buildSchema(reqs));
      } catch (err) {
        console.error('Error fetching quiz requirements:', err);
        setError('Failed to load quiz information. Please try again.');
      }
    };

    fetchRequirements();
  }, [quizCode, router]);

  const onSubmit = async (data: any) => {
    if (!quizCode) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Store student info in sessionStorage
      sessionStorage.setItem('studentInfo', JSON.stringify(data));

      // Navigate to quiz lobby
      router.push(`/quiz/${quizCode}/start`);
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!requirements || !schema) {
    return (
      <PublicLayout>
        <main className="min-h-[calc(100vh-4rem)] py-12 px-4">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
                <p className="text-center mt-4 text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <main className="min-h-[calc(100vh-4rem)] py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-blue-100 p-4">
                  <UserCheck className="w-12 h-12 text-blue-600" />
                </div>
              </div>
              <div>
                <CardTitle className="text-3xl font-bold">Student Information</CardTitle>
                <CardDescription className="text-base mt-2">
                  {quizTitle && <span className="font-semibold">{quizTitle}</span>}
                  <br />
                  Please provide your information to continue
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

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {requirements.firstName && (
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      {...form.register('firstName')}
                      disabled={isLoading}
                      autoFocus
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.firstName.message as string}
                      </p>
                    )}
                  </div>
                )}

                {requirements.middleName && (
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input
                      id="middleName"
                      type="text"
                      placeholder="Enter your middle name"
                      {...form.register('middleName')}
                      disabled={isLoading}
                    />
                    {form.formState.errors.middleName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.middleName.message as string}
                      </p>
                    )}
                  </div>
                )}

                {requirements.lastName && (
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      {...form.register('lastName')}
                      disabled={isLoading}
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.lastName.message as string}
                      </p>
                    )}
                  </div>
                )}

                {requirements.suffix && (
                  <div className="space-y-2">
                    <Label htmlFor="suffix">Suffix</Label>
                    <Input
                      id="suffix"
                      type="text"
                      placeholder="Jr., Sr., III, etc."
                      {...form.register('suffix')}
                      disabled={isLoading}
                    />
                    {form.formState.errors.suffix && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.suffix.message as string}
                      </p>
                    )}
                  </div>
                )}

                {requirements.studentId && (
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      type="text"
                      placeholder="Enter your student ID"
                      {...form.register('studentId')}
                      disabled={isLoading}
                    />
                    {form.formState.errors.studentId && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.studentId.message as string}
                      </p>
                    )}
                  </div>
                )}

                {requirements.course && (
                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    <Input
                      id="course"
                      type="text"
                      placeholder="Enter your course"
                      {...form.register('course')}
                      disabled={isLoading}
                    />
                    {form.formState.errors.course && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.course.message as string}
                      </p>
                    )}
                  </div>
                )}

                {requirements.year && (
                  <div className="space-y-2">
                    <Label htmlFor="year">Year Level</Label>
                    <Input
                      id="year"
                      type="text"
                      placeholder="Enter your year level"
                      {...form.register('year')}
                      disabled={isLoading}
                    />
                    {form.formState.errors.year && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.year.message as string}
                      </p>
                    )}
                  </div>
                )}

                {requirements.section && (
                  <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Input
                      id="section"
                      type="text"
                      placeholder="Enter your section"
                      {...form.register('section')}
                      disabled={isLoading}
                    />
                    {form.formState.errors.section && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.section.message as string}
                      </p>
                    )}
                  </div>
                )}

                {requirements.email && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      {...form.register('email')}
                      disabled={isLoading}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.email.message as string}
                      </p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Continue to Quiz'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </PublicLayout>
  );
}

export default function VerifyStudentInfoPage() {
  return (
    <Suspense fallback={
      <PublicLayout>
        <main className="min-h-[calc(100vh-4rem)] py-12 px-4">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
                <p className="text-center mt-4 text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </PublicLayout>
    }>
      <VerifyStudentInfoContent />
    </Suspense>
  );
}
