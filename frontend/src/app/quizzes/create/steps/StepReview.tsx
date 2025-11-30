"use client"

import { useEffect, useState } from "react"
import { useQuizStore, Question } from "@/store/quiz-store"
import { aiService } from "@/services/ai.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { Loader2, Trash2, Plus, RefreshCw, Save } from "lucide-react"
import { toast } from "sonner"

interface StepReviewProps {
  onNext: () => void
}

export default function StepReview({ onNext }: StepReviewProps) {
  const { 
    questions, 
    setQuestions, 
    sourceContent, 
    config, 
    updateQuestion, 
    deleteQuestion, 
    addQuestion,
    isGenerating,
    sourceMetadata
  } = useQuizStore()

  const [localLoading, setLocalLoading] = useState(false)

  // Trigger generation on mount if no questions exist
  useEffect(() => {
    if (questions.length === 0 && sourceContent && !localLoading) {
      generateQuestions()
    }
  }, [])

  const generateQuestions = async () => {
    setLocalLoading(true)
    try {
      const result = await aiService.generateQuestions({
        content: sourceMetadata.processedContent || (sourceContent as string),
        questionDistribution: config.distribution,
        totalQuestions: config.questionCount,
        difficulty: config.difficulty
      })
      
      // Map backend questions to frontend format if needed
      // Assuming backend returns array of questions compatible with our store
      const formattedQuestions = result.questions.map((q: any, index: number) => ({
        ...q,
        id: q.id || `q-${Date.now()}-${index}`, // Ensure ID exists
      }))

      setQuestions(formattedQuestions)
      toast.success(`Generated ${formattedQuestions.length} questions!`)
    } catch (error: any) {
      console.error(error)
      toast.error("Failed to generate questions. Please try again.")
    } finally {
      setLocalLoading(false)
    }
  }

  if (localLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-in fade-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
          <Loader2 className="h-16 w-16 animate-spin text-indigo-600 relative z-10" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">Generating Your Quiz...</h3>
          <p className="text-muted-foreground max-w-md">
            Our AI is analyzing the content and crafting questions based on your configuration. This might take a moment.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Review Questions</h2>
          <p className="text-muted-foreground">Edit, remove, or add questions before finalizing.</p>
        </div>
        <Button variant="outline" onClick={generateQuestions} disabled={localLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Regenerate
        </Button>
      </div>

      <div className="space-y-4">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {questions.map((q, index) => (
            <AccordionItem key={q.id} value={q.id} className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-4 text-left w-full">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">{q.text}</p>
                    <span className="text-xs text-muted-foreground capitalize">{q.type} • {q.points} pts</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6 space-y-4 border-t">
                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <Textarea 
                    value={q.text} 
                    onChange={(e) => updateQuestion(q.id, { text: e.target.value })} 
                  />
                </div>

                {q.type === 'multiple-choice' && q.options && (
                  <div className="space-y-3">
                    <Label>Options (Check correct answer)</Label>
                    {q.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name={`q-${q.id}`} 
                          checked={q.correctAnswer === opt}
                          onChange={() => updateQuestion(q.id, { correctAnswer: opt })}
                          className="h-4 w-4 text-indigo-600"
                        />
                        <Input 
                          value={opt} 
                          onChange={(e) => {
                            const newOptions = [...q.options!];
                            newOptions[i] = e.target.value;
                            // If we changed the correct answer text, update it too
                            const updates: any = { options: newOptions };
                            if (q.correctAnswer === opt) {
                              updates.correctAnswer = e.target.value;
                            }
                            updateQuestion(q.id, updates);
                          }} 
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center pt-4">
                   <div className="flex items-center gap-2">
                     <Label className="whitespace-nowrap">Points:</Label>
                     <Input 
                       type="number" 
                       className="w-20" 
                       value={q.points} 
                       onChange={(e) => updateQuestion(q.id, { points: parseInt(e.target.value) })}
                     />
                   </div>
                   <Button variant="destructive" size="sm" onClick={() => deleteQuestion(q.id)}>
                     <Trash2 className="mr-2 h-4 w-4" />
                     Delete Question
                   </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Button variant="outline" className="w-full border-dashed py-8" onClick={() => {
          addQuestion({
            id: `new-${Date.now()}`,
            text: "New Question",
            type: "multiple-choice",
            options: ["Option 1", "Option 2", "Option 3", "Option 4"],
            correctAnswer: "Option 1",
            points: 1
          })
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Manual Question
        </Button>
      </div>
    </div>
  )
}
