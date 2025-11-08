import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { ComponentType } from 'react';

/**
 * Utility for creating dynamically imported components with loading states
 * This helps with code splitting and improves initial page load performance
 */

// Default loading component for dynamic imports
export const DefaultLoadingFallback = () => (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-64 w-full" />
  </div>
);

// Card loading fallback for card-based components
export const CardLoadingFallback = () => (
  <div className="rounded-lg border bg-card p-6 space-y-4">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-10 w-32 mt-4" />
  </div>
);

// Button loading fallback
export const ButtonLoadingFallback = () => (
  <Skeleton className="h-10 w-32" />
);

/**
 * Create a dynamically imported component with a custom loading fallback
 * @param importFn - Function that returns the dynamic import
 * @param LoadingComponent - Optional custom loading component
 * @param ssr - Whether to render on server side (default: false for heavy components)
 */
export function createDynamicComponent<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  LoadingComponent: ComponentType = DefaultLoadingFallback,
  ssr: boolean = false
) {
  return dynamic(importFn, {
    loading: () => <LoadingComponent />,
    ssr,
  });
}

/**
 * Create a dynamically imported component with no SSR and default loading
 * Useful for client-only heavy components like charts, editors, etc.
 */
export function createClientOnlyComponent<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  LoadingComponent: ComponentType = DefaultLoadingFallback
) {
  return createDynamicComponent(importFn, LoadingComponent, false);
}
