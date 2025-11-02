'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import type { QuizTemplate } from '@/types';

interface TemplateCardProps {
  template: QuizTemplate;
  onEdit?: (template: QuizTemplate) => void;
  onDelete?: (template: QuizTemplate) => void;
  onDuplicate?: (template: QuizTemplate) => void;
  onSelect?: (template: QuizTemplate) => void;
  isPredefined?: boolean;
}

export function TemplateCard({
  template,
  onEdit,
  onDelete,
  onDuplicate,
  onSelect,
  isPredefined = false,
}: TemplateCardProps) {
  const [showPreview, setShowPreview] = useState(false);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'short':
        return 'Short Quiz';
      case 'long':
        return 'Long Quiz';
      case 'exam':
        return 'Exam';
      case 'custom':
        return 'Custom';
      default:
        return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'short':
        return 'bg-blue-100 text-blue-800';
      case 'long':
        return 'bg-purple-100 text-purple-800';
      case 'exam':
        return 'bg-red-100 text-red-800';
      case 'custom':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(template);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(template);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(template);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDuplicate) {
      onDuplicate(template);
    }
  };

  return (
    <Card
      className="relative"
      hover={!!onSelect}
      onClick={onSelect ? handleCardClick : undefined}
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
    >
      <div className="p-4 sm:p-6">
        {/* Header with Type Badge */}
        <div className="flex items-start justify-between mb-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(
              template.type
            )}`}
            role="status"
            aria-label={`Template type: ${getTypeLabel(template.type)}`}
          >
            {getTypeLabel(template.type)}
          </span>
          {isPredefined && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
              Predefined
            </span>
          )}
        </div>

        {/* Template Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
          {template.name}
        </h3>

        {/* Key Settings */}
        <dl className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-1">
              <Icon name="document" className="w-4 h-4" />
              Questions:
            </dt>
            <dd className="font-medium text-gray-900">{template.questionCount}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-1">
              <Icon name="clock" className="w-4 h-4" />
              Duration:
            </dt>
            <dd className="font-medium text-gray-900">{template.duration} min</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-1">
              <Icon name="calendar" className="w-4 h-4" />
              Expires in:
            </dt>
            <dd className="font-medium text-gray-900">{template.expirationPeriod} days</dd>
          </div>
        </dl>

        {/* Question Distribution */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Question Distribution:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {template.questionDistribution.multipleChoice > 0 && (
              <div className="flex items-center justify-between bg-blue-50 px-2 py-1 rounded">
                <span className="text-gray-600">Multiple Choice:</span>
                <span className="font-medium text-gray-900">
                  {template.questionDistribution.multipleChoice}%
                </span>
              </div>
            )}
            {template.questionDistribution.trueFalse > 0 && (
              <div className="flex items-center justify-between bg-green-50 px-2 py-1 rounded">
                <span className="text-gray-600">True/False:</span>
                <span className="font-medium text-gray-900">
                  {template.questionDistribution.trueFalse}%
                </span>
              </div>
            )}
            {template.questionDistribution.fillInBlank > 0 && (
              <div className="flex items-center justify-between bg-yellow-50 px-2 py-1 rounded">
                <span className="text-gray-600">Fill-in-Blank:</span>
                <span className="font-medium text-gray-900">
                  {template.questionDistribution.fillInBlank}%
                </span>
              </div>
            )}
            {template.questionDistribution.matching > 0 && (
              <div className="flex items-center justify-between bg-purple-50 px-2 py-1 rounded">
                <span className="text-gray-600">Matching:</span>
                <span className="font-medium text-gray-900">
                  {template.questionDistribution.matching}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Subjects (if any) */}
        {template.subjects && template.subjects.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-700 mb-2">Subjects:</p>
            <div className="flex flex-wrap gap-1">
              {template.subjects.map((subject, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!isPredefined && (onEdit || onDelete || onDuplicate) && (
          <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="flex-1"
                aria-label={`Edit template: ${template.name}`}
              >
                <Icon name="edit" className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            {onDuplicate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDuplicate}
                className="flex-1"
                aria-label={`Duplicate template: ${template.name}`}
              >
                <Icon name="copy" className="w-4 h-4 mr-1" />
                Duplicate
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="flex-1 text-red-600 hover:bg-red-50"
                aria-label={`Delete template: ${template.name}`}
              >
                <Icon name="trash" className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        )}

        {/* Hover Preview Tooltip */}
        {showPreview && (
          <div className="absolute left-0 right-0 bottom-full mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10 pointer-events-none">
            <p className="font-semibold mb-1">{template.name}</p>
            <p className="text-gray-300">
              {template.questionCount} questions • {template.duration} minutes • Expires in{' '}
              {template.expirationPeriod} days
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
