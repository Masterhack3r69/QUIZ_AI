"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuizStore } from "@/store/quiz-store"
import { aiService } from "@/services/ai.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Loader2, 
  Calendar as CalendarIcon, 
  FileText, 
  BarChart, 
  Clock, 
  Hash, 
  Rocket,
  Sparkles,
  CheckCircle2,
  ListChecks,
  ToggleLeft,
  PenLine,
  Link2,
  Trophy
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

const typeIcons: Record<string, any> = {
  'multiple-choice': ListChecks,
  'true-false': ToggleLeft,
  'fill-in-the-blank': PenLine,
  'matching': Link2
}

export default function StepFinalize() {
  const router = useRouter()
  const { details, setDetails, questions, config, reset, sourceType, sourceContent, sourceMetadata } = useQuizStore()
  const [isSaving, setIsSaving] = useState(false)
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [duration, setDuration] = useState<number>(Math.max(5, Math.ceil(questions.length * 1.5)))

  const handleSave = async () => {
    if (!details.title) {
      toast.error("Please enter a quiz title")
      return
    }

    if (!dueDate) {
      toast.error("Please select a due date")
      return
    }

    if (!duration || duration < 1) {
      toast.error("Please enter a valid duration")
      return
    }

    // Validate start date is before due date if provided
    if (startDate && dueDate && startDate >= dueDate) {
      toast.error("Start date must be before due date")
      return
    }

    setIsSaving(true)
    try {
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

      // Map sourceType - 'text' should be 'topic' for backend
      let backendSourceType = sourceType;
      if (sourceType === 'text') backendSourceType = 'topic';

      const payload: any = {
        title: details.title,
        description: details.description,
        questions: mappedQuestions,
        questionsPerStudent: mappedQuestions.length,
        duration: duration,
        questionDistribution: {
          multipleChoice: config.distribution['multiple-choice'] || 0,
          trueFalse: config.distribution['true-false'] || 0,
          fillInBlank: config.distribution['fill-in-the-blank'] || 0,
          matching: config.distribution['matching'] || 0
        },
        expiresAt: dueDate!.toISOString(),
        startDate: startDate ? startDate.toISOString() : undefined,
        sourceType: backendSourceType
      };

      // Add source-specific fields
      if (backendSourceType === 'topic') {
        payload.textContent = sourceContent;
      } else if (backendSourceType === 'url') {
        payload.webUrl = sourceMetadata?.url || sourceContent;
      } else if (backendSourceType === 'video') {
        payload.videoUrl = sourceMetadata?.url || sourceContent;
      }

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

  const totalPoints = questions.reduce((acc, q) => acc + (q.points || 1), 0)

  const questionsByType = questions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-2">
          <Sparkles className="h-3 w-3" />
          Final Step
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Publish Your Quiz</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Add final details and publish your quiz
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Column - Details Form */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Quiz Details</h3>
                <p className="text-xs text-muted-foreground">Give your quiz a name and description</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Advanced Photosynthesis Quiz"
                  value={details.title}
                  onChange={(e) => setDetails({ title: e.target.value })}
                  className="h-12 text-base rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Briefly describe what this quiz covers..."
                  value={details.description}
                  onChange={(e) => setDetails({ description: e.target.value })}
                  className="min-h-[100px] resize-none rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium">
                  Duration (minutes) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    placeholder="e.g., 30"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                    className="h-12 pl-11 text-base rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
                <p className="text-xs text-muted-foreground">How long students have to complete the quiz</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Start Date <span className="text-muted-foreground text-xs">(optional)</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5" />
                        {startDate ? format(startDate, "PPP") : "Select start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Due Date <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
                          !dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5" />
                        {dueDate ? format(dueDate, "PPP") : "Select due date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                        disabled={(date) => {
                          const today = new Date(new Date().setHours(0, 0, 0, 0))
                          if (startDate) {
                            return date <= startDate
                          }
                          return date < today
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 space-y-4">
            {/* Stats Card */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                <div className="flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-indigo-500" />
                  <h3 className="font-semibold text-sm">Quiz Summary</h3>
                </div>
              </div>
              
              <div className="p-4">
                {/* Main Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/50"
                  >
                    <Hash className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{questions.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Questions</p>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-100 dark:border-amber-900/50"
                  >
                    <Trophy className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{totalPoints}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Points</p>
                  </motion.div>
                </div>

                {/* Additional Info */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Duration
                    </span>
                    <span className="font-medium">{duration} min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Difficulty</span>
                    <Badge variant="outline" className="capitalize">{config.difficulty}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Source</span>
                    <Badge variant="outline" className="capitalize">{sourceType}</Badge>
                  </div>
                </div>

                {/* Question Types */}
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/50">
                  <p className="text-xs text-muted-foreground mb-2">Question Types</p>
                  <div className="space-y-1.5">
                    {Object.entries(questionsByType).map(([type, count]) => {
                      const Icon = typeIcons[type] || ListChecks
                      return (
                        <div key={type} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-muted-foreground capitalize">
                            <Icon className="h-3 w-3" />
                            {type.replace(/-/g, ' ')}
                          </span>
                          <span className="font-medium">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Publish Button */}
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !details.title || !dueDate || !duration}
              className={cn(
                "w-full h-14 text-base font-semibold rounded-xl transition-all",
                "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600",
                "text-white shadow-lg shadow-emerald-500/25 border-0"
              )}
              size="lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-5 w-5" />
                  Publish Quiz
                </>
              )}
            </Button>

            {/* Ready Indicator */}
            {details.title && dueDate && duration > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 justify-center text-emerald-600 dark:text-emerald-400 text-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Ready to publish</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
