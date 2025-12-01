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
import { Loader2, Save, Calendar as CalendarIcon, FileText, BarChart, Clock, Hash, CheckCircle2 } from "lucide-react"
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
        
        // Map correct answer value back to index if needed by backend?
        // Backend schema says:
        // multipleChoice: Number (index)
        // trueFalse: Boolean
        // fillInBlank: String
        
        let correctAnswer: any = q.correctAnswer;
        
        if (backendType === 'multipleChoice' && q.options) {
          // Find index of correct answer
          const index = q.options.indexOf(q.correctAnswer as string);
          if (index !== -1) correctAnswer = index;
        } else if (backendType === 'trueFalse') {
          // Backend expects Boolean? Schema says Boolean.
          // Frontend has "True"/"False" or similar?
          // Logs showed options: ["True", "False"], correctAnswer: 1 (False)
          // If frontend has "True", map to true? Or index?
          // Let's assume index for consistency with logs if options exist.
          // But schema says `trueFalse: Boolean`.
          // Wait, logs said `questions.0.type: multiple-choice is not a valid enum value`.
          // It didn't complain about correctAnswer.
          // Let's stick to what worked in logs (indices) or try to follow schema.
          // Schema: `correctAnswer: { type: mongoose.Schema.Types.Mixed }`
          // Comments say: `trueFalse: Boolean`.
          // But logs showed `correctAnswer: 1`.
          // Let's try to send index if options exist, otherwise value.
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

      // Prepare source info
      let sourcePayload: any = {};
      // Map frontend source type to backend source type
      // Frontend: 'topic' | 'text' | 'file' | 'url' | 'video'
      // Backend: 'file', 'topic', 'video', 'url'
      // 'text' in frontend should probably map to 'topic' in backend as 'text' is not in backend enum
      
      let backendSourceType = sourceType;
      if (sourceType === 'text') backendSourceType = 'topic'; 
      
      if (backendSourceType) {
        sourcePayload.sourceType = backendSourceType;
        if (backendSourceType === 'topic') sourcePayload.textContent = sourceContent;
        else if (backendSourceType === 'url') sourcePayload.webUrl = sourceMetadata.url || sourceContent;
        else if (backendSourceType === 'video') sourcePayload.videoUrl = sourceMetadata.url || sourceContent;
        // For file, we can't re-upload easily here without the file object. 
        // If it was a file upload, we might need to handle it differently or assume backend has it?
        // But createQuiz endpoint expects file upload in `req.file`.
        // If we already have questions, we might not need to re-upload file if we provide sourceType 'file' and some content string.
        // But backend `create` route checks `req.file` for `sourceType === 'file'`.
        // If `questions` are provided, it goes to `else` block (line 320).
        // `else if (req.file)`...
        // If we don't send file, `sourceInfo` defaults to `text`.
        // So for file source, if we don't re-upload, we might need to fake it as 'topic' with filename?
        // Or just send 'topic' with "Generated from file: filename".
        if (sourceType === 'file') {
           sourcePayload.sourceType = 'topic';
           sourcePayload.textContent = `Generated from file: ${sourceMetadata.filename || 'uploaded file'}`;
        }
      } else {
        // Default to topic if no source
        sourcePayload.sourceType = 'topic';
        sourcePayload.textContent = 'Manual creation';
      }

      const payload = {
        title: details.title,
        description: details.description,
        duration: details.duration,
        expiresAt: date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
        questions: mappedQuestions,
        questionsPerStudent: questions.length,
        ...sourcePayload
      }

      await aiService.createQuiz(payload)
      
      toast.success("Quiz created successfully!")
      reset()
      router.push('/quizzes')
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || "Failed to save quiz")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Finalize Your Quiz
        </h2>
        <p className="text-muted-foreground text-lg">
          Review the details and publish your assessment.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
        {/* Main Form */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
              <CardDescription>
                Provide the essential information for your students.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base">Quiz Title <span className="text-red-500">*</span></Label>
                <Input 
                  id="title" 
                  placeholder="e.g., Advanced Physics Midterm" 
                  value={details.title}
                  onChange={(e) => setDetails({ title: e.target.value })}
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Briefly describe what this quiz covers..." 
                  value={details.description}
                  onChange={(e) => setDetails({ description: e.target.value })}
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-base">Duration (minutes)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="duration" 
                      type="number" 
                      min={1}
                      value={details.duration}
                      onChange={(e) => setDetails({ duration: parseInt(e.target.value) || 0 })}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2 flex flex-col">
                  <Label className="text-base mb-2">Expiration Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-11",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card className="bg-muted/30 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                    <Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">Total Questions</span>
                </div>
                <span className="text-lg font-bold">{questions.length}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-md">
                    <BarChart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="font-medium">Difficulty</span>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {config.difficulty}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-md">
                    <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium">Source Type</span>
                </div>
                <Badge variant="outline" className="capitalize">
                  {/* Assuming sourceType is available in store, otherwise fallback */}
                  AI Generated
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="w-full h-14 text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Publish Quiz
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            By publishing, this quiz will be made available to your students immediately.
          </p>
        </div>
      </div>
    </div>
  )
}
