'use client';

import React from 'react';

export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hover?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function Card({
  title,
  subtitle,
  children,
  actions,
  onClick,
  className = '',
  hover = false,
  onMouseEnter,
  onMouseLeave,
}: CardProps) {
  const baseStyles = 'bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden';
  const interactiveStyles = onClick ? 'cursor-pointer transition-shadow hover:shadow-lg' : '';
  const hoverStyles = hover ? 'transition-shadow hover:shadow-lg' : '';
  
  return (
    <div
      className={`${baseStyles} ${interactiveStyles} ${hoverStyles} ${className}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {(title || subtitle || actions) && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        {children}
      </div>
    </div>
  );
}
