"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuizStore } from "@/store/quiz-store"
import { aiService } from "@/services/ai.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Save, Calendar as CalendarIcon, FileText, BarChart, Clock, Hash, CheckCircle2, Rocket } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Badge } from "../../../../components/ui/badge"

export default function StepFinalize() {
  const router = useRouter()
  const { details, setDetails, questions, config, reset, sourceType, sourceContent, sourceMetadata } = useQuizStore()
  const [isSaving, setIsSaving] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)

  const handleSave = async () => {
    if (!details.title) {
      toast.error("Please enter a quiz title")
      return
    }

    setIsSaving(true)
    try {
      // Map questions to backend format
      const mappedQuestions = questions.map(q => {
        let backendType = 'multipleChoice';
        if (q.type === 'multiple-choice') backendType = 'multipleChoice';
        else if (q.type === 'true-false') backendType = 'trueFalse';
        else if (q.type === 'fill-in-the-blank') backendType = 'fillInBlank';
        else if (q.type === 'matching') backendType = 'matching';
        
        let correctAnswer: any = q.correctAnswer;
        
        if (backendType === 'multipleChoice' && q.options) {
          const index = q.options.indexOf(q.correctAnswer as string);
          if (index !== -1) correctAnswer = index;
        } else if (backendType === 'trueFalse') {
          if (q.options && typeof q.correctAnswer === 'string') {
             const index = q.options.indexOf(q.correctAnswer);
             if (index !== -1) correctAnswer = index;
          }
        }

        return {
          ...q,
          type: backendType,
          correctAnswer: correctAnswer as any
        };
      });

      let sourcePayload: any = {};
      let backendSourceType = sourceType;
      if (sourceType === 'text') backendSourceType = 'topic'; 
      
      if (backendSourceType) {
        sourcePayload.sourceType = backendSourceType;
        if (backendSourceType === 'topic') sourcePayload.textContent = sourceContent;
        else if (backendSourceType === 'url') sourcePayload.webUrl = sourceMetadata.url || sourceContent;
        else if (backendSourceType === 'video') sourcePayload.videoUrl = sourceMetadata.url || sourceContent;
      }

      const payload = {
        title: details.title,
        description: details.description,
        questions: mappedQuestions,
        config: {
          difficulty: config.difficulty,
          questionCount: config.questionCount,
          questionDistribution: {
            multipleChoice: config.distribution['multiple-choice'],
            trueFalse: config.distribution['true-false'],
            fillInBlank: config.distribution['fill-in-the-blank'],
            matching: config.distribution['matching']
          }
        },
        source: sourcePayload,
        expiresAt: date ? date.toISOString() : undefined
      };

      await aiService.createQuiz(payload)
      toast.success("Quiz created successfully!")
      reset()
      router.push('/quizzes')
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message || "Failed to create quiz")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full animate-in fade-in slide-in-from-right-8 duration-500">
      {/* Left Column: Details */}
      <div className="w-full lg:w-1/2 space-y-4">
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-500" />
              Quiz Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Advanced Photosynthesis Quiz"
                value={details.title}
                onChange={(e) => setDetails({ title: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Briefly describe what this quiz covers..."
                value={details.description}
                onChange={(e) => setDetails({ description: e.target.value })}
                className="min-h-[100px] resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Summary */}
      <div className="w-full lg:w-1/2 flex flex-col gap-4">
        <Card className="border shadow-sm flex-1">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart className="h-4 w-4 text-indigo-500" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Hash className="h-3 w-3" /> Questions
              </p>
              <p className="text-2xl font-bold">{questions.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-3 w-3" /> Est. Time
              </p>
              <p className="text-2xl font-bold">{Math.ceil(questions.length * 1.5)} min</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Difficulty</p>
              <Badge variant="outline" className="capitalize">{config.difficulty}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Source</p>
              <Badge variant="outline" className="capitalize">{sourceType}</Badge>
            </div>
          </CardContent>
          <div className="p-4 border-t bg-muted/20 mt-auto">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full bg-green-600 hover:bg-green-700 text-white" 
              size="lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Publish Quiz
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
