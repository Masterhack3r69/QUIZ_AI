/**
 * Utility functions for the application
 */

/**
 * Debounce function to limit the rate at which a function can fire
 * Useful for search inputs, filter inputs, and resize handlers
 * 
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the function
 * 
 * @example
 * const debouncedSearch = debounce((query: string) => {
 *   // Perform search
 * }, 300);
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * Throttle function to ensure a function is called at most once per specified time period
 * Useful for scroll handlers and resize handlers
 * 
 * @param func - The function to throttle
 * @param limit - The time limit in milliseconds
 * @returns A throttled version of the function
 * 
 * @example
 * const throttledScroll = throttle(() => {
 *   // Handle scroll
 * }, 100);
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Format a date to a localized string
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString();
}

/**
 * Format a date and time to a localized string
 * @param date - The date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString();
}

/**
 * Truncate a string to a specified length
 * @param str - The string to truncate
 * @param length - The maximum length
 * @returns Truncated string with ellipsis if needed
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

/**
 * Generate a random ID
 * @returns A random string ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Check if code is running on the client side
 * @returns true if running in browser
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Safely parse JSON with error handling
 * @param json - The JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Determine quiz status based on expiration date
 * @param expiresAt - The expiration date/time of the quiz
 * @param currentStatus - The current status from the database
 * @returns 'active' or 'expired'
 */
export function getQuizStatus(
  expiresAt: string | Date,
  currentStatus?: string
): 'active' | 'expired' {
  const now = new Date();
  const expirationDate = new Date(expiresAt);
  
  // If the expiration date has passed, mark as expired
  if (expirationDate < now) {
    return 'expired';
  }
  
  // If there's a current status and it's expired, keep it expired
  if (currentStatus === 'expired') {
    return 'expired';
  }
  
  return 'active';
}
