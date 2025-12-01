"use client"

import { useState } from "react"
import { useQuizStore } from "@/store/quiz-store"
import { aiService } from "@/services/ai.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, Link as LinkIcon, Type, Video, Loader2, CheckCircle2, UploadCloud, Youtube, Globe, BookOpen } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface StepSourceProps {
  onNext: () => void
}

type SourceType = 'topic' | 'text' | 'url' | 'video' | 'file'

export default function StepSource({ onNext }: StepSourceProps) {
  const { setSource, sourceType, sourceMetadata } = useQuizStore()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<SourceType>((sourceType === 'file' ? 'text' : sourceType) || 'topic')
  
  // Local state for inputs
  const [topic, setTopic] = useState("")
  const [text, setText] = useState("")
  const [url, setUrl] = useState("")
  const [videoUrl, setVideoUrl] = useState("")

  const handleProcess = async () => {
    setIsLoading(true)
    try {
      let result;
      let contentToStore = "";
      const type = activeTab;

      if (type === 'topic') {
        if (!topic) throw new Error("Please enter a topic")
        result = await aiService.processTopic(topic)
        contentToStore = result.content
      } else if (type === 'text') {
        if (!text) throw new Error("Please enter some text")
        contentToStore = text
        result = { content: text, contentLength: text.length }
      } else if (type === 'url') {
        if (!url) throw new Error("Please enter a URL")
        result = await aiService.processUrl(url)
        contentToStore = result.content
      } else if (type === 'video') {
        if (!videoUrl) throw new Error("Please enter a YouTube URL")
        result = await aiService.processVideo(videoUrl)
        contentToStore = result.content
      }

      setSource(type, contentToStore, { 
        processedContent: contentToStore,
        originalInput: type === 'topic' ? topic : type === 'url' ? url : type === 'video' ? videoUrl : 'Raw Text'
      })
      
      toast.success("Content processed successfully!")
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message || "Failed to process content")
    } finally {
      setIsLoading(false)
    }
  }

  const sourceOptions = [
    {
      id: 'topic',
      label: 'Topic',
      icon: BookOpen,
      description: 'Generate from a subject or topic',
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'hover:border-blue-500'
    },
    {
      id: 'text',
      label: 'Raw Text',
      icon: FileText,
      description: 'Paste your own notes or content',
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'hover:border-orange-500'
    },
    {
      id: 'url',
      label: 'Website',
      icon: Globe,
      description: 'Extract content from a webpage',
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'hover:border-green-500'
    },
    {
      id: 'video',
      label: 'YouTube',
      icon: Youtube,
      description: 'Create quiz from a video',
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'hover:border-red-500'
    }
  ]

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold">Choose Source Material</h2>
        <p className="text-muted-foreground">
          Select the type of content you want to use to generate your quiz questions.
        </p>
      </div>

      {/* Source Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sourceOptions.map((option) => {
          const Icon = option.icon
          const isActive = activeTab === option.id
          
          return (
            <div
              key={option.id}
              onClick={() => setActiveTab(option.id as SourceType)}
              className={cn(
                "relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md",
                isActive 
                  ? `border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10 ring-1 ring-indigo-600` 
                  : "border-muted hover:border-indigo-300 dark:hover:border-indigo-700 bg-card"
              )}
            >
              <div className={cn("mb-3 w-10 h-10 rounded-lg flex items-center justify-center", option.bg, option.color)}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">{option.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
              
              {isActive && (
                <div className="absolute top-3 right-3 text-indigo-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Input Area */}
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto mt-8 p-6 rounded-xl border bg-card/50"
      >
        {activeTab === 'topic' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base">Enter a Topic</Label>
              <Input 
                placeholder="e.g., Photosynthesis, The Civil War, Quantum Physics" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="h-12 text-lg"
              />
              <p className="text-sm text-muted-foreground">
                The AI will use its knowledge base to generate relevant questions.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base">Paste Text Content</Label>
              <Textarea 
                placeholder="Paste your lecture notes, article, or book excerpt here..." 
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] resize-y text-base"
              />
            </div>
          </div>
        )}

        {activeTab === 'url' && (
          <div className="space-y-4">
             <div className="space-y-2">
              <Label className="text-base">Website URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="https://en.wikipedia.org/wiki/..." 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-12 pl-10"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                We'll scrape the text from this page to generate questions.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'video' && (
          <div className="space-y-4">
             <div className="space-y-2">
              <Label className="text-base">YouTube Video URL</Label>
              <div className="relative">
                <Youtube className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="h-12 pl-10"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                We'll extract the transcript from the video.
              </p>
            </div>
          </div>
        )}

        <div className="pt-6 mt-2">
          <Button 
            onClick={handleProcess} 
            disabled={isLoading || (activeTab === 'topic' && !topic) || (activeTab === 'text' && !text) || (activeTab === 'url' && !url) || (activeTab === 'video' && !videoUrl)} 
            className="w-full h-12 text-base font-medium" 
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing Content...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                Process {sourceOptions.find(o => o.id === activeTab)?.label}
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Success Indicator */}
      {sourceType && !isLoading && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-green-800 dark:text-green-300 text-lg">Content Ready!</h4>
            <p className="text-green-700 dark:text-green-400">
              Source processed successfully. You can now proceed to configuration.
            </p>
          </div>
          <Button variant="outline" className="border-green-200 hover:bg-green-100 hover:text-green-700 dark:border-green-800 dark:hover:bg-green-900/50" onClick={onNext}>
            Next Step
          </Button>
        </motion.div>
      )}
    </div>
  )
}

function Wand2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
      <path d="m14 7 3 3" />
      <path d="M5 6v4" />
      <path d="M19 14v4" />
      <path d="M10 2v2" />
      <path d="M7 8H3" />
      <path d="M21 16h-4" />
      <path d="M11 3H9" />
    </svg>
  )
}
