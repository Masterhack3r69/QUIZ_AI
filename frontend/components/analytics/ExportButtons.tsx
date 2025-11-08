'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/Icon';
import type { Analytics, Quiz } from '@/types';

interface ExportButtonsProps {
  analytics: Analytics;
  quiz: Quiz;
}

/**
 * Export buttons component with lazy-loaded export utilities
 * This component dynamically imports the heavy export libraries only when needed
 */
export function ExportButtons({ analytics, quiz }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const handleExportPDF = async () => {
    if (!analytics || !quiz) return;
    
    try {
      setIsExporting(true);
      setExportError(null);
      setExportSuccess(null);
      
      // Lazy load the export utility only when needed
      const { exportToPDF } = await import('@/lib/export');
      await exportToPDF(analytics, quiz.title);
      
      setExportSuccess('PDF exported successfully!');
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err) {
      console.error('PDF export error:', err);
      setExportError('Failed to export PDF. Please try again.');
      setTimeout(() => setExportError(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!analytics || !quiz) return;
    
    try {
      setIsExporting(true);
      setExportError(null);
      setExportSuccess(null);
      
      // Lazy load the export utility only when needed
      const { exportToExcel } = await import('@/lib/export');
      await exportToExcel(analytics, quiz.title);
      
      setExportSuccess('Excel file exported successfully!');
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err) {
      console.error('Excel export error:', err);
      setExportError('Failed to export Excel. Please try again.');
      setTimeout(() => setExportError(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="default"
          onClick={handleExportPDF}
          disabled={isExporting}
          aria-label="Export analytics to PDF"
        >
          {isExporting ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></span>
              Exporting...
            </>
          ) : (
            <>
              <Icon name="file-pdf" className="mr-2" />
              Export to PDF
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="default"
          onClick={handleExportExcel}
          disabled={isExporting}
          aria-label="Export analytics to Excel"
        >
          {isExporting ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></span>
              Exporting...
            </>
          ) : (
            <>
              <Icon name="file-excel" className="mr-2" />
              Export to Excel
            </>
          )}
        </Button>
      </div>

      {/* Toast notifications */}
      {exportSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {exportSuccess}
        </div>
      )}
      {exportError && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {exportError}
        </div>
      )}
    </>
  );
}
