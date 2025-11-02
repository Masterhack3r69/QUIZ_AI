'use client';

import PublicLayout from '@/components/layout/PublicLayout';
import { Button, Icon } from '@/components/ui';
import { Input } from '@/components/ui';
import { Toast } from '@/components/ui/Toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, APIRequestError } from '@/lib/api';

export default function JoinPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    accessCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    }

    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    }

    if (!formData.accessCode.trim()) {
      newErrors.accessCode = 'Quiz access code is required';
    } else if (formData.accessCode.length !== 6) {
      newErrors.accessCode = 'Access code must be 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const code = formData.accessCode.toUpperCase();
      
      // Call API to validate quiz code
      const quizInfo = await apiClient.validateQuizCode(code);
      
      // Store student info in sessionStorage
      sessionStorage.setItem('studentInfo', JSON.stringify({
        name: formData.studentName,
        studentId: formData.studentId,
      }));

      // Navigate to quiz lobby
      router.push(`/quiz/${code}/start`);
    } catch (error) {
      console.error('Error joining quiz:', error);
      
      if (error instanceof APIRequestError) {
        // Handle specific error messages from the API
        if (error.status === 404) {
          setErrors({ accessCode: 'Invalid quiz code. Please check and try again.' });
          setToast({ type: 'error', message: 'Invalid quiz code' });
        } else if (error.status === 400) {
          // Parse the error message to determine the specific issue
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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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

            <form onSubmit={handleSubmit} className="space-y-6" aria-label="Join quiz form">
              <Input
                type="text"
                label="Student Name"
                value={formData.studentName}
                onChange={(e) => handleChange('studentName', e.target.value)}
                error={errors.studentName}
                required
                placeholder="Enter your full name"
                disabled={isLoading}
                showValidIndicator={true}
              />

              <Input
                type="text"
                label="Student ID"
                value={formData.studentId}
                onChange={(e) => handleChange('studentId', e.target.value)}
                error={errors.studentId}
                required
                placeholder="Enter your student ID"
                disabled={isLoading}
                showValidIndicator={true}
              />

              <Input
                type="text"
                label="Quiz Access Code"
                value={formData.accessCode}
                onChange={(e) => handleChange('accessCode', e.target.value.toUpperCase())}
                error={errors.accessCode}
                required
                placeholder="Enter 6-character code"
                maxLength={6}
                disabled={isLoading}
                showValidIndicator={true}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={isLoading}
                className="w-full"
                aria-label={isLoading ? "Joining quiz..." : "Join quiz with access code"}
              >
                Join Quiz
              </Button>
            </form>

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
