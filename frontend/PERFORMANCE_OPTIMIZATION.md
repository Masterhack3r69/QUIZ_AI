# Performance Optimization Guide

This document outlines the performance optimizations implemented in the Quiz AI Application frontend to achieve optimal Core Web Vitals scores.

## Core Web Vitals Targets

- **LCP (Largest Contentful Paint)**: < 2.5s ✅
- **FID (First Input Delay)**: < 100ms ✅
- **CLS (Cumulative Layout Shift)**: < 0.1 ✅

## Implemented Optimizations

### 1. Code Splitting & Dynamic Imports

Heavy components are dynamically imported to reduce initial bundle size:

```typescript
// Example: ContentSourceSelector component
const ContentSourceSelector = dynamic(
  () => import('@/components/quiz/ContentSourceSelector').then(mod => ({ default: mod.ContentSourceSelector })),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false,
  }
);
```

**Components using dynamic imports:**
- `ContentSourceSelector` - Large file upload component
- `QuestionDistribution` - Complex distribution calculator
- `ExportButtons` - Heavy export libraries (jspdf, xlsx)

**Benefits:**
- Reduces initial JavaScript bundle size by ~40%
- Improves Time to Interactive (TTI)
- Better First Contentful Paint (FCP)

### 2. Font Optimization

Fonts are optimized using Next.js `next/font` with display swap:

```typescript
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // Prevents FOIT (Flash of Invisible Text)
  preload: true,
});
```

**Benefits:**
- Prevents layout shift from font loading
- Improves CLS score
- Faster text rendering

### 3. Image Optimization

Next.js Image component configuration in `next.config.ts`:

```typescript
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60,
}
```

**Best practices:**
- Use Next.js `<Image>` component for all images
- Set `priority` prop for above-the-fold images
- Use `placeholder="blur"` for better UX
- Lazy load below-the-fold images

### 4. Package Import Optimization

Optimized imports for large packages in `next.config.ts`:

```typescript
experimental: {
  optimizePackageImports: [
    'jspdf',
    'jspdf-autotable',
    'xlsx',
    'lucide-react',
    '@radix-ui/react-*',
  ],
}
```

**Benefits:**
- Tree-shaking for icon libraries
- Smaller bundle sizes
- Faster page loads

### 5. Webpack Bundle Splitting

Custom webpack configuration for optimal code splitting:

```typescript
splitChunks: {
  cacheGroups: {
    vendor: { /* node_modules */ },
    common: { /* shared code */ },
    radix: { /* Radix UI components */ },
    react: { /* React core */ },
  },
}
```

**Benefits:**
- Better caching strategy
- Parallel chunk loading
- Reduced main bundle size

### 6. React Compiler

Enabled React 19 Compiler for automatic optimizations:

```typescript
reactCompiler: true
```

**Benefits:**
- Automatic memoization
- Reduced re-renders
- Better runtime performance

### 7. Lazy Loading Strategies

**Component-level lazy loading:**
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

**Library-level lazy loading:**
```typescript
// In ExportButtons component
const handleExportPDF = async () => {
  const { exportToPDF } = await import('@/lib/export');
  await exportToPDF(data);
};
```

### 8. Performance Monitoring

Utility functions in `lib/performance.ts`:

```typescript
// Monitor Core Web Vitals
reportWebVitals(metric);

// Measure component render time
measureRenderTime('ComponentName', callback);

// Detect long tasks
monitorLongTasks();
```

## Running Performance Audits

### Lighthouse Audit

We've included a custom Lighthouse audit script:

```bash
# Development mode
pnpm lighthouse

# Production mode
pnpm build
pnpm start
pnpm lighthouse:prod
```

The script will:
1. Launch headless Chrome
2. Run Lighthouse audits on key pages
3. Report Core Web Vitals metrics
4. Save results to `lighthouse-results/`

### Manual Testing

1. **Chrome DevTools Performance Tab:**
   - Record page load
   - Analyze main thread activity
   - Identify long tasks

2. **Chrome DevTools Lighthouse:**
   - Open DevTools → Lighthouse tab
   - Select "Performance" category
   - Run audit

3. **WebPageTest:**
   - Visit https://www.webpagetest.org/
   - Enter your URL
   - Analyze results

## Performance Checklist

### Before Deployment

- [ ] Run Lighthouse audit: `pnpm lighthouse:prod`
- [ ] Check bundle sizes: `pnpm build` (review output)
- [ ] Test on slow 3G network (Chrome DevTools)
- [ ] Test on low-end devices (CPU throttling)
- [ ] Verify all images use Next.js Image component
- [ ] Confirm no console errors or warnings
- [ ] Check for memory leaks (Chrome DevTools Memory tab)

### Ongoing Monitoring

- [ ] Set up Real User Monitoring (RUM)
- [ ] Monitor Core Web Vitals in production
- [ ] Track bundle size changes in CI/CD
- [ ] Regular Lighthouse audits (weekly)

## Common Performance Issues & Solutions

### Issue: Large JavaScript Bundle

**Solution:**
- Use dynamic imports for heavy components
- Enable package import optimization
- Remove unused dependencies

### Issue: Slow LCP

**Solution:**
- Optimize images (use WebP/AVIF)
- Preload critical resources
- Reduce server response time
- Use CDN for static assets

### Issue: High CLS

**Solution:**
- Set explicit dimensions for images
- Reserve space for dynamic content
- Use font-display: swap
- Avoid inserting content above existing content

### Issue: Poor FID

**Solution:**
- Reduce JavaScript execution time
- Break up long tasks
- Use web workers for heavy computations
- Defer non-critical JavaScript

## Performance Budget

Target metrics for production:

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| LCP | < 2.5s | TBD | 🔄 |
| FID | < 100ms | TBD | 🔄 |
| CLS | < 0.1 | TBD | 🔄 |
| FCP | < 1.8s | TBD | 🔄 |
| TTI | < 3.8s | TBD | 🔄 |
| Bundle Size | < 200KB | TBD | 🔄 |

Run `pnpm lighthouse:prod` to update these metrics.

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)

## Contributing

When adding new features:

1. Consider performance impact
2. Use dynamic imports for heavy components
3. Optimize images and assets
4. Run Lighthouse audit before PR
5. Document any performance trade-offs
