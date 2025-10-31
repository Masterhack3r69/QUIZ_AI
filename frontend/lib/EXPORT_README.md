# Analytics Export Functionality

This module provides functionality to export quiz analytics data to PDF and Excel formats.

## Features

### PDF Export (`exportToPDF`)
- Generates a comprehensive PDF report with:
  - Quiz title and header
  - Summary statistics (total submissions, average/highest/lowest scores)
  - Student submissions table with all details
  - Question performance analysis (if available)
- Uses `jspdf` and `jspdf-autotable` for PDF generation
- Automatically handles pagination for large datasets
- Styled with consistent colors and formatting

### Excel Export (`exportToExcel`)
- Generates a multi-sheet Excel workbook with:
  - **Summary Sheet**: Quiz title and summary statistics
  - **Submissions Sheet**: Detailed student submission data
  - **Question Analysis Sheet**: Question-by-question performance metrics
- Uses `xlsx` library for Excel generation
- Includes proper column widths for readability
- Formatted data with percentages and time formatting

## Usage

```typescript
import { exportToPDF, exportToExcel } from '@/lib/export';

// Export to PDF
await exportToPDF(analyticsData, quizTitle);

// Export to Excel
await exportToExcel(analyticsData, quizTitle);
```

## Implementation Details

### File Naming
- Files are automatically named based on the quiz title
- Special characters are replaced with underscores
- Format: `{quiz_title}_results.pdf` or `{quiz_title}_results.xlsx`

### Data Formatting
- Time values are formatted as "Xm Ys" (e.g., "5m 30s")
- Dates are formatted using `toLocaleString()`
- Percentages include the "%" symbol
- Scores are displayed as "X / Y" format

### Error Handling
- Both functions are async and can throw errors
- Errors should be caught and displayed to users via Toast notifications
- Loading states should be shown during export generation

## Dependencies

- `jspdf` (v3.0.3): PDF generation
- `jspdf-autotable` (v5.0.2): Table generation in PDFs
- `xlsx` (v0.18.5): Excel file generation

## Browser Compatibility

- Works in all modern browsers
- Uses browser's download functionality to save files
- No server-side processing required
