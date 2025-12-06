"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { 
  Trophy, Home, RotateCcw, Clock, Target, CheckCircle2, XCircle,
  Sparkles, Award, TrendingUp, Star
} from "lucide-react"
import confetti from "canvas-confetti"

interface QuizResult {
  score: number
  totalQuestions: number
  timeTaken: number
  quizTitle: string
}

export default function QuizResultPage() {
  const router = useRouter()
  const [result, setResult] = useState<QuizResult | null>(null)
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    // Small delay to ensure sessionStorage is available
    const timer = setTimeout(() => {
      const storedResult = sessionStorage.getItem('quizResult')
      console.log('Reading quizResult from sessionStorage:', storedResult)
      
      if (!storedResult) {
        console.log('No result found, redirecting to join')
        router.push('/join')
        return
      }

      try {
        const parsedResult = JSON.parse(storedResult)
        console.log('Parsed result:', parsedResult)
        setResult(parsedResult)
        
        // Clear result from session after reading
        sessionStorage.removeItem('quizResult')
        sessionStorage.removeItem('quizTitle')
        sessionStorage.removeItem('quizDuration')

        // Trigger animation after a short delay
        setTimeout(() => {
          setShowAnimation(true)
          
          // Trigger confetti for good scores
          const percentage = (parsedResult.score / parsedResult.totalQuestions) * 100
          if (percentage >= 70) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            })
          }
        }, 500)
      } catch (e) {
        console.error('Error parsing result:', e)
        router.push('/join')
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [router])

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="animate-pulse text-muted-foreground">Loading results...</div>
      </div>
    )
  }

  const percentage = Math.round((result.score / result.totalQuestions) * 100)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getGrade = () => {
    if (percentage >= 90) return { grade: 'A', label: 'Excellent!', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-950/50', icon: Trophy }
    if (percentage >= 80) return { grade: 'B', label: 'Great Job!', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950/50', icon: Award }
    if (percentage >= 70) return { grade: 'C', label: 'Good Work!', color: 'text-cyan-600', bgColor: 'bg-cyan-100 dark:bg-cyan-950/50', icon: TrendingUp }
    if (percentage >= 60) return { grade: 'D', label: 'Keep Trying!', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-950/50', icon: Star }
    return { grade: 'F', label: 'Need Improvement', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-950/50', icon: Target }
  }

  const gradeInfo = getGrade()
  const GradeIcon = gradeInfo.icon

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute h-full w-full bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      {percentage >= 70 && (
        <>
          <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-green-500/10 blur-[100px]" />
          <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]" />
        </>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl overflow-hidden">
          {/* Header with gradient */}
          <div className={`relative py-8 px-6 ${gradeInfo.bgColor}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-black/20" />
            <motion.div
              initial={{ scale: 0 }}
              animate={showAnimation ? { scale: 1 } : { scale: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="relative flex flex-col items-center"
            >
              <div className={`h-20 w-20 rounded-full ${gradeInfo.bgColor} flex items-center justify-center mb-4 ring-4 ring-white dark:ring-gray-800 shadow-lg`}>
                <GradeIcon className={`h-10 w-10 ${gradeInfo.color}`} />
              </div>
              <h1 className={`text-4xl font-bold ${gradeInfo.color}`}>{gradeInfo.label}</h1>
              <p className="text-muted-foreground mt-1">{result.quizTitle}</p>
            </motion.div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Score Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={showAnimation ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-200 dark:text-gray-800"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    className={gradeInfo.color}
                    initial={{ strokeDasharray: "0 440" }}
                    animate={showAnimation ? { strokeDasharray: `${(percentage / 100) * 440} 440` } : {}}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={showAnimation ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 1 }}
                    className={`text-5xl font-bold ${gradeInfo.color}`}
                  >
                    {percentage}%
                  </motion.span>
                  <span className="text-sm text-muted-foreground">Score</span>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={showAnimation ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-4"
            >
              <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-950/30">
                <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{result.score}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-950/30">
                <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{result.totalQuestions - result.score}</p>
                <p className="text-xs text-muted-foreground">Incorrect</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30">
                <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{formatTime(result.timeTaken)}</p>
                <p className="text-xs text-muted-foreground">Time</p>
              </div>
            </motion.div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={showAnimation ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.8 }}
              className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50"
            >
              <p className="text-center text-sm text-muted-foreground">
                You answered <span className="font-semibold text-foreground">{result.score}</span> out of{" "}
                <span className="font-semibold text-foreground">{result.totalQuestions}</span> questions correctly.
              </p>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={showAnimation ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => router.push('/join')}
              >
                <RotateCcw className="h-4 w-4" />
                Take Another Quiz
              </Button>
              <Link href="/" className="flex-1">
                <Button className="w-full gap-2">
                  <Home className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </motion.div>
          </CardContent>
        </Card>

        {/* Footer message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={showAnimation ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center text-sm text-muted-foreground mt-6"
        >
          Your results have been submitted to your instructor.
        </motion.p>
      </motion.div>
    </div>
  )
}
