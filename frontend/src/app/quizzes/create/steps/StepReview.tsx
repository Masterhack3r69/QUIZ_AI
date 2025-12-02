"use client"

import { useEffect, useState } from "react"
import { useQuizStore, Question } from "@/store/quiz-store"
import { aiService } from "@/services/ai.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Check, 
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  GripVertical,
  ListChecks,
  ToggleLeft,
  PenLine,
  Link2
} from "lucide-react"
import { toast } from "sonner"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const typeIcons: Record<string, any> = {
  'multiple-choice': ListChecks,
  'true-false': ToggleLeft,
  'fill-in-the-blank': PenLine,
  'matching': Link2
}

const typeColors: Record<string, string> = {
  'multiple-choice': 'from-blue-500 to-indigo-500',
  'true-false': 'from-emerald-500 to-teal-500',
  'fill-in-the-blank': 'from-orange-500 to-amber-500',
  'matching': 'from-pink-500 to-rose-500'
}

export default function StepReview() {
  const { 
    questions, 
    setQuestions, 
    sourceContent, 
    config, 
    updateQuestion, 
    deleteQuestion, 
    addQuestion,
    sourceMetadata
  } = useQuizStore()

  const [localLoading, setLocalLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
        let type = q.type;
        if (q.type === 'multipleChoice') type = 'multiple-choice';
        else if (q.type === 'trueFalse') type = 'true-false';
        else if (q.type === 'fillInBlank') type = 'fill-in-the-blank';

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
          text: q.question || q.text,
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
      <div className="flex flex-col items-center justify-center py-16 space-y-6 min-h-[400px]">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-2xl opacity-30 rounded-full animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-xl shadow-indigo-500/25">
            <Loader2 className="h-10 w-10 animate-spin text-white" />
          </div>
        </div>
        <div className="text-center space-y-2 max-w-sm">
          <h3 className="text-xl font-bold">Generating Questions...</h3>
          <p className="text-muted-foreground text-sm">
            AI is creating {config.questionCount} {config.difficulty} questions
          </p>
        </div>
      </div>
    )
  }

  const totalPoints = questions.reduce((acc, q) => acc + (q.points || 1), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-2">
            <Sparkles className="h-3 w-3" />
            Step 3 of 4
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Review Questions</h2>
          <p className="text-muted-foreground text-sm">Edit or remove questions before publishing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateQuestions} disabled={localLoading} className="gap-2 rounded-xl h-10">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Regenerate</span>
          </Button>
          <Button 
            onClick={() => {
              addQuestion({
                id: `new-${Date.now()}`,
                text: "New Question",
                type: "multiple-choice",
                options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                correctAnswer: "Option 1",
                points: 1
              })
              toast.success("Question added")
            }} 
            className="gap-2 rounded-xl h-10 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-0"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {questions.map((q, index) => {
              const Icon = typeIcons[q.type] || ListChecks
              const isExpanded = expandedId === q.id
              
              return (
                <motion.div
                  key={q.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={cn(
                    "rounded-xl border bg-white dark:bg-slate-800/50 overflow-hidden transition-shadow shadow-sm",
                    isExpanded ? "shadow-lg border-indigo-300 dark:border-indigo-800" : "border-slate-200 dark:border-slate-700 hover:shadow-md"
                  )}
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="w-full p-4 flex items-start gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-gradient-to-br shadow-sm", typeColors[q.type] || 'from-slate-500 to-slate-600')}>
                        <span className="text-white">{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2 leading-relaxed">{q.text}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5 capitalize">
                          <Icon className="h-3 w-3 mr-1" />
                          {q.type.replace(/-/g, ' ')}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{q.points} pts</span>
                      </div>
                    </div>
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", isExpanded ? "bg-indigo-100 dark:bg-indigo-900/30" : "bg-slate-100 dark:bg-slate-700")}>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-indigo-500" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="p-4 pt-0 space-y-4 border-t border-slate-100 dark:border-slate-700/50">
                          <div className="space-y-2 pt-4">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Question</Label>
                            <Textarea value={q.text} onChange={(e) => updateQuestion(q.id, { text: e.target.value })} className="resize-none min-h-[80px] text-sm rounded-lg" />
                          </div>

                          {q.type === 'multiple-choice' && q.options && (
                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Options</Label>
                              <div className="space-y-2">
                                {q.options.map((opt, i) => (
                                  <div key={i} className={cn("flex items-center gap-3 p-3 rounded-lg border transition-all", q.correctAnswer === opt ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800" : "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700")}>
                                    <button onClick={() => updateQuestion(q.id, { correctAnswer: opt })} className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0", q.correctAnswer === opt ? "border-emerald-500 bg-emerald-500" : "border-slate-300 dark:border-slate-600 hover:border-emerald-400")}>
                                      {q.correctAnswer === opt && <Check className="h-3 w-3 text-white" />}
                                    </button>
                                    <Input value={opt} onChange={(e) => { const newOptions = [...q.options!]; newOptions[i] = e.target.value; const updates: any = { options: newOptions }; if (q.correctAnswer === opt) { updates.correctAnswer = e.target.value; } updateQuestion(q.id, updates); }} className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-auto py-0 px-0 text-sm" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {q.type === 'true-false' && (
                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Correct Answer</Label>
                              <RadioGroup value={String(q.correctAnswer)} onValueChange={(val) => updateQuestion(q.id, { correctAnswer: val === 'true' })} className="flex gap-3">
                                {['true', 'false'].map((val) => (
                                  <div key={val} className={cn("flex-1 flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer", String(q.correctAnswer) === val ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800" : "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:border-slate-300")}>
                                    <RadioGroupItem value={val} id={`${q.id}-${val}`} />
                                    <Label htmlFor={`${q.id}-${val}`} className="cursor-pointer capitalize text-sm">{val}</Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                          )}

                          {q.type === 'fill-in-the-blank' && (
                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Correct Answer</Label>
                              <Input value={q.correctAnswer as string} onChange={(e) => updateQuestion(q.id, { correctAnswer: e.target.value })} placeholder="Enter the correct answer..." className="rounded-lg" />
                            </div>
                          )}

                          {q.type === 'matching' && q.correctPairs && q.leftColumn && q.rightColumn && (
                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Matching Pairs</Label>
                              <div className="space-y-2">
                                {q.correctPairs.map((pair, idx) => (
                                  <div key={idx} className="grid grid-cols-2 gap-3">
                                    <Input value={q.leftColumn![pair.left]} onChange={(e) => { const newLeft = [...q.leftColumn!]; newLeft[pair.left] = e.target.value; updateQuestion(q.id, { leftColumn: newLeft }); }} placeholder="Left item" className="rounded-lg text-sm" />
                                    <Input value={q.rightColumn![pair.right]} onChange={(e) => { const newRight = [...q.rightColumn!]; newRight[pair.right] = e.target.value; updateQuestion(q.id, { rightColumn: newRight }); }} placeholder="Right match" className="rounded-lg text-sm" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs text-muted-foreground">Points:</Label>
                              <Input type="number" min={1} className="w-16 h-8 text-sm rounded-lg" value={q.points} onChange={(e) => updateQuestion(q.id, { points: parseInt(e.target.value) || 1 })} />
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => deleteQuestion(q.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {questions.length === 0 && (
            <div className="text-center py-12 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No questions yet</p>
              <Button variant="outline" onClick={generateQuestions} className="mt-4 rounded-xl">Generate Questions</Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/80">
                <h3 className="font-semibold text-sm">Quiz Summary</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Questions</span>
                  <span className="text-2xl font-bold">{questions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Points</span>
                  <span className="text-2xl font-bold">{totalPoints}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Difficulty</span>
                  <Badge variant="outline" className="capitalize">{config.difficulty}</Badge>
                </div>
                
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50">
                  <p className="text-xs text-muted-foreground mb-2">By Type</p>
                  <div className="space-y-1.5">
                    {Object.entries(questions.reduce((acc, q) => { acc[q.type] = (acc[q.type] || 0) + 1; return acc }, {} as Record<string, number>)).map(([type, count]) => {
                      const Icon = typeIcons[type] || ListChecks
                      return (
                        <div key={type} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-muted-foreground capitalize"><Icon className="h-3 w-3" />{type.replace(/-/g, ' ')}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {questions.length > 0 && (
              <Button onClick={onNext} className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-0 shadow-lg shadow-indigo-500/25">
                Continue to Publish
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
