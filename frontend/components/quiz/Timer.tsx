'use client';

import { useEffect, useState, useRef } from 'react';

interface TimerProps {
  duration: number; // in seconds
  onExpire: () => void;
  isActive: boolean;
}

const STORAGE_KEY = 'quiz_timer_state';

export default function Timer({ duration, onExpire, isActive }: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(duration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasExpiredRef = useRef(false);

  // Load timer state from sessionStorage on mount
  useEffect(() => {
    const savedState = sessionStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const { timeRemaining: savedTime, timestamp } = JSON.parse(savedState);
        const elapsed = Math.floor((Date.now() - timestamp) / 1000);
        const adjustedTime = Math.max(0, savedTime - elapsed);
        setTimeRemaining(adjustedTime);
      } catch (error) {
        console.error('Failed to parse timer state:', error);
        setTimeRemaining(duration);
      }
    }
  }, [duration]);

  // Save timer state to sessionStorage whenever it changes
  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          timeRemaining,
          timestamp: Date.now(),
        })
      );
    }
  }, [timeRemaining, isActive]);

  // Main timer logic
  useEffect(() => {
    if (!isActive) {
      return;
    }

    // Check if timer has already expired
    if (timeRemaining <= 0 && !hasExpiredRef.current) {
      hasExpiredRef.current = true;
      sessionStorage.removeItem(STORAGE_KEY);
      onExpire();
      return;
    }

    // Set up interval to update timer every second
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        
        if (newTime <= 0) {
          if (!hasExpiredRef.current) {
            hasExpiredRef.current = true;
            sessionStorage.removeItem(STORAGE_KEY);
            onExpire();
          }
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    // Cleanup interval on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, onExpire, timeRemaining]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Determine if timer is in warning state (less than 5 minutes)
  const isWarning = timeRemaining < 300; // 5 minutes = 300 seconds
  const isCritical = timeRemaining < 60; // 1 minute = 60 seconds

  return (
    <div className="flex items-center justify-center">
      <div
        className={`
          px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-mono text-xl sm:text-2xl font-bold
          transition-colors duration-300
          ${
            isCritical
              ? 'bg-red-100 text-red-700 border-2 border-red-500'
              : isWarning
              ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-500'
              : 'bg-blue-100 text-blue-700 border-2 border-blue-500'
          }
        `}
        role="timer"
        aria-live="polite"
        aria-label={`Time remaining: ${formatTime(timeRemaining)}`}
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{formatTime(timeRemaining)}</span>
        </div>
      </div>
    </div>
  );
}
