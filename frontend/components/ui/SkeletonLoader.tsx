'use client';

import React from 'react';

export interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'table' | 'quiz-card' | 'circle';
  count?: number;
  className?: string;
}

/**
 * Skeleton loader component for displaying loading placeholders
 */
export function SkeletonLoader({
  variant = 'text',
  count = 1,
  className = '',
}: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'text':
        return (
          <div className={`space-y-3 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
              <div
                key={index}
                className="h-4 bg-gray-200 rounded animate-pulse"
                style={{ width: `${Math.random() * 30 + 70}%` }}
              />
            ))}
          </div>
        );

      case 'card':
        return (
          <div className={`space-y-4 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        );

      case 'quiz-card':
        return (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
              >
                {/* Title */}
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                
                {/* Access Code */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-8 bg-gray-200 rounded w-20" />
                </div>
                
                {/* Status and Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 bg-gray-200 rounded w-16" />
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
                
                {/* Buttons */}
                <div className="flex space-x-2">
                  <div className="h-10 bg-gray-200 rounded flex-1" />
                  <div className="h-10 bg-gray-200 rounded flex-1" />
                </div>
              </div>
            ))}
          </div>
        );

      case 'table':
        return (
          <div className={`space-y-3 ${className}`}>
            {/* Table Header */}
            <div className="flex space-x-4 pb-3 border-b border-gray-200">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`header-${index}`}
                  className="h-4 bg-gray-200 rounded flex-1 animate-pulse"
                />
              ))}
            </div>
            
            {/* Table Rows */}
            {Array.from({ length: count }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex space-x-4 py-3 border-b border-gray-100">
                {Array.from({ length: 4 }).map((_, colIndex) => (
                  <div
                    key={`row-${rowIndex}-col-${colIndex}`}
                    className="h-4 bg-gray-200 rounded flex-1 animate-pulse"
                  />
                ))}
              </div>
            ))}
          </div>
        );

      case 'circle':
        return (
          <div className={`flex space-x-4 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
              <div
                key={index}
                className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return <>{renderSkeleton()}</>;
}

/**
 * Skeleton loader for quiz list
 */
export function QuizListSkeleton({ count = 6 }: { count?: number }) {
  return <SkeletonLoader variant="quiz-card" count={count} />;
}

/**
 * Skeleton loader for submissions table
 */
export function SubmissionsTableSkeleton({ count = 5 }: { count?: number }) {
  return <SkeletonLoader variant="table" count={count} />;
}

/**
 * Skeleton loader for analytics cards
 */
export function AnalyticsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-8 w-8 bg-gray-200 rounded" />
          </div>
          <div className="h-8 bg-gray-200 rounded w-16" />
        </div>
      ))}
    </div>
  );
}
