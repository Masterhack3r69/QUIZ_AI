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
import { Badge } from "../../../../components/ui/badge"
import { Loader2, Trash2, Plus, RefreshCw, Save, Check, Edit2, AlertCircle, X } from "lucide-react"
import { toast } from "sonner"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

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
      
      const formattedQuestions = result.questions.map((q: any, index: number) => {
        // Map backend type to frontend type
        let type = q.type;
        if (q.type === 'multipleChoice') type = 'multiple-choice';
        else if (q.type === 'trueFalse') type = 'true-false';
        else if (q.type === 'fillInBlank') type = 'fill-in-the-blank';

        // Map correct answer index to value if needed
        let correctAnswer = q.correctAnswer;
        if (typeof q.correctAnswer === 'number' && q.options && Array.isArray(q.options)) {
          correctAnswer = q.options[q.correctAnswer];
        } else if (type === 'true-false' && typeof q.correctAnswer === 'number') {
           if (q.options && Array.isArray(q.options)) {
             correctAnswer = q.options[q.correctAnswer];
           }
        }

        return {
          ...q,
          id: q.id || `q-${Date.now()}-${index}`,
          text: q.question || q.text, // Handle both 'question' and 'text'
          type: type,
          correctAnswer: correctAnswer,
          points: q.points || 1
        };
      })

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
      <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in fade-in duration-500 min-h-[400px]">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
          <div className="relative bg-background p-4 rounded-full shadow-xl border-2 border-indigo-100 dark:border-indigo-900">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          </div>
        </div>
        <div className="text-center space-y-3 max-w-md">
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Crafting Your Quiz...
          </h3>
          <p className="text-muted-foreground">
            Our AI is analyzing the content and generating {config.questionCount} {config.difficulty} questions for you.
          </p>
        </div>
      </div>
    )
  }

  const totalPoints = questions.reduce((acc, q) => acc + (q.points || 1), 0)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Review Questions</h2>
          <p className="text-muted-foreground">Edit, remove, or add questions before finalizing.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateQuestions} disabled={localLoading} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
          <Button onClick={() => {
            addQuestion({
              id: `new-${Date.now()}`,
              text: "New Question",
              type: "multiple-choice",
              options: ["Option 1", "Option 2", "Option 3", "Option 4"],
              correctAnswer: "Option 1",
              points: 1
            })
            toast.success("New question added")
          }} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Questions List */}
        <div className="lg:col-span-2 space-y-4">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {questions.map((q, index) => (
              <AccordionItem key={q.id} value={q.id} className="border rounded-xl px-4 bg-card shadow-sm hover:shadow-md transition-shadow">
                <AccordionTrigger className="hover:no-underline py-4 group">
                  <div className="flex items-start gap-4 text-left w-full pr-4">
                    <span className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors",
                      "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40"
                    )}>
                      {index + 1}
                    </span>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium line-clamp-2 leading-snug">{q.text}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="capitalize text-[10px] px-1.5 h-5">
                          {q.type.replace(/-/g, ' ')}
                        </Badge>
                        <span>•</span>
                        <span>{q.points} points</span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-6 border-t mt-2">
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Question Text</Label>
                    <Textarea 
                      value={q.text} 
                      onChange={(e) => updateQuestion(q.id, { text: e.target.value })} 
                      className="resize-y min-h-[80px] text-base"
                    />
                  </div>

                  {q.type === 'multiple-choice' && q.options && (
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Options</Label>
                      <div className="grid gap-3">
                        {q.options.map((opt, i) => (
                          <div key={i} className={cn(
                            "flex items-center gap-3 p-2 rounded-lg border transition-colors",
                            q.correctAnswer === opt ? "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900" : "bg-background"
                          )}>
                            <div className="relative flex items-center justify-center">
                              <input 
                                type="radio" 
                                name={`q-${q.id}`} 
                                checked={q.correctAnswer === opt}
                                onChange={() => updateQuestion(q.id, { correctAnswer: opt })}
                                className="peer h-5 w-5 text-indigo-600 cursor-pointer appearance-none rounded-full border border-muted-foreground checked:border-green-600 checked:bg-green-600"
                              />
                              <Check className="absolute h-3 w-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" />
                            </div>
                            <Input 
                              value={opt} 
                              onChange={(e) => {
                                const newOptions = [...q.options!];
                                newOptions[i] = e.target.value;
                                const updates: any = { options: newOptions };
                                if (q.correctAnswer === opt) {
                                  updates.correctAnswer = e.target.value;
                                }
                                updateQuestion(q.id, updates);
                              }}
                              className="border-none shadow-none focus-visible:ring-0 bg-transparent h-auto py-1 px-0" 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {q.type === 'true-false' && (
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Correct Answer</Label>
                      <RadioGroup 
                        value={String(q.correctAnswer)} 
                        onValueChange={(val) => updateQuestion(q.id, { correctAnswer: val === 'true' })}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2 border p-3 rounded-lg flex-1 hover:bg-accent/50 transition-colors">
                          <RadioGroupItem value="true" id={`t-${q.id}`} />
                          <Label htmlFor={`t-${q.id}`} className="cursor-pointer flex-1">True</Label>
                        </div>
                        <div className="flex items-center space-x-2 border p-3 rounded-lg flex-1 hover:bg-accent/50 transition-colors">
                          <RadioGroupItem value="false" id={`f-${q.id}`} />
                          <Label htmlFor={`f-${q.id}`} className="cursor-pointer flex-1">False</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  {q.type === 'fill-in-the-blank' && (
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Correct Answer</Label>
                      <Input 
                        value={q.correctAnswer as string} 
                        onChange={(e) => updateQuestion(q.id, { correctAnswer: e.target.value })}
                        placeholder="Enter the correct answer..."
                        className="text-base"
                      />
                    </div>
                  )}



                  {q.type === 'matching' && q.correctPairs && q.leftColumn && q.rightColumn && (
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Matching Pairs</Label>
                      <div className="grid gap-3">
                        <div className="grid grid-cols-2 gap-4 px-1">
                          <Label className="text-xs text-muted-foreground">Left Item</Label>
                          <Label className="text-xs text-muted-foreground">Right Match</Label>
                        </div>
                        {q.correctPairs.map((pair, idx) => (
                          <div key={idx} className="grid grid-cols-2 gap-4 items-center">
                            <Input
                              value={q.leftColumn![pair.left]}
                              onChange={(e) => {
                                const newLeft = [...q.leftColumn!];
                                newLeft[pair.left] = e.target.value;
                                updateQuestion(q.id, { leftColumn: newLeft });
                              }}
                              placeholder="Left item"
                            />
                            <Input
                              value={q.rightColumn![pair.right]}
                              onChange={(e) => {
                                const newRight = [...q.rightColumn!];
                                newRight[pair.right] = e.target.value;
                                updateQuestion(q.id, { rightColumn: newRight });
                              }}
                              placeholder="Right match"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                     <div className="flex items-center gap-3">
                       <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Points</Label>
                       <Input 
                         type="number" 
                         min={1}
                         className="w-20 h-9" 
                         value={q.points} 
                         onChange={(e) => updateQuestion(q.id, { points: parseInt(e.target.value) || 1 })}
                       />
                     </div>
                     <Button variant="ghost" size="sm" onClick={() => deleteQuestion(q.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                       <Trash2 className="mr-2 h-4 w-4" />
                       Delete
                     </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Sticky Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <Card className="border-2 border-muted/50 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg">Quiz Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Questions</span>
                    <span className="font-bold text-lg">{questions.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Points</span>
                    <span className="font-bold text-lg">{totalPoints}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Difficulty</span>
                    <Badge variant="outline" className="capitalize">{config.difficulty}</Badge>
                  </div>
                </div>

                {questions.length === 0 && (
                  <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-sm flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>No questions generated yet. Try regenerating or adding manually.</p>
                  </div>
                )}

                <Button onClick={onNext} className="w-full h-12 text-base shadow-lg shadow-primary/20" disabled={questions.length === 0}>
                  Proceed to Finalize
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
