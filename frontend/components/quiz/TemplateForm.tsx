'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icon } from '@/components/ui/Icon';
import type { QuizTemplate, QuizDistribution } from '@/types';

interface TemplateFormProps {
  template?: QuizTemplate;
  onSubmit: (data: Omit<QuizTemplate, '_id' | 'teacher' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const SUBJECT_OPTIONS = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Geography',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Literature',
  'Art',
  'Music',
  'Physical Education',
  'Other',
];

export function TemplateForm({ template, onSubmit, onCancel, isLoading = false }: TemplateFormProps) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    type: template?.type || 'custom' as 'short' | 'long' | 'exam' | 'custom',
    questionCount: template?.questionCount || 10,
    duration: template?.duration || 30,
    expirationPeriod: template?.expirationPeriod || 7,
    subjects: template?.subjects || [] as string[],
  });

  const [distribution, setDistribution] = useState<QuizDistribution>(
    template?.questionDistribution || {
      multipleChoice: 100,
      trueFalse: 0,
      fillInBlank: 0,
      matching: 0,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedSubject, setSelectedSubject] = useState('');

  // Update form when template type changes
  useEffect(() => {
    if (formData.type !== 'custom') {
      const presets = {
        short: { questionCount: 10, duration: 15 },
        long: { questionCount: 25, duration: 45 },
        exam: { questionCount: 50, duration: 90 },
      };
      
      const preset = presets[formData.type as keyof typeof presets];
      if (preset) {
        setFormData(prev => ({
          ...prev,
          questionCount: preset.questionCount,
          duration: preset.duration,
        }));
      }
    }
  }, [formData.type]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }

    if (formData.questionCount < 1) {
      newErrors.questionCount = 'Question count must be at least 1';
    }

    if (formData.duration < 1) {
      newErrors.duration = 'Duration must be at least 1 minute';
    }

    if (formData.expirationPeriod < 1) {
      newErrors.expirationPeriod = 'Expiration period must be at least 1 day';
    }

    // Validate distribution totals 100%
    const total =
      distribution.multipleChoice +
      distribution.trueFalse +
      distribution.fillInBlank +
      distribution.matching;

    if (total !== 100) {
      newErrors.distribution = 'Question distribution must total 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Force type to 'custom' for new templates (predefined types are read-only)
    const submitData = {
      ...formData,
      type: 'custom' as const,
      questionDistribution: distribution,
    };

    onSubmit(submitData);
  };

  const handleDistributionChange = (type: keyof QuizDistribution, value: number) => {
    const newValue = Math.max(0, Math.min(100, value));
    setDistribution(prev => ({
      ...prev,
      [type]: newValue,
    }));
  };

  const applyPresetDistribution = (preset: 'allMC' | 'mixed' | 'balanced') => {
    const presets = {
      allMC: { multipleChoice: 100, trueFalse: 0, fillInBlank: 0, matching: 0 },
      mixed: { multipleChoice: 70, trueFalse: 20, fillInBlank: 10, matching: 0 },
      balanced: { multipleChoice: 40, trueFalse: 30, fillInBlank: 20, matching: 10 },
    };
    setDistribution(presets[preset]);
  };

  const addSubject = () => {
    if (selectedSubject && !formData.subjects.includes(selectedSubject)) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, selectedSubject],
      }));
      setSelectedSubject('');
    }
  };

  const removeSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject),
    }));
  };

  const distributionTotal =
    distribution.multipleChoice +
    distribution.trueFalse +
    distribution.fillInBlank +
    distribution.matching;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Template Name */}
      <div className="space-y-2">
        <Label htmlFor="template-name">Template Name *</Label>
        <Input
          id="template-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
          placeholder="e.g., Weekly Quiz Template"
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Template Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Start from Preset
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Choose a preset to auto-fill settings, or start with custom values
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { value: 'short', label: 'Short Quiz', desc: '10 questions, 15 min' },
            { value: 'long', label: 'Long Quiz', desc: '25 questions, 45 min' },
            { value: 'exam', label: 'Exam', desc: '50 questions, 90 min' },
            { value: 'custom', label: 'Custom', desc: 'Your settings' },
          ].map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
              className={`p-3 border-2 rounded-lg text-left transition-colors ${
                formData.type === type.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{type.label}</div>
              <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Question Count and Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="question-count">Number of Questions *</Label>
          <Input
            id="question-count"
            type="number"
            value={formData.questionCount.toString()}
            onChange={(e) => setFormData(prev => ({ ...prev, questionCount: parseInt(e.target.value) || 0 }))}
            required
            min={1}
          />
          {errors.questionCount && (
            <p className="text-sm text-red-600">{errors.questionCount}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes) *</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration.toString()}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
            required
            min={1}
          />
          {errors.duration && (
            <p className="text-sm text-red-600">{errors.duration}</p>
          )}
        </div>
      </div>

      {/* Expiration Period */}
      <div className="space-y-2">
        <Label htmlFor="expiration">Expiration Period (days) *</Label>
        <Input
          id="expiration"
          type="number"
          value={formData.expirationPeriod.toString()}
          onChange={(e) => setFormData(prev => ({ ...prev, expirationPeriod: parseInt(e.target.value) || 0 }))}
          required
          min={1}
          placeholder="Number of days until quiz expires"
        />
        {errors.expirationPeriod && (
          <p className="text-sm text-red-600">{errors.expirationPeriod}</p>
        )}
      </div>

      {/* Question Distribution */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Distribution
        </label>
        
        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            type="button"
            onClick={() => applyPresetDistribution('allMC')}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            All Multiple Choice
          </button>
          <button
            type="button"
            onClick={() => applyPresetDistribution('mixed')}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Mixed (70/20/10)
          </button>
          <button
            type="button"
            onClick={() => applyPresetDistribution('balanced')}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Balanced
          </button>
        </div>

        {/* Distribution Sliders */}
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          {[
            { key: 'multipleChoice' as const, label: 'Multiple Choice', color: 'blue' },
            { key: 'trueFalse' as const, label: 'True/False', color: 'green' },
            { key: 'fillInBlank' as const, label: 'Fill-in-the-Blank', color: 'yellow' },
            { key: 'matching' as const, label: 'Matching', color: 'purple' },
          ].map(({ key, label, color }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-gray-700">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={distribution[key]}
                    onChange={(e) => handleDistributionChange(key, parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                    min={0}
                    max={100}
                  />
                  <span className="text-sm text-gray-600">%</span>
                </div>
              </div>
              <input
                type="range"
                value={distribution[key]}
                onChange={(e) => handleDistributionChange(key, parseInt(e.target.value))}
                className="w-full"
                min={0}
                max={100}
                step={5}
              />
            </div>
          ))}
          
          {/* Total Display */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total:</span>
              <span
                className={`text-sm font-bold ${
                  distributionTotal === 100 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {distributionTotal}%
              </span>
            </div>
          </div>
        </div>
        {errors.distribution && (
          <p className="mt-1 text-sm text-red-600">{errors.distribution}</p>
        )}
      </div>

      {/* Subjects */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subjects (Optional)
        </label>
        <div className="flex gap-2 mb-2">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECT_OPTIONS.filter(s => !formData.subjects.includes(s)).map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            onClick={addSubject}
            disabled={!selectedSubject}
          >
            <Icon name="plus" className="w-4 h-4" />
          </Button>
        </div>
        {formData.subjects.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.subjects.map((subject) => (
              <span
                key={subject}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {subject}
                <button
                  type="button"
                  onClick={() => removeSubject(subject)}
                  className="hover:text-blue-900"
                  aria-label={`Remove ${subject}`}
                >
                  <Icon name="x" className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="default"
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {template ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
}
