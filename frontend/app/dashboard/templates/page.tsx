'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, FileText, Clock, Sparkles } from 'lucide-react';

export default function TemplatesPage() {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-12 pb-12">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Icon */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <FileText className="w-12 h-12 text-blue-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center animate-pulse">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Quiz Templates
              </h1>
              <p className="text-lg text-gray-600">
                Coming Soon
              </p>
            </div>

            {/* Description */}
            <div className="max-w-md space-y-4">
              <p className="text-gray-600">
                We're working on an exciting new feature that will let you create and save reusable quiz templates. 
                This will make creating quizzes even faster and more efficient!
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  What to expect:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Pre-built templates for common quiz types</li>
                  <li>• Save your own custom templates</li>
                  <li>• Quick quiz creation from templates</li>
                  <li>• Share templates with other teachers</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <Button
                onClick={() => router.push('/dashboard/create')}
                className="gap-2"
              >
                Create Quiz Now
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            </div>

            {/* Footer Note */}
            <p className="text-sm text-gray-500 pt-4">
              In the meantime, you can create quizzes directly from the Create Quiz page.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
