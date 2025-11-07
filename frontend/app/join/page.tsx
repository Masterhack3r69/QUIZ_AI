'use client';

import PublicLayout from '@/components/layout/PublicLayout';
import { Button, Icon } from '@/components/ui';
import { Input } from '@/components/ui';
import { Toast } from '@/components/ui/Toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, APIRequestError } from '@/lib/api';
import type { QuizInfo, StudentInfo } from '@/types';

export default function JoinPage() {
  const router = useRouter();
  const [step, setStep] = useState<'code' | 'info'>('code');
  const [accessCode, setAccessCode] = useState('');
  const [quizInfo, setQuizInfo] = useState<QuizInfo | null>(null);
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);

  const validateCode = () => {
    const newErrors: Record<string, string> = {};

    if (!accessCode.trim()) {
      newErrors.accessCode = 'Quiz access code is required';
    } else if (accessCode.length !== 6) {
      newErrors.accessCode = 'Access code must be 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStudentInfo = () => {
    const newErrors: Record<string, string> = {};
    const requirements = quizInfo?.studentInfoRequirements;

    if (!requirements) return true;

    if (requirements.firstName && !studentInfo.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (requirements.middleName && !studentInfo.middleName?.trim()) {
      newErrors.middleName = 'Middle name is required';
    }

    if (requirements.lastName && !studentInfo.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (requirements.studentId && !studentInfo.studentId?.trim()) {
      newErrors.studentId = 'Student ID is required';
    }

    if (requirements.course && !studentInfo.course?.trim()) {
      newErrors.course = 'Course is required';
    }

    if (requirements.year && !studentInfo.year?.trim()) {
      newErrors.year = 'Year is required';
    }

    if (requirements.section && !studentInfo.section?.trim()) {
      newErrors.section = 'Section is required';
    }

    if (requirements.email && !studentInfo.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (requirements.email && studentInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentInfo.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCode()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const code = accessCode.toUpperCase();
      
      // Call API to validate quiz code
      const info = await apiClient.validateQuizCode(code);
      setQuizInfo(info);
      
      // Move to student info step
      setStep('info');
      setToast({ type: 'success', message: 'Quiz found! Please enter your information.' });
    } catch (error) {
      console.error('Error validating quiz code:', error);
      
      if (error instanceof APIRequestError) {
        if (error.status === 404) {
          setErrors({ accessCode: 'Invalid quiz code. Please check and try again.' });
          setToast({ type: 'error', message: 'Invalid quiz code' });
        } else if (error.status === 400) {
          const errorMsg = error.message.toLowerCase();
          
          if (errorMsg.includes('not started') || errorMsg.includes('has not started yet')) {
            setErrors({ accessCode: error.message });
            setToast({ type: 'warning', message: 'Quiz has not started yet' });
          } else if (errorMsg.includes('expired') || errorMsg.includes('no longer available')) {
            setErrors({ accessCode: error.message });
            setToast({ type: 'error', message: 'Quiz has expired' });
          } else if (errorMsg.includes('maximum') || errorMsg.includes('full') || errorMsg.includes('reached')) {
            setErrors({ accessCode: error.message });
            setToast({ type: 'warning', message: 'Quiz is full' });
          } else {
            setErrors({ accessCode: error.message });
            setToast({ type: 'error', message: error.message });
          }
        } else {
          setErrors({ accessCode: 'Unable to validate quiz code. Please try again.' });
          setToast({ type: 'error', message: 'Server error. Please try again later.' });
        }
      } else {
        setErrors({ accessCode: 'Network error. Please check your connection.' });
        setToast({ type: 'error', message: 'Network error. Please check your connection.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStudentInfo()) {
      return;
    }

    // Store student info in sessionStorage
    sessionStorage.setItem('studentInfo', JSON.stringify(studentInfo));

    // Navigate to quiz lobby
    router.push(`/quiz/${accessCode.toUpperCase()}/start`);
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'accessCode') {
      setAccessCode(value);
    } else {
      setStudentInfo(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBack = () => {
    setStep('code');
    setErrors({});
  };

  return (
    <PublicLayout>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      
      <main id="main-content" className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Icon name="graduation-cap" className="w-16 h-16 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Join Quiz
              </h1>
              <p className="text-gray-600">
                Enter your information and quiz code to get started
              </p>
            </div>

            {step === 'code' ? (
              <form onSubmit={handleCodeSubmit} className="space-y-6" aria-label="Enter quiz code">
                <Input
                  type="text"
                  label="Quiz Access Code"
                  value={accessCode}
                  onChange={(e) => handleChange('accessCode', e.target.value.toUpperCase())}
                  error={errors.accessCode}
                  required
                  placeholder="Enter 6-character code"
                  maxLength={6}
                  disabled={isLoading}
                  showValidIndicator={true}
                  autoFocus
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  disabled={isLoading}
                  className="w-full"
                  aria-label={isLoading ? "Validating code..." : "Continue to student information"}
                >
                  {isLoading ? 'Validating...' : 'Continue'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleInfoSubmit} className="space-y-6" aria-label="Enter student information">
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Quiz:</span> {quizInfo?.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Please provide your information to continue
                  </p>
                </div>

                {quizInfo?.studentInfoRequirements?.firstName && (
                  <Input
                    type="text"
                    label="First Name"
                    value={studentInfo.firstName || ''}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    error={errors.firstName}
                    required
                    placeholder="Enter your first name"
                    disabled={isLoading}
                    showValidIndicator={true}
                  />
                )}

                {quizInfo?.studentInfoRequirements?.middleName && (
                  <Input
                    type="text"
                    label="Middle Name"
                    value={studentInfo.middleName || ''}
                    onChange={(e) => handleChange('middleName', e.target.value)}
                    error={errors.middleName}
                    required
                    placeholder="Enter your middle name"
                    disabled={isLoading}
                    showValidIndicator={true}
                  />
                )}

                {quizInfo?.studentInfoRequirements?.lastName && (
                  <Input
                    type="text"
                    label="Last Name"
                    value={studentInfo.lastName || ''}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    error={errors.lastName}
                    required
                    placeholder="Enter your last name"
                    disabled={isLoading}
                    showValidIndicator={true}
                  />
                )}

                {quizInfo?.studentInfoRequirements?.suffix && (
                  <Input
                    type="text"
                    label="Suffix"
                    value={studentInfo.suffix || ''}
                    onChange={(e) => handleChange('suffix', e.target.value)}
                    error={errors.suffix}
                    required
                    placeholder="Jr., Sr., III, etc."
                    disabled={isLoading}
                    showValidIndicator={true}
                  />
                )}

                {quizInfo?.studentInfoRequirements?.studentId && (
                  <Input
                    type="text"
                    label="Student ID"
                    value={studentInfo.studentId || ''}
                    onChange={(e) => handleChange('studentId', e.target.value)}
                    error={errors.studentId}
                    required
                    placeholder="Enter your student ID"
                    disabled={isLoading}
                    showValidIndicator={true}
                  />
                )}

                {quizInfo?.studentInfoRequirements?.course && (
                  <Input
                    type="text"
                    label="Course"
                    value={studentInfo.course || ''}
                    onChange={(e) => handleChange('course', e.target.value)}
                    error={errors.course}
                    required
                    placeholder="e.g., Computer Science"
                    disabled={isLoading}
                    showValidIndicator={true}
                  />
                )}

                {quizInfo?.studentInfoRequirements?.year && (
                  <Input
                    type="text"
                    label="Year Level"
                    value={studentInfo.year || ''}
                    onChange={(e) => handleChange('year', e.target.value)}
                    error={errors.year}
                    required
                    placeholder="e.g., 1st Year, 2nd Year"
                    disabled={isLoading}
                    showValidIndicator={true}
                  />
                )}

                {quizInfo?.studentInfoRequirements?.section && (
                  <Input
                    type="text"
                    label="Section"
                    value={studentInfo.section || ''}
                    onChange={(e) => handleChange('section', e.target.value)}
                    error={errors.section}
                    required
                    placeholder="Enter your section"
                    disabled={isLoading}
                    showValidIndicator={true}
                  />
                )}

                {quizInfo?.studentInfoRequirements?.email && (
                  <Input
                    type="email"
                    label="Email"
                    value={studentInfo.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    error={errors.email}
                    required
                    placeholder="your.email@example.com"
                    disabled={isLoading}
                    showValidIndicator={true}
                  />
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isLoading}
                    disabled={isLoading}
                    className="flex-1"
                    aria-label="Proceed to quiz"
                  >
                    Join Quiz
                  </Button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have a quiz code?{' '}
                <span className="text-blue-600">
                  Ask your teacher for the access code
                </span>
              </p>
            </div>
          </div>

          {/* Info Section */}
          <section className="mt-8 bg-blue-50 rounded-lg p-6" aria-labelledby="quiz-instructions">
            <h2 id="quiz-instructions" className="font-semibold text-gray-900 mb-3">
              Before you start:
            </h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2" aria-hidden="true">•</span>
                Make sure you have a stable internet connection
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2" aria-hidden="true">•</span>
                The quiz will have a countdown timer
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2" aria-hidden="true">•</span>
                Your quiz will auto-submit when time expires
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2" aria-hidden="true">•</span>
                You cannot pause or restart once you begin
              </li>
            </ul>
          </section>
        </div>
      </main>
    </PublicLayout>
  );
}
