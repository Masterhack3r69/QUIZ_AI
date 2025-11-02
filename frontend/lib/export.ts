// lib/export.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Analytics } from '@/types';

/**
 * Format time in seconds to MM:SS format
 */
function formatTime(seconds?: number): string {
  if (!seconds) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

/**
 * Export analytics data to PDF
 */
export async function exportToPDF(analytics: Analytics, quizTitle: string): Promise<void> {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text('Quiz Results & Analytics', 14, 20);
  
  // Quiz Title
  doc.setFontSize(14);
  doc.text(`Quiz: ${quizTitle}`, 14, 30);
  
  // Summary Statistics
  doc.setFontSize(12);
  doc.text('Summary Statistics', 14, 45);
  
  const summaryData = [
    ['Total Submissions', analytics.summary.totalSubmissions.toString()],
    ['Average Score', analytics.summary.averageScore.toFixed(1)],
    ['Highest Score', analytics.summary.highestScore.toString()],
    ['Lowest Score', analytics.summary.lowestScore.toString()],
  ];

  // Add question type breakdown if available
  if (analytics.summary.questionTypeBreakdown) {
    const typeLabels: Record<string, string> = {
      multipleChoice: 'Multiple Choice',
      trueFalse: 'True/False',
      fillInBlank: 'Fill in Blank',
      matching: 'Matching'
    };
    Object.entries(analytics.summary.questionTypeBreakdown).forEach(([type, count]) => {
      if (count > 0) {
        summaryData.push([`${typeLabels[type]} Questions`, count.toString()]);
      }
    });
  }

  // Add average score by type if available
  if (analytics.summary.averageScoreByType) {
    const typeLabels: Record<string, string> = {
      multipleChoice: 'Multiple Choice',
      trueFalse: 'True/False',
      fillInBlank: 'Fill in Blank',
      matching: 'Matching'
    };
    Object.entries(analytics.summary.averageScoreByType).forEach(([type, score]) => {
      const count = analytics.summary.questionTypeBreakdown?.[type as keyof typeof analytics.summary.questionTypeBreakdown] || 0;
      if (count > 0) {
        summaryData.push([`Avg Score (${typeLabels[type]})`, `${score.toFixed(1)}%`]);
      }
    });
  }
  
  autoTable(doc, {
    startY: 50,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  // Submissions Table
  const finalY = (doc as any).lastAutoTable.finalY || 90;
  doc.setFontSize(12);
  doc.text('Student Submissions', 14, finalY + 10);
  
  if (analytics.submissions && analytics.submissions.length > 0) {
    const submissionsData = analytics.submissions.map((sub) => {
      const percentage = Math.round((sub.score / sub.totalQuestions) * 100);
      return [
        sub.studentName,
        sub.studentId,
        `${sub.score} / ${sub.totalQuestions}`,
        `${percentage}%`,
        formatTime(sub.timeTaken),
        new Date(sub.submittedAt).toLocaleString(),
      ];
    });
    
    autoTable(doc, {
      startY: finalY + 15,
      head: [['Student Name', 'Student ID', 'Score', 'Percentage', 'Time Taken', 'Submitted At']],
      body: submissionsData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 35 },
      },
    });
  }
  
  // Question Statistics (if available)
  if (analytics.questionStats && analytics.questionStats.length > 0) {
    const questionFinalY = (doc as any).lastAutoTable.finalY || 150;
    
    const typeLabels: Record<string, string> = {
      multipleChoice: 'MC',
      trueFalse: 'T/F',
      fillInBlank: 'FIB',
      matching: 'Match'
    };
    
    // Add new page if needed
    if (questionFinalY > 250) {
      doc.addPage();
      doc.setFontSize(12);
      doc.text('Question Performance Analysis', 14, 20);
      
      const questionData = analytics.questionStats.map((stat, index) => [
        (index + 1).toString(),
        typeLabels[stat.questionType] || stat.questionType,
        stat.question.substring(0, 55) + (stat.question.length > 55 ? '...' : ''),
        stat.correctCount.toString(),
        stat.totalAttempts.toString(),
        `${stat.accuracyRate}%`,
      ]);
      
      autoTable(doc, {
        startY: 25,
        head: [['#', 'Type', 'Question', 'Correct', 'Total', 'Accuracy']],
        body: questionData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 15 },
          2: { cellWidth: 80 },
          3: { cellWidth: 18 },
          4: { cellWidth: 18 },
          5: { cellWidth: 18 },
        },
      });
    } else {
      doc.setFontSize(12);
      doc.text('Question Performance Analysis', 14, questionFinalY + 10);
      
      const questionData = analytics.questionStats.map((stat, index) => [
        (index + 1).toString(),
        typeLabels[stat.questionType] || stat.questionType,
        stat.question.substring(0, 55) + (stat.question.length > 55 ? '...' : ''),
        stat.correctCount.toString(),
        stat.totalAttempts.toString(),
        `${stat.accuracyRate}%`,
      ]);
      
      autoTable(doc, {
        startY: questionFinalY + 15,
        head: [['#', 'Type', 'Question', 'Correct', 'Total', 'Accuracy']],
        body: questionData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 15 },
          2: { cellWidth: 80 },
          3: { cellWidth: 18 },
          4: { cellWidth: 18 },
          5: { cellWidth: 18 },
        },
      });
    }
  }
  
  // Save the PDF
  const fileName = `${quizTitle.replace(/[^a-z0-9]/gi, '_')}_results.pdf`;
  doc.save(fileName);
}

/**
 * Export analytics data to Excel
 */
export async function exportToExcel(analytics: Analytics, quizTitle: string): Promise<void> {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Summary Sheet
  const summaryData = [
    ['Quiz Results & Analytics'],
    ['Quiz Title', quizTitle],
    [],
    ['Summary Statistics'],
    ['Total Submissions', analytics.summary.totalSubmissions],
    ['Average Score', analytics.summary.averageScore.toFixed(1)],
    ['Highest Score', analytics.summary.highestScore],
    ['Lowest Score', analytics.summary.lowestScore],
  ];

  // Add question type breakdown if available
  if (analytics.summary.questionTypeBreakdown) {
    summaryData.push([]);
    summaryData.push(['Question Type Distribution']);
    const typeLabels: Record<string, string> = {
      multipleChoice: 'Multiple Choice',
      trueFalse: 'True/False',
      fillInBlank: 'Fill in Blank',
      matching: 'Matching'
    };
    Object.entries(analytics.summary.questionTypeBreakdown).forEach(([type, count]) => {
      if (count > 0) {
        summaryData.push([typeLabels[type], count]);
      }
    });
  }

  // Add average score by type if available
  if (analytics.summary.averageScoreByType) {
    summaryData.push([]);
    summaryData.push(['Average Score by Question Type']);
    const typeLabels: Record<string, string> = {
      multipleChoice: 'Multiple Choice',
      trueFalse: 'True/False',
      fillInBlank: 'Fill in Blank',
      matching: 'Matching'
    };
    Object.entries(analytics.summary.averageScoreByType).forEach(([type, score]) => {
      const count = analytics.summary.questionTypeBreakdown?.[type as keyof typeof analytics.summary.questionTypeBreakdown] || 0;
      if (count > 0) {
        summaryData.push([typeLabels[type], `${score.toFixed(1)}%`]);
      }
    });
  }
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Set column widths
  summarySheet['!cols'] = [
    { wch: 30 },
    { wch: 30 },
  ];
  
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Submissions Sheet
  if (analytics.submissions && analytics.submissions.length > 0) {
    const submissionsData = analytics.submissions.map((sub) => {
      const percentage = Math.round((sub.score / sub.totalQuestions) * 100);
      return {
        'Student Name': sub.studentName,
        'Student ID': sub.studentId,
        'Score': sub.score,
        'Total Questions': sub.totalQuestions,
        'Percentage': percentage + '%',
        'Time Taken': formatTime(sub.timeTaken),
        'Submitted At': new Date(sub.submittedAt).toLocaleString(),
      };
    });
    
    const submissionsSheet = XLSX.utils.json_to_sheet(submissionsData);
    
    // Set column widths
    submissionsSheet['!cols'] = [
      { wch: 20 }, // Student Name
      { wch: 15 }, // Student ID
      { wch: 10 }, // Score
      { wch: 15 }, // Total Questions
      { wch: 12 }, // Percentage
      { wch: 15 }, // Time Taken
      { wch: 25 }, // Submitted At
    ];
    
    XLSX.utils.book_append_sheet(workbook, submissionsSheet, 'Submissions');
  }
  
  // Question Statistics Sheet
  if (analytics.questionStats && analytics.questionStats.length > 0) {
    const typeLabels: Record<string, string> = {
      multipleChoice: 'Multiple Choice',
      trueFalse: 'True/False',
      fillInBlank: 'Fill in Blank',
      matching: 'Matching'
    };
    
    const questionData = analytics.questionStats.map((stat, index) => ({
      '#': index + 1,
      'Type': typeLabels[stat.questionType] || stat.questionType,
      'Question': stat.question,
      'Correct Answers': stat.correctCount,
      'Total Attempts': stat.totalAttempts,
      'Accuracy Rate': stat.accuracyRate + '%',
    }));
    
    const questionSheet = XLSX.utils.json_to_sheet(questionData);
    
    // Set column widths
    questionSheet['!cols'] = [
      { wch: 5 },  // #
      { wch: 18 }, // Type
      { wch: 70 }, // Question
      { wch: 15 }, // Correct Answers
      { wch: 15 }, // Total Attempts
      { wch: 15 }, // Accuracy Rate
    ];
    
    XLSX.utils.book_append_sheet(workbook, questionSheet, 'Question Analysis');
  }
  
  // Save the Excel file
  const fileName = `${quizTitle.replace(/[^a-z0-9]/gi, '_')}_results.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
