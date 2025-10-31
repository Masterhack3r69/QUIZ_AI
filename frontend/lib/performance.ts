/**
 * Performance monitoring utilities
 * These utilities help track and optimize application performance
 */

/**
 * Measure the execution time of a function
 * @param name - Name of the operation being measured
 * @param fn - Function to measure
 * @returns Result of the function
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T> | T
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const end = performance.now();
    const duration = end - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ Performance: ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const end = performance.now();
    const duration = end - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ Performance: ${name} failed after ${duration.toFixed(2)}ms`);
    }
    
    throw error;
  }
}

/**
 * Report Web Vitals to console in development
 * Can be extended to send to analytics service in production
 */
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Web Vital:', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
    });
  }
  
  // In production, you could send to analytics:
  // if (process.env.NODE_ENV === 'production') {
  //   sendToAnalytics(metric);
  // }
}

/**
 * Preload a resource for better performance
 * @param href - URL of the resource to preload
 * @param as - Type of resource (script, style, font, etc.)
 */
export function preloadResource(href: string, as: string) {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  
  if (as === 'font') {
    link.crossOrigin = 'anonymous';
  }
  
  document.head.appendChild(link);
}

/**
 * Prefetch a page for faster navigation
 * @param href - URL to prefetch
 */
export function prefetchPage(href: string) {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  
  document.head.appendChild(link);
}

/**
 * Check if the user prefers reduced motion
 * Useful for disabling animations for accessibility
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get connection speed information
 * Useful for adaptive loading strategies
 */
export function getConnectionSpeed(): 'slow' | 'fast' | 'unknown' {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return 'unknown';
  }
  
  const connection = (navigator as any).connection;
  
  if (!connection) return 'unknown';
  
  // Check effective connection type
  const effectiveType = connection.effectiveType;
  
  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    return 'slow';
  }
  
  if (effectiveType === '3g') {
    return 'slow';
  }
  
  return 'fast';
}

/**
 * Lazy load a component with a minimum delay
 * Prevents flash of loading state for fast connections
 * @param importFn - Dynamic import function
 * @param minDelay - Minimum delay in milliseconds
 */
export function lazyLoadWithDelay<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  minDelay: number = 0
): Promise<{ default: T }> {
  return Promise.all([
    importFn(),
    new Promise(resolve => setTimeout(resolve, minDelay))
  ]).then(([module]) => module);
}
