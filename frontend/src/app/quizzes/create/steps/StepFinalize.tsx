"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuizStore } from "@/store/quiz-store"
import { aiService } from "@/services/ai.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Save, Calendar as CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export default function StepFinalize() {
  const router = useRouter()
  const { details, setDetails, questions, reset } = useQuizStore()
  const [isSaving, setIsSaving] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)

  const handleSave = async () => {
    if (!details.title) {
      toast.error("Please enter a quiz title")
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        title: details.title,
        description: details.description,
        duration: details.duration,
        expiresAt: date,
        questions: questions,
        // Add other necessary fields if required by backend
        questionsPerStudent: questions.length, // Or configurable
      }

      await aiService.createQuiz(payload)
      
      toast.success("Quiz created successfully!")
      reset() // Reset store
      router.push('/quizzes') // Redirect to library
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
        <h2 className="text-2xl font-bold">Finalize Your Quiz</h2>
        <p className="text-muted-foreground">Add final details and publish your assessment.</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Quiz Title</Label>
          <Input 
            id="title" 
            placeholder="e.g., Advanced Physics Midterm" 
            value={details.title}
            onChange={(e) => setDetails({ title: e.target.value })}
            className="h-12 text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea 
            id="description" 
            placeholder="Briefly describe what this quiz covers..." 
            value={details.description}
            onChange={(e) => setDetails({ description: e.target.value })}
            className="min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input 
              id="duration" 
              type="number" 
              min={1}
              value={details.duration}
              onChange={(e) => setDetails({ duration: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2 flex flex-col">
            <Label className="mb-2">Expiration Date (Optional)</Label>
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
        </div>

        <div className="pt-8">
          <Button onClick={handleSave} disabled={isSaving} className="w-full h-12 text-lg shadow-xl shadow-primary/20">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Publishing Quiz...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Publish Quiz
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
