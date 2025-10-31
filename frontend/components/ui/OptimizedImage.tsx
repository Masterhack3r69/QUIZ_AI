import Image, { ImageProps } from 'next/image';

/**
 * Optimized Image component wrapper for Next.js Image
 * Provides automatic optimization, lazy loading, and responsive images
 * 
 * @example
 * <OptimizedImage
 *   src="/logo.png"
 *   alt="Company Logo"
 *   width={200}
 *   height={100}
 *   priority={false}
 * />
 */
export function OptimizedImage(props: ImageProps) {
  return (
    <Image
      {...props}
      loading={props.priority ? undefined : 'lazy'}
      placeholder={props.placeholder || 'blur'}
      blurDataURL={props.blurDataURL || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='}
    />
  );
}
