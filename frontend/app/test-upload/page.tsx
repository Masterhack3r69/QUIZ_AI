'use client';

import { useState } from 'react';

export default function TestUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', 'Test Quiz');
      formData.append('duration', '30');
      formData.append('expiresAt', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
      formData.append('questionsPerStudent', '10');

      const response = await fetch('/api/test-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to upload and process file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <a href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Test AI Question Generator
          </h1>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Upload a PDF, DOCX, or TXT file with educational content</li>
              <li>AI extracts and analyzes the content</li>
              <li>System generates 20 multiple-choice questions automatically</li>
              <li>View the questions with correct answers marked</li>
            </ol>
          </div>

          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload PDF, DOCX, or TXT file
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg
                font-semibold hover:bg-blue-700 disabled:bg-gray-400
                disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Upload & Generate Questions'}
            </button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">AI is analyzing your content...</p>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-6 mt-8">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  ✓ Quiz created successfully!
                </div>

                {/* Quiz Info */}
                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold mb-4">Quiz Information</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Title:</span> {result.title}
                    </div>
                    <div>
                      <span className="font-medium">Access Code:</span>{' '}
                      <span className="text-2xl font-bold text-blue-600">{result.accessCode}</span>
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {result.duration} minutes
                    </div>
                    <div>
                      <span className="font-medium">Total Questions:</span> {result.questions?.length || 0}
                    </div>
                  </div>
                </div>

                {/* Content Summary */}
                {result.sourceContent && (
                  <div className="border-t pt-6">
                    <h2 className="text-xl font-semibold mb-4">Extracted Content</h2>
                    <div className="bg-gray-50 p-4 rounded max-h-48 overflow-y-auto text-sm">
                      {result.sourceContent.substring(0, 500)}...
                    </div>
                  </div>
                )}

                {/* Generated Questions */}
                {result.questions && result.questions.length > 0 && (
                  <div className="border-t pt-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Generated Questions ({result.questions.length})
                    </h2>
                    <div className="space-y-4">
                      {result.questions.slice(0, 5).map((q: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded">
                          <p className="font-medium mb-2">
                            {idx + 1}. {q.question}
                          </p>
                          <ul className="space-y-1 ml-4">
                            {q.options.map((opt: string, optIdx: number) => (
                              <li
                                key={optIdx}
                                className={`text-sm ${
                                  optIdx === q.correctAnswer
                                    ? 'text-green-600 font-semibold'
                                    : 'text-gray-600'
                                }`}
                              >
                                {String.fromCharCode(65 + optIdx)}. {opt}
                                {optIdx === q.correctAnswer && ' ✓'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      {result.questions.length > 5 && (
                        <p className="text-sm text-gray-500 text-center">
                          ... and {result.questions.length - 5} more questions
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
