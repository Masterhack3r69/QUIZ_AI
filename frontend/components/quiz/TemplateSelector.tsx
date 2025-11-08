/**
 * TemplateSelector Component
 * 
 * A component for selecting quiz templates (predefined or custom) when creating a new quiz.
 * 
 * Features:
 * - Displays predefined templates (Short Quiz, Long Quiz, Exam)
 * - Shows user's custom templates
 * - Allows selecting "No Template" to start from scratch
 * - Fetches custom templates from the API
 * - Visual selection indicators
 * - Responsive grid layout
 * 
 * Usage Example:
 * ```tsx
 * import { TemplateSelector } from '@/components/quiz/TemplateSelector';
 * 
 * function CreateQuizWizard() {
 *   const [selectedTemplate, setSelectedTemplate] = useState<QuizTemplate | null>(null);
 * 
 *   const handleTemplateSelect = (template: QuizTemplate | null) => {
 *     setSelectedTemplate(template);
 *     
 *     if (template) {
 *       // Pre-populate form with template values
 *       setQuizConfig({
 *         questionCount: template.questionCount,
 *         duration: template.duration,
 *         questionDistribution: template.questionDistribution,
 *         expirationPeriod: template.expirationPeriod,
 *         subjects: template.subjects || [],
 *       });
 *     } else {
 *       // Reset to default values
 *       setQuizConfig(defaultConfig);
 *     }
 *   };
 * 
 *   return (
 *     <TemplateSelector
 *       onSelect={handleTemplateSelect}
 *       onCreateNew={() => router.push('/dashboard/templates/create')}
 *       selectedTemplateId={selectedTemplate?._id}
 *     />
 *   );
 * }
 * ```
 */

'use client';

import React, { useState, useEffect } from 'react';
import { TemplateCard } from './TemplateCard';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/Icon';
import { apiClient } from '@/lib/api';
import type { QuizTemplate } from '@/types';

interface TemplateSelectorProps {
  onSelect: (template: QuizTemplate | null) => void;
  onCreateNew?: () => void;
  selectedTemplateId?: string;
}

// Predefined templates
const PREDEFINED_TEMPLATES: QuizTemplate[] = [
  {
    _id: 'predefined-short',
    teacher: '',
    name: 'Short Quiz',
    type: 'short',
    questionCount: 10,
    duration: 15,
    questionDistribution: {
      multipleChoice: 100,
      trueFalse: 0,
      fillInBlank: 0,
      matching: 0,
    },
    expirationPeriod: 7,
    subjects: [],
    createdAt: '',
    updatedAt: '',
  },
  {
    _id: 'predefined-long',
    teacher: '',
    name: 'Long Quiz',
    type: 'long',
    questionCount: 25,
    duration: 45,
    questionDistribution: {
      multipleChoice: 70,
      trueFalse: 20,
      fillInBlank: 10,
      matching: 0,
    },
    expirationPeriod: 14,
    subjects: [],
    createdAt: '',
    updatedAt: '',
  },
  {
    _id: 'predefined-exam',
    teacher: '',
    name: 'Exam',
    type: 'exam',
    questionCount: 50,
    duration: 90,
    questionDistribution: {
      multipleChoice: 60,
      trueFalse: 20,
      fillInBlank: 15,
      matching: 5,
    },
    expirationPeriod: 30,
    subjects: [],
    createdAt: '',
    updatedAt: '',
  },
];

export function TemplateSelector({
  onSelect,
  onCreateNew,
  selectedTemplateId,
}: TemplateSelectorProps) {
  const [customTemplates, setCustomTemplates] = useState<QuizTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(selectedTemplateId || null);

  useEffect(() => {
    loadCustomTemplates();
  }, []);

  const loadCustomTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const templates = await apiClient.getMyTemplates();
      setCustomTemplates(templates);
    } catch (err) {
      console.error('Failed to load templates:', err);
      setError('Failed to load custom templates. You can still use predefined templates.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: QuizTemplate) => {
    setSelectedId(template._id);
    onSelect(template);
  };

  const handleNoTemplate = () => {
    setSelectedId(null);
    onSelect(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Choose a Template
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Select a template to pre-fill quiz settings, or start from scratch
          </p>
        </div>
        {onCreateNew && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateNew}
            aria-label="Create new template"
          >
            <Icon name="plus" className="w-4 h-4 mr-1" />
            New Template
          </Button>
        )}
      </div>

      {/* No Template Option */}
      <div>
        <button
          onClick={handleNoTemplate}
          className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
            selectedId === null
              ? 'border-blue-600 bg-blue-50 shadow-sm'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
          aria-pressed={selectedId === null}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedId === null
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-gray-300'
              }`}
            >
              {selectedId === null && (
                <Icon name="check" className="w-3 h-3 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">No Template</h3>
              <p className="text-sm text-gray-600">
                Start from scratch with custom settings
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Predefined Templates */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Predefined Templates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PREDEFINED_TEMPLATES.map((template) => (
            <div
              key={template._id}
              className={`relative ${
                selectedId === template._id ? 'ring-2 ring-blue-600 rounded-lg' : ''
              }`}
            >
              <TemplateCard
                template={template}
                onSelect={handleTemplateSelect}
                isPredefined
              />
              {selectedId === template._id && (
                <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                  <Icon name="check" className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Custom Templates */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          My Custom Templates
        </h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="alert" className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800">{error}</p>
                <button
                  onClick={loadCustomTemplates}
                  className="text-sm text-yellow-700 underline hover:text-yellow-900 mt-1"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        ) : customTemplates.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Icon name="template" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">No custom templates yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Create a template to save your preferred quiz settings
            </p>
            {onCreateNew && (
              <Button
                variant="default"
                size="sm"
                onClick={onCreateNew}
              >
                <Icon name="plus" className="w-4 h-4 mr-1" />
                Create Your First Template
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customTemplates.map((template) => (
              <div
                key={template._id}
                className={`relative ${
                  selectedId === template._id ? 'ring-2 ring-blue-600 rounded-lg' : ''
                }`}
              >
                <TemplateCard
                  template={template}
                  onSelect={handleTemplateSelect}
                  isPredefined={false}
                />
                {selectedId === template._id && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                    <Icon name="check" className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
