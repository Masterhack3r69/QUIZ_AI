"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Clock, AlertTriangle, ChevronLeft, ChevronRight, Send, Loader2,
  ListChecks, ToggleLeft, TextCursorInput, FileText
} from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Question {
  _id: string
  type: 'multipleChoice' | 'trueFalse' | 'fillInBlank' | 'matching'
  question: string
  options?: string[]
  leftColumn?: string[]
  rightColumn?: string[]
  caseSensitive?: boolean
  // Shuffle mappings from backend
  shuffledCorrectIndex?: number
  rightColumnMapping?: number[]
}

interface QuizData {
  quizId: string
  title: string
  duration: number
  questions: Question[]
}

interface Answer {
  questionId: string
  questionType: string
  selectedAnswer: number | boolean | string | { left: number; right: number }[]
  // Include shuffle mappings for grading
  shuffledCorrectIndex?: number
  rightColumnMapping?: number[]
}

const questionTypeConfig = {
  multipleChoice: { label: 'Multiple Choice', icon: ListChecks, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  trueFalse: { label: 'True / False', icon: ToggleLeft, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/30' },
  fillInBlank: { label: 'Fill in Blank', icon: TextCursorInput, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/30' },
  matching: { label: 'Matching', icon: FileText, color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950/30' }
}

export default function TakeQuizPage() {
  const router = useRouter()
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map())
  const [timeLeft, setTimeLeft] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [startTime] = useState(Date.now())
  const [matchingSelections, setMatchingSelections] = useState<Map<string, Map<number, number>>>(new Map())

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      const accessCode = sessionStorage.getItem('quizAccessCode')
      if (!accessCode) {
        toast.error("No quiz code found. Please enter a code first.")
        router.push('/join')
        return
      }

      try {
        const response = await api.post('/quiz/start', { accessCode })
        setQuizData(response.data)
        setTimeLeft(response.data.duration * 60) // Convert minutes to seconds
      } catch (error: any) {
        const message = error.response?.data?.message || "Failed to load quiz"
        toast.error(message)
        router.push('/join')
      } finally {
        setIsLoading(false)
      }
    }

    loadQuiz()
  }, [router])

  // Timer
  useEffect(() => {
    if (!quizData || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleAutoSubmit()
          return 0
        }
        // Show warning at 1 minute
        if (prev === 60) {
          toast.warning("1 minute remaining!", { duration: 5000 })
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizData])

  const handleAutoSubmit = useCallback(async () => {
    toast.info("Time's up! Submitting your answers...")
    await submitQuiz()
  }, [answers, quizData])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (questionId: string, questionType: string, value: number | boolean | string | { left: number; right: number }[]) => {
    setAnswers(prev => {
      const newAnswers = new Map(prev)
      newAnswers.set(questionId, {
        questionId,
        questionType,
        selectedAnswer: value
      })
      return newAnswers
    })
  }

  const handleMatchingChange = (questionId: string, leftIndex: number, rightIndex: number) => {
    setMatchingSelections(prev => {
      const newSelections = new Map(prev)
      const questionSelections = new Map(newSelections.get(questionId) || new Map())
      
      // Remove any existing selection for this right index
      questionSelections.forEach((right, left) => {
        if (right === rightIndex && left !== leftIndex) {
          questionSelections.delete(left)
        }
      })
      
      questionSelections.set(leftIndex, rightIndex)
      newSelections.set(questionId, questionSelections)
      
      // Update answers
      const pairs = Array.from(questionSelections.entries()).map(([left, right]) => ({ left, right }))
      handleAnswerChange(questionId, 'matching', pairs)
      
      return newSelections
    })
  }

  const submitQuiz = async () => {
    if (!quizData) return

    setIsSubmitting(true)
    const studentInfo = JSON.parse(sessionStorage.getItem('studentInfo') || '{}')
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)

    // Prepare answers array with shuffle mappings for correct grading
    const answersArray = quizData.questions.map(q => {
      const answer = answers.get(q._id)
      const baseAnswer: any = {
        questionId: q._id,
        questionType: q.type,
        selectedAnswer: answer?.selectedAnswer ?? (q.type === 'multipleChoice' ? -1 : q.type === 'trueFalse' ? null : '')
      }
      
      // Include shuffle mappings so backend can grade correctly
      if (q.type === 'multipleChoice' && q.shuffledCorrectIndex !== undefined) {
        baseAnswer.shuffledCorrectIndex = q.shuffledCorrectIndex
      }
      if (q.type === 'matching' && q.rightColumnMapping) {
        baseAnswer.rightColumnMapping = q.rightColumnMapping
      }
      
      return baseAnswer
    })

    try {
      const response = await api.post('/submission/submit', {
        quizId: quizData.quizId,
        studentInfo,
        answers: answersArray,
        timeTaken
      })

      console.log('Submission response:', response.data)

      // Store result in sessionStorage and navigate to results
      const resultData = {
        score: response.data.score,
        totalQuestions: response.data.totalQuestions,
        timeTaken,
        quizTitle: quizData.title
      }
      
      sessionStorage.setItem('quizResult', JSON.stringify(resultData))
      console.log('Stored result:', resultData)
      
      // Clear quiz session data
      sessionStorage.removeItem('quizAccessCode')
      sessionStorage.removeItem('studentInfo')
      
      // Use window.location for more reliable navigation
      window.location.href = '/quiz-result'
    } catch (error: any) {
      console.error('Submission error:', error)
      const message = error.response?.data?.message || "Failed to submit quiz"
      toast.error(message)
      setIsSubmitting(false)
    }
  }

  const handleSubmit = () => {
    const unanswered = quizData!.questions.filter(q => !answers.has(q._id)).length
    if (unanswered > 0) {
      setShowSubmitDialog(true)
    } else {
      submitQuiz()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (!quizData) return null

  const currentQuestion = quizData.questions[currentIndex]
  const progress = ((currentIndex + 1) / quizData.questions.length) * 100
  const answeredCount = answers.size
  const config = questionTypeConfig[currentQuestion.type] || questionTypeConfig.multipleChoice
  const Icon = config.icon

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-lg truncate max-w-[200px] md:max-w-none">{quizData.title}</h1>
              <p className="text-sm text-muted-foreground">
                Question {currentIndex + 1} of {quizData.questions.length}
              </p>
            </div>
            
            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-bold ${
              timeLeft <= 60 
                ? 'bg-red-100 dark:bg-red-950/50 text-red-600 animate-pulse' 
                : timeLeft <= 300 
                  ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}>
              <Clock className="h-5 w-5" />
              {formatTime(timeLeft)}
            </div>
          </div>
          <Progress value={progress} className="mt-3 h-2" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {config.label}
                  </span>
                </div>
                <CardTitle className="text-xl leading-relaxed">
                  {currentQuestion.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Multiple Choice */}
                {currentQuestion.type === 'multipleChoice' && currentQuestion.options && (
                  <RadioGroup
                    value={answers.get(currentQuestion._id)?.selectedAnswer?.toString() ?? ''}
                    onValueChange={(value) => handleAnswerChange(currentQuestion._id, 'multipleChoice', parseInt(value))}
                    className="space-y-3"
                  >
                    {currentQuestion.options.map((option, idx) => (
                      <Label
                        key={idx}
                        htmlFor={`option-${idx}`}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          answers.get(currentQuestion._id)?.selectedAnswer === idx
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 dark:border-gray-800 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-900'
                        }`}
                      >
                        <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                        <span className="flex-1">{option}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                )}

                {/* True/False */}
                {currentQuestion.type === 'trueFalse' && (
                  <RadioGroup
                    value={answers.get(currentQuestion._id)?.selectedAnswer?.toString() ?? ''}
                    onValueChange={(value) => handleAnswerChange(currentQuestion._id, 'trueFalse', value === 'true')}
                    className="grid grid-cols-2 gap-4"
                  >
                    {[true, false].map((value) => (
                      <Label
                        key={value.toString()}
                        htmlFor={`tf-${value}`}
                        className={`flex items-center justify-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all ${
                          answers.get(currentQuestion._id)?.selectedAnswer === value
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 dark:border-gray-800 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-900'
                        }`}
                      >
                        <RadioGroupItem value={value.toString()} id={`tf-${value}`} />
                        <span className="text-lg font-medium">{value ? 'True' : 'False'}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                )}

                {/* Fill in Blank */}
                {currentQuestion.type === 'fillInBlank' && (
                  <div className="space-y-3">
                    <Input
                      placeholder="Type your answer here..."
                      value={(answers.get(currentQuestion._id)?.selectedAnswer as string) ?? ''}
                      onChange={(e) => handleAnswerChange(currentQuestion._id, 'fillInBlank', e.target.value)}
                      className="text-lg h-14"
                    />
                    {currentQuestion.caseSensitive && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        This answer is case-sensitive
                      </p>
                    )}
                  </div>
                )}

                {/* Matching */}
                {currentQuestion.type === 'matching' && currentQuestion.leftColumn && currentQuestion.rightColumn && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Match items from the left column to the right column</p>
                    <div className="space-y-3">
                      {currentQuestion.leftColumn.map((leftItem, leftIdx) => {
                        const questionSelections = matchingSelections.get(currentQuestion._id) || new Map()
                        const selectedRight = questionSelections.get(leftIdx)
                        
                        return (
                          <div key={leftIdx} className="flex items-center gap-4">
                            <div className="flex-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 font-medium">
                              {leftItem}
                            </div>
                            <select
                              value={selectedRight ?? ''}
                              onChange={(e) => handleMatchingChange(currentQuestion._id, leftIdx, parseInt(e.target.value))}
                              className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                            >
                              <option value="">Select match...</option>
                              {currentQuestion.rightColumn!.map((rightItem, rightIdx) => (
                                <option key={rightIdx} value={rightIdx}>
                                  {rightItem}
                                </option>
                              ))}
                            </select>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {answeredCount}/{quizData.questions.length} answered
            </span>
          </div>

          {currentIndex < quizData.questions.length - 1 ? (
            <Button
              onClick={() => setCurrentIndex(prev => Math.min(quizData.questions.length - 1, prev + 1))}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Quiz
                </>
              )}
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <Card className="mt-6 p-4">
          <p className="text-sm font-medium mb-3">Question Navigator</p>
          <div className="flex flex-wrap gap-2">
            {quizData.questions.map((q, idx) => (
              <button
                key={q._id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-9 w-9 rounded-lg text-sm font-medium transition-all ${
                  idx === currentIndex
                    ? 'bg-primary text-primary-foreground'
                    : answers.has(q._id)
                      ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </Card>
      </main>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              You have {quizData.questions.length - answeredCount} unanswered question(s). 
              Are you sure you want to submit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={submitQuiz} className="bg-green-600 hover:bg-green-700">
              Submit Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
