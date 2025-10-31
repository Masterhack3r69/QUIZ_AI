import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* React 19 Compiler - Automatic optimizations */
  reactCompiler: true,

  /* Image Optimization */
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  /* Performance Optimizations */
  compress: true,
  poweredByHeader: false,

  /* Experimental features for better performance */
  experimental: {
    optimizePackageImports: ['jspdf', 'jspdf-autotable', 'xlsx'],
  },
};

export default nextConfig;
