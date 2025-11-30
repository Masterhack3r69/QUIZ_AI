"use client"

import { useState } from "react"
import { useQuizStore } from "@/store/quiz-store"
import { aiService } from "@/services/ai.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { FileText, Link as LinkIcon, Type, Video, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface StepSourceProps {
  onNext: () => void
}

export default function StepSource({ onNext }: StepSourceProps) {
  const { setSource, sourceType, sourceMetadata } = useQuizStore()
  const [isLoading, setIsLoading] = useState(false)
  
  // Local state for inputs
  const [topic, setTopic] = useState("")
  const [text, setText] = useState("")
  const [url, setUrl] = useState("")
  const [videoUrl, setVideoUrl] = useState("")

  const handleProcess = async (type: 'topic' | 'text' | 'url' | 'video') => {
    setIsLoading(true)
    try {
      let result;
      let contentToStore = "";

      if (type === 'topic') {
        if (!topic) throw new Error("Please enter a topic")
        result = await aiService.processTopic(topic)
        contentToStore = result.content
      } else if (type === 'text') {
        if (!text) throw new Error("Please enter some text")
        // Direct text doesn't always need backend processing unless we want to clean it
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
      // Optional: Auto-advance or let user click next
      // onNext() 
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message || "Failed to process content")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold">Choose Your Source Material</h2>
        <p className="text-muted-foreground">Select how you want to generate your quiz questions.</p>
      </div>

      <Tabs defaultValue="topic" className="w-full max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50">
          <TabsTrigger value="topic" className="py-3 flex flex-col gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
            <Type className="h-5 w-5" />
            <span className="text-xs font-medium">Topic</span>
          </TabsTrigger>
          <TabsTrigger value="text" className="py-3 flex flex-col gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
            <FileText className="h-5 w-5" />
            <span className="text-xs font-medium">Raw Text</span>
          </TabsTrigger>
          <TabsTrigger value="url" className="py-3 flex flex-col gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
            <LinkIcon className="h-5 w-5" />
            <span className="text-xs font-medium">Website URL</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="py-3 flex flex-col gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
            <Video className="h-5 w-5" />
            <span className="text-xs font-medium">YouTube</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="topic" className="space-y-4">
            <div className="space-y-2">
              <Label>Enter a Topic</Label>
              <Input 
                placeholder="e.g., Photosynthesis, The Civil War, Quantum Physics" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="h-12 text-lg"
              />
              <p className="text-xs text-muted-foreground">The AI will generate content based on this topic.</p>
            </div>
            <Button onClick={() => handleProcess('topic')} disabled={isLoading || !topic} className="w-full" size="lg">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Process Topic
            </Button>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label>Paste Text Content</Label>
              <Textarea 
                placeholder="Paste your lecture notes, article, or book excerpt here..." 
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] resize-y"
              />
            </div>
            <Button onClick={() => handleProcess('text')} disabled={isLoading || !text} className="w-full" size="lg">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Use Text
            </Button>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
             <div className="space-y-2">
              <Label>Website URL</Label>
              <Input 
                placeholder="https://en.wikipedia.org/wiki/..." 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">We'll scrape the text from this page to generate questions.</p>
            </div>
            <Button onClick={() => handleProcess('url')} disabled={isLoading || !url} className="w-full" size="lg">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
              Process URL
            </Button>
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
             <div className="space-y-2">
              <Label>YouTube Video URL</Label>
              <Input 
                placeholder="https://www.youtube.com/watch?v=..." 
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">We'll extract the transcript from the video.</p>
            </div>
            <Button onClick={() => handleProcess('video')} disabled={isLoading || !videoUrl} className="w-full" size="lg">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Video className="mr-2 h-4 w-4" />}
              Process Video
            </Button>
          </TabsContent>
        </div>
      </Tabs>

      {/* Success Indicator */}
      {sourceType && !isLoading && (
        <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg flex items-center gap-3 animate-in fade-in zoom-in duration-300">
          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-semibold text-green-800 dark:text-green-300">Content Ready!</h4>
            <p className="text-sm text-green-700 dark:text-green-400">
              Source processed successfully. You can now proceed to configuration.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Icon helper
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
