"use client"

import { useState, useRef, useCallback } from "react"
import { useQuizStore } from "@/store/quiz-store"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  FileText, 
  CheckCircle2, 
  Youtube, 
  Globe, 
  BookOpen,
  Sparkles,
  Upload,
  File,
  X
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

type SourceType = 'topic' | 'text' | 'url' | 'video' | 'file'

const sourceOptions = [
  {
    id: 'topic' as SourceType,
    label: 'Topic',
    icon: BookOpen,
    description: 'Generate from any subject',
    bgLight: 'bg-blue-50 dark:bg-blue-950/30',
    borderActive: 'border-blue-500 ring-blue-500/20',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500'
  },
  {
    id: 'text' as SourceType,
    label: 'Text',
    icon: FileText,
    description: 'Paste notes or content',
    bgLight: 'bg-orange-50 dark:bg-orange-950/30',
    borderActive: 'border-orange-500 ring-orange-500/20',
    iconBg: 'bg-gradient-to-br from-orange-500 to-amber-500'
  },
  {
    id: 'file' as SourceType,
    label: 'File',
    icon: Upload,
    description: 'Upload PDF or TXT',
    bgLight: 'bg-violet-50 dark:bg-violet-950/30',
    borderActive: 'border-violet-500 ring-violet-500/20',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-500'
  },
  {
    id: 'url' as SourceType,
    label: 'Website',
    icon: Globe,
    description: 'Extract from webpage',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderActive: 'border-emerald-500 ring-emerald-500/20',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-green-500'
  },
  {
    id: 'video' as SourceType,
    label: 'YouTube',
    icon: Youtube,
    description: 'Quiz from video',
    bgLight: 'bg-red-50 dark:bg-red-950/30',
    borderActive: 'border-red-500 ring-red-500/20',
    iconBg: 'bg-gradient-to-br from-red-500 to-rose-500'
  }
]

export default function StepSource() {
  const { setSource, sourceType: storedSourceType } = useQuizStore()
  const [activeTab, setActiveTab] = useState<SourceType>(storedSourceType || 'topic')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [topic, setTopic] = useState("")
  const [text, setText] = useState("")
  const [url, setUrl] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)

  // Auto-save to store when input changes
  const handleTopicChange = (value: string) => {
    setTopic(value)
    if (value.trim()) {
      setSource('topic', value, { originalInput: value })
    }
  }

  const handleTextChange = (value: string) => {
    setText(value)
    if (value.trim()) {
      setSource('text', value, { processedContent: value, originalInput: 'Raw Text' })
    }
  }

  const handleUrlChange = (value: string) => {
    setUrl(value)
    if (value.trim()) {
      setSource('url', value, { url: value, originalInput: value })
    }
  }

  const handleVideoUrlChange = (value: string) => {
    setVideoUrl(value)
    if (value.trim()) {
      setSource('video', value, { url: value, originalInput: value })
    }
  }

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    
    if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.txt')) {
      toast.error("Please upload a PDF, TXT, or Word document")
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB")
      return
    }

    setFile(selectedFile)
    
    // For text files, read content directly
    if (selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.txt')) {
      const content = await selectedFile.text()
      setSource('file', content, { 
        filename: selectedFile.name, 
        processedContent: content,
        originalInput: selectedFile.name 
      })
    } else {
      // For PDF/Word, store the file reference - will be processed on next step
      setSource('file', selectedFile.name, { 
        filename: selectedFile.name,
        file: selectedFile,
        originalInput: selectedFile.name 
      })
    }
    
    toast.success(`File "${selectedFile.name}" selected`)
  }, [setSource])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }, [handleFileSelect])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const removeFile = () => {
    setFile(null)
    setSource(null as any, '', {})
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const activeOption = sourceOptions.find(o => o.id === activeTab)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-2">
          <Sparkles className="h-3 w-3" />
          Step 1 of 4
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Choose Your Source</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Select how you want to generate quiz questions
        </p>
      </div>

      {/* Source Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {sourceOptions.map((option) => {
          const Icon = option.icon
          const isActive = activeTab === option.id
          
          return (
            <motion.button
              key={option.id}
              onClick={() => setActiveTab(option.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left group shadow-sm",
                isActive 
                  ? `${option.borderActive} ${option.bgLight} ring-4` 
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/50 hover:shadow-md"
              )}
            >
              <div className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all shadow-lg",
                isActive ? option.iconBg : "bg-slate-100 dark:bg-slate-700 group-hover:scale-105"
              )}>
                <Icon className={cn(
                  "h-5 w-5 sm:h-6 sm:w-6 transition-colors",
                  isActive ? "text-white" : "text-slate-500 dark:text-slate-400"
                )} />
              </div>
              <div className="text-center">
                <h3 className={cn(
                  "font-semibold text-xs sm:text-sm transition-colors",
                  isActive ? "text-foreground" : "text-slate-700 dark:text-slate-300"
                )}>{option.label}</h3>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 hidden sm:block">
                  {option.description}
                </p>
              </div>
              
              {isActive && (
                <motion.div 
                  layoutId="activeIndicator"
                  className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white dark:bg-slate-900 shadow-md flex items-center justify-center"
                >
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-500" />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Input Area */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "rounded-xl border-2 border-dashed p-5 sm:p-6 transition-colors",
            activeOption?.bgLight,
            "border-slate-300 dark:border-slate-700"
          )}
        >
          {activeTab === 'topic' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", activeOption?.iconBg)}>
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Enter a Topic</Label>
                  <p className="text-xs text-muted-foreground">AI will generate questions from its knowledge</p>
                </div>
              </div>
              <Input 
                placeholder="e.g., Photosynthesis, World War II, Machine Learning" 
                value={topic}
                onChange={(e) => handleTopicChange(e.target.value)}
                className="h-12 text-base bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", activeOption?.iconBg)}>
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Paste Your Content</Label>
                  <p className="text-xs text-muted-foreground">Lecture notes, articles, or any text</p>
                </div>
              </div>
              <Textarea 
                placeholder="Paste your content here..." 
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                className="min-h-[180px] resize-y text-base bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
              />
              {text && (
                <p className="text-xs text-muted-foreground text-right">
                  {text.length.toLocaleString()} characters
                </p>
              )}
            </div>
          )}

          {activeTab === 'file' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", activeOption?.iconBg)}>
                  <Upload className="h-4 w-4 text-white" />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Upload a File</Label>
                  <p className="text-xs text-muted-foreground">PDF, TXT, or Word documents (max 10MB)</p>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />

              {!file ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition-colors"
                >
                  <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, TXT, DOC, DOCX
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <File className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 text-slate-500" />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", activeOption?.iconBg)}>
                  <Globe className="h-4 w-4 text-white" />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Website URL</Label>
                  <p className="text-xs text-muted-foreground">Content will be extracted when you continue</p>
                </div>
              </div>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="https://example.com/article" 
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="h-12 pl-12 text-base bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", activeOption?.iconBg)}>
                  <Youtube className="h-4 w-4 text-white" />
                </div>
                <div>
                  <Label className="text-sm font-semibold">YouTube Video URL</Label>
                  <p className="text-xs text-muted-foreground">Transcript will be extracted when you continue</p>
                </div>
              </div>
              <div className="relative">
                <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="https://youtube.com/watch?v=..." 
                  value={videoUrl}
                  onChange={(e) => handleVideoUrlChange(e.target.value)}
                  className="h-12 pl-12 text-base bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
