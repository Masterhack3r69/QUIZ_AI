'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ContentSource } from '@/types';

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/msword', // DOC
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
  'application/vnd.ms-powerpoint', // PPT
  'text/plain',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.txt'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const MIN_TOPIC_LENGTH = 50; // Minimum characters for topic input

export interface ContentSourceSelectorProps {
  onSourceSelect: (source: ContentSource | null) => void;
  selectedSource?: ContentSource | null;
  error?: string;
}

export function ContentSourceSelector({
  onSourceSelect,
  selectedSource,
  error,
}: ContentSourceSelectorProps) {
  // Determine active tab from selectedSource
  const getInitialTab = () => {
    if (!selectedSource) return 'file';
    return selectedSource.type;
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(
    selectedSource?.type === 'file' && selectedSource.content instanceof File 
      ? selectedSource.content 
      : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Topic input state
  const [topicText, setTopicText] = useState<string>(
    selectedSource?.type === 'topic' && typeof selectedSource.content === 'string'
      ? selectedSource.content
      : ''
  );
  
  // Video URL state
  const [videoUrl, setVideoUrl] = useState<string>(
    selectedSource?.type === 'video' && typeof selectedSource.content === 'string'
      ? selectedSource.content
      : ''
  );
  
  // Web URL state
  const [webUrl, setWebUrl] = useState<string>(
    selectedSource?.type === 'url' && typeof selectedSource.content === 'string'
      ? selectedSource.content
      : ''
  );

  // ==================== File Upload Functions ====================
  
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 10MB limit';
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = ALLOWED_FILE_TYPES.includes(file.type) || 
                       ALLOWED_EXTENSIONS.includes(fileExtension);
    
    if (!isValidType) {
      return 'Invalid file type. Please upload PDF, DOCX, PPT, or TXT files';
    }

    return null;
  };

  const handleFile = (file: File) => {
    setValidationError('');
    
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      return;
    }

    setSelectedFile(file);
    onSourceSelect({ type: 'file', content: file });
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setValidationError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSelectedFile(null);
    onSourceSelect(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // ==================== Topic Input Functions ====================
  
  const handleTopicChange = (value: string) => {
    setTopicText(value);
    setValidationError('');
    
    if (value.trim().length >= MIN_TOPIC_LENGTH) {
      onSourceSelect({ type: 'topic', content: value.trim() });
    } else if (value.trim().length > 0) {
      onSourceSelect(null);
    } else {
      onSourceSelect(null);
    }
  };

  const getTopicError = (): string | undefined => {
    if (topicText.trim().length > 0 && topicText.trim().length < MIN_TOPIC_LENGTH) {
      return `Please enter at least ${MIN_TOPIC_LENGTH} characters`;
    }
    return undefined;
  };

  // ==================== Video URL Functions ====================
  
  const validateVideoUrl = (url: string): string | null => {
    if (!url.trim()) return null;
    
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      // Check for YouTube
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        return null;
      }
      
      // Check for other video platforms
      if (hostname.includes('vimeo.com') || hostname.includes('dailymotion.com')) {
        return null;
      }
      
      return 'Please enter a valid YouTube or video platform URL';
    } catch {
      return 'Please enter a valid URL';
    }
  };

  const handleVideoUrlChange = (value: string) => {
    setVideoUrl(value);
    setValidationError('');
    
    const error = validateVideoUrl(value);
    if (error) {
      setValidationError(error);
      onSourceSelect(null);
    } else if (value.trim()) {
      onSourceSelect({ type: 'video', content: value.trim() });
    } else {
      onSourceSelect(null);
    }
  };

  // ==================== Web URL Functions ====================
  
  const validateWebUrl = (url: string): string | null => {
    if (!url.trim()) return null;
    
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return 'URL must start with http:// or https://';
      }
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  };

  const handleWebUrlChange = (value: string) => {
    setWebUrl(value);
    setValidationError('');
    
    const error = validateWebUrl(value);
    if (error) {
      setValidationError(error);
      onSourceSelect(null);
    } else if (value.trim()) {
      onSourceSelect({ type: 'url', content: value.trim() });
    } else {
      onSourceSelect(null);
    }
  };

  // ==================== Tab Change Handler ====================
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setValidationError('');
    
    // Clear selection when switching tabs
    onSourceSelect(null);
  };

  // ==================== Tab Content Renderers ====================
  
  const renderFileUploadTab = () => (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_EXTENSIONS.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="File upload input"
      />

      {!selectedFile ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
            ${validationError ? 'border-red-300 bg-red-50' : ''}
          `}
        >
          <div className="flex flex-col items-center">
            <svg
              className={`w-12 h-12 mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isDragging ? 'Drop file here' : 'Drag and drop your file here'}
            </p>
            
            <p className="text-sm text-gray-500 mb-4">
              or
            </p>
            
            <Button
              type="button"
              variant="default"
              onClick={handleBrowseClick}
            >
              Browse Files
            </Button>
            
            <p className="text-xs text-gray-500 mt-4">
              Supported formats: PDF, DOCX, PPT, TXT (Max 10MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="border-2 border-green-300 bg-green-50 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Remove file"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {validationError && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {validationError}
        </p>
      )}
    </div>
  );

  const renderTopicTab = () => (
    <div className="w-full">
      <div className="relative">
        <textarea
          value={topicText}
          onChange={(e) => handleTopicChange(e.target.value)}
          placeholder="Enter a topic or subject matter for the quiz. For example: 'The water cycle and its importance in Earth's ecosystem' or 'Key events of World War II'"
          className="block w-full px-4 py-3 text-base border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 min-h-[200px] resize-y bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500/20 text-gray-900 placeholder:text-gray-400"
          aria-label="Topic description"
          aria-describedby="topic-helper"
        />
        <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-white px-2 py-1 rounded">
          {topicText.length} / {MIN_TOPIC_LENGTH} min
        </div>
      </div>
      
      <p id="topic-helper" className="mt-2 text-sm text-gray-500">
        Describe the topic you want to create quiz questions about. Minimum {MIN_TOPIC_LENGTH} characters.
      </p>
      
      {getTopicError() && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {getTopicError()}
        </p>
      )}
    </div>
  );

  const renderVideoTab = () => (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <Label htmlFor="video-url">Video URL</Label>
        <Input
          id="video-url"
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={videoUrl}
          onChange={(e) => handleVideoUrlChange(e.target.value)}
        />
        <p className="text-sm text-gray-500">Enter a YouTube or video platform URL. The system will extract the transcript for question generation.</p>
        {validationError && (
          <p className="text-sm text-red-600">{validationError}</p>
        )}
      </div>
      
      {videoUrl && !validationError && (
        <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-blue-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">Video URL Ready</p>
              <p className="text-sm text-blue-700 mt-1">
                The system will extract the video transcript when you proceed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderWebUrlTab = () => (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <Label htmlFor="web-url">Web Page URL</Label>
        <Input
          id="web-url"
          type="url"
          placeholder="https://example.com/article"
          value={webUrl}
          onChange={(e) => handleWebUrlChange(e.target.value)}
        />
        <p className="text-sm text-gray-500">Enter a web page URL. The system will extract the main content for question generation.</p>
        {validationError && (
          <p className="text-sm text-red-600">{validationError}</p>
        )}
      </div>
      
      {webUrl && !validationError && (
        <div className="border-2 border-purple-300 bg-purple-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-purple-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-purple-900">Web URL Ready</p>
              <p className="text-sm text-purple-700 mt-1">
                The system will extract the page content when you proceed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ==================== Tabs Configuration ====================
  
  const renderTemplateTab = () => (
    <div className="w-full">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Templates Coming Soon</h3>
          <p className="text-gray-500 max-w-md">
            Pre-built quiz templates for common subjects and topics will be available in a future update. 
            Stay tuned for ready-to-use templates that make quiz creation even faster!
          </p>
          <div className="mt-6 inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    {
      id: 'file',
      label: 'File Upload',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      content: renderFileUploadTab(),
    },
    {
      id: 'topic',
      label: 'Topic',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      content: renderTopicTab(),
    },
    {
      id: 'video',
      label: 'Video URL',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      content: renderVideoTab(),
    },
    {
      id: 'url',
      label: 'Web URL',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      content: renderWebUrlTab(),
    },
    {
      id: 'template',
      label: 'Template',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      content: renderTemplateTab(),
      disabled: true,
    },
  ];

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="file" className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            File Upload
          </TabsTrigger>
          <TabsTrigger value="topic" className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Topic
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Video URL
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            Web URL
          </TabsTrigger>
          <TabsTrigger value="template" disabled className="flex items-center gap-2 relative">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Template
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
              Soon
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="file" className="mt-6">
          {renderFileUploadTab()}
        </TabsContent>
        <TabsContent value="topic" className="mt-6">
          {renderTopicTab()}
        </TabsContent>
        <TabsContent value="video" className="mt-6">
          {renderVideoTab()}
        </TabsContent>
        <TabsContent value="url" className="mt-6">
          {renderWebUrlTab()}
        </TabsContent>
        <TabsContent value="template" className="mt-6">
          {renderTemplateTab()}
        </TabsContent>
      </Tabs>
      
      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
