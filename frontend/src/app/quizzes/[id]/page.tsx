"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { quizService, QuestionStat, SubmissionSummary } from "@/services/quiz.service"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Loader2, ArrowLeft, Users, Clock, Hash, KeyRound, BarChart3, TrendingDown, TrendingUp, 
  AlertTriangle, CheckCircle2, Brain, Sparkles, Target, Award, Timer, FileText, ListChecks,
  ToggleLeft, TextCursorInput, CalendarDays, Eye, Pencil, ChevronRight, Lightbulb, 
  AlertCircle, ThumbsUp, ThumbsDown, User, Percent
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { CopyButton } from "@/components/ui/shadcn-io/copy-button"
import { toast } from "sonner"

const statusConfig = {
  active: { label: "Active", bgColor: "bg-green-50 dark:bg-green-950/30", textColor: "text-green-700 dark:text-green-400", dotColor: "bg-green-500", gradient: "from-green-500 to-emerald-600" },
  scheduled: { label: "Scheduled", bgColor: "bg-amber-50 dark:bg-amber-950/30", textColor: "text-amber-700 dark:text-amber-400", dotColor: "bg-amber-500", gradient: "from-amber-500 to-orange-600" },
  expired: { label: "Expired", bgColor: "bg-gray-100 dark:bg-gray-800/50", textColor: "text-gray-600 dark:text-gray-400", dotColor: "bg-gray-400", gradient: "from-gray-400 to-gray-500" },
  draft: { label: "Draft", bgColor: "bg-blue-50 dark:bg-blue-950/30", textColor: "text-blue-700 dark:text-blue-400", dotColor: "bg-blue-500", gradient: "from-blue-500 to-indigo-600" },
  full: { label: "Full", bgColor: "bg-purple-50 dark:bg-purple-950/30", textColor: "text-purple-700 dark:text-purple-400", dotColor: "bg-purple-500", gradient: "from-purple-500 to-pink-600" },
}

const questionTypeConfig = {
  multipleChoice: { label: 'Multiple Choice', icon: ListChecks, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30', borderColor: 'border-l-blue-500' },
  trueFalse: { label: 'True / False', icon: ToggleLeft, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/30', borderColor: 'border-l-green-500' },
  fillInBlank: { label: 'Fill in Blank', icon: TextCursorInput, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/30', borderColor: 'border-l-purple-500' },
  matching: { label: 'Matching', icon: FileText, color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950/30', borderColor: 'border-l-orange-500' }
}

function StatCard({ icon: Icon, label, value, subValue, gradient, iconColor }: { 
  icon: React.ElementType
  label: string
  value: string | number
  subValue?: string
  gradient: string
  iconColor?: string
}) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.08] group-hover:opacity-[0.12] transition-opacity`} />
      {/* Large background icon */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.08] group-hover:opacity-[0.12] transition-opacity">
        <Icon className={`h-32 w-32 ${iconColor || 'text-gray-900 dark:text-white'}`} />
      </div>
      <CardContent className="p-5 relative z-10">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function QuestionAnalysisCard({ stat, index }: { stat: QuestionStat; index: number }) {
  const accuracy = stat.accuracyRate
  const config = questionTypeConfig[stat.questionType as keyof typeof questionTypeConfig] || questionTypeConfig.multipleChoice
  const Icon = config.icon
  
  return (
    <Card className={`relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 ${config.borderColor}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <div className={`h-10 w-10 rounded-xl ${config.bgColor} flex items-center justify-center`}>
              <span className="text-sm font-bold text-gray-600 dark:text-gray-300">#{index + 1}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <p className="font-medium text-sm leading-relaxed line-clamp-2">{stat.question}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary" className={`${config.bgColor} ${config.color} border-0 gap-1`}>
                <Icon className="h-3 w-3" />
                {config.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {stat.correctCount}/{stat.totalAttempts} correct
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Accuracy</span>
                <span className={`font-semibold ${
                  accuracy >= 75 ? 'text-green-600' : accuracy >= 50 ? 'text-amber-600' : 'text-red-600'
                }`}>{accuracy.toFixed(0)}%</span>
              </div>
              <Progress 
                value={accuracy} 
                className={`h-2 ${
                  accuracy >= 75 ? '[&>div]:bg-green-500' : accuracy >= 50 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'
                }`}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SubmissionRow({ submission, index }: { submission: SubmissionSummary; index: number }) {
  const percentage = parseFloat(submission.percentage)
  
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-200">
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{submission.studentName}</p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(submission.submittedAt), "MMM d, yyyy 'at' h:mm a")}
        </p>
      </div>
      <div className="text-right">
        <p className={`text-lg font-bold ${
          percentage >= 75 ? 'text-green-600' : percentage >= 50 ? 'text-amber-600' : 'text-red-600'
        }`}>
          {submission.score}/{submission.totalQuestions}
        </p>
        <p className="text-xs text-muted-foreground">{submission.percentage}%</p>
      </div>
      {submission.timeTaken && (
        <div className="text-right pl-4 border-l">
          <p className="text-sm font-medium">{Math.floor(submission.timeTaken / 60)}:{(submission.timeTaken % 60).toString().padStart(2, '0')}</p>
          <p className="text-xs text-muted-foreground">Time</p>
        </div>
      )}
    </div>
  )
}

function AIInsightsCard({ quizId }: { quizId: string }) {
  const { data: aiAnalysis, isLoading, error } = useQuery({
    queryKey: ['ai-analysis', quizId],
    queryFn: () => quizService.getAIAnalysis(quizId),
    retry: false
  })

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5" />
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Insights</CardTitle>
              <CardDescription>Analyzing quiz performance...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </CardContent>
      </Card>
    )
  }

  if (error || !aiAnalysis) {
    return (
      <Card className="border-0 shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5" />
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Insights</CardTitle>
              <CardDescription>Intelligent analysis of quiz performance</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Not enough data for AI analysis yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Need more submissions to generate insights.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5" />
      <CardHeader className="pb-4 relative">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              AI Insights
              <Sparkles className="h-4 w-4 text-violet-500" />
            </CardTitle>
            <CardDescription>Intelligent analysis of quiz performance</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 relative">
        <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900">
          <p className="text-sm leading-relaxed">{aiAnalysis.overallInsights}</p>
        </div>

        {aiAnalysis.strengthAreas.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-green-600" />
              <h4 className="font-semibold text-sm">Strengths</h4>
            </div>
            <div className="space-y-2">
              {aiAnalysis.strengthAreas.map((strength, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {aiAnalysis.weaknessAreas.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ThumbsDown className="h-4 w-4 text-red-600" />
              <h4 className="font-semibold text-sm">Areas for Improvement</h4>
            </div>
            <div className="space-y-2">
              {aiAnalysis.weaknessAreas.map((weakness, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>{weakness}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {aiAnalysis.recommendations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              <h4 className="font-semibold text-sm">Recommendations</h4>
            </div>
            <div className="space-y-2">
              {aiAnalysis.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 text-sm p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                  <span className="h-5 w-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


function QuestionCard({ question, index }: { question: any; index: number }) {
  const config = questionTypeConfig[question.type as keyof typeof questionTypeConfig] || questionTypeConfig.multipleChoice
  const Icon = config.icon

  return (
    <Card className={`relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 ${config.borderColor}`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/25">
              {index + 1}
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <p className="font-medium leading-relaxed">{question.question}</p>
            
            <Badge variant="secondary" className={`${config.bgColor} ${config.color} border-0 gap-1.5`}>
              <Icon className="h-3 w-3" />
              {config.label}
            </Badge>

            {question.type === 'multipleChoice' && question.options && (
              <div className="grid gap-2 mt-3">
                {question.options.map((opt: string, i: number) => (
                  <div 
                    key={i} 
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      question.correctAnswer === i 
                        ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' 
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                    }`}
                  >
                    <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      question.correctAnswer === i 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className={`text-sm ${question.correctAnswer === i ? 'font-medium text-green-700 dark:text-green-300' : ''}`}>
                      {opt}
                    </span>
                    {question.correctAnswer === i && (
                      <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {question.type === 'trueFalse' && (
              <div className="flex gap-3 mt-3">
                <div className={`flex-1 p-3 rounded-lg border text-center ${
                  question.correctAnswer === true 
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' 
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                }`}>
                  <span className={`text-sm font-medium ${question.correctAnswer === true ? 'text-green-700 dark:text-green-300' : 'text-gray-500'}`}>
                    True {question.correctAnswer === true && <CheckCircle2 className="h-4 w-4 inline ml-1" />}
                  </span>
                </div>
                <div className={`flex-1 p-3 rounded-lg border text-center ${
                  question.correctAnswer === false 
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' 
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                }`}>
                  <span className={`text-sm font-medium ${question.correctAnswer === false ? 'text-green-700 dark:text-green-300' : 'text-gray-500'}`}>
                    False {question.correctAnswer === false && <CheckCircle2 className="h-4 w-4 inline ml-1" />}
                  </span>
                </div>
              </div>
            )}

            {question.type === 'fillInBlank' && (
              <div className="mt-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Answer: {String(question.correctAnswer)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function QuizDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  const { data: quiz, isLoading: quizLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => quizService.getQuizById(id)
  })

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['quiz-analytics', id],
    queryFn: () => quizService.getQuizAnalytics(id),
    enabled: !!quiz
  })

  if (quizLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm text-muted-foreground">Loading quiz details...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Quiz not found</h2>
          <p className="text-muted-foreground mb-4">The quiz you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/quizzes')}>Back to Library</Button>
        </div>
      </div>
    )
  }

  const status = statusConfig[quiz.status] || statusConfig.active
  const sortedQuestionStats = analytics?.questionStats?.slice().sort((a, b) => a.accuracyRate - b.accuracyRate) || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <Navbar />
      
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${status.gradient} opacity-5`} />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        
        <div className="container mx-auto px-4 py-8 relative">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push('/quizzes')}
              className="rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{quiz.title}</h1>
                <Badge variant="secondary" className={`${status.bgColor} ${status.textColor} border-0`}>
                  <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${status.dotColor}`} />
                  {status.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Created {formatDistanceToNow(new Date(quiz.createdAt), { addSuffix: true })}
              </p>
            </div>
            <Button 
              onClick={() => router.push(`/quizzes/${id}/edit`)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Quiz
            </Button>
          </div>

          {/* Access Code Display */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900">
              <KeyRound className="h-5 w-5 text-indigo-500" />
              <span className="font-mono text-xl font-bold tracking-wider text-indigo-700 dark:text-indigo-300">
                {quiz.accessCode}
              </span>
            </div>
            <CopyButton 
              content={quiz.accessCode}
              variant="outline"
              size="md"
              className="border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
              onCopy={() => { toast.success("Access code copied!") }}
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              icon={Users} 
              label="Total Responses" 
              value={analytics?.summary?.totalSubmissions || 0}
              subValue={quiz.maxStudents ? `of ${quiz.maxStudents} max` : 'No limit'}
              gradient="from-blue-500 to-cyan-600"
            />
            <StatCard 
              icon={Target} 
              label="Average Score" 
              value={analytics?.summary?.averageScore ? `${analytics.summary.averageScore.toFixed(0)}%` : 'N/A'}
              subValue="across all submissions"
              gradient="from-green-500 to-emerald-600"
            />
            <StatCard 
              icon={Award} 
              label="Highest Score" 
              value={analytics?.summary?.highestScore ? `${analytics.summary.highestScore.toFixed(0)}%` : 'N/A'}
              subValue="best performance"
              gradient="from-amber-500 to-orange-600"
            />
            <StatCard 
              icon={Timer} 
              label="Duration" 
              value={`${quiz.duration} min`}
              subValue={`${quiz.questionsPerStudent} questions`}
              gradient="from-purple-500 to-pink-600"
            />
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 bg-white dark:bg-gray-900 p-1.5 rounded-xl shadow-sm border">
            <TabsTrigger 
              value="overview" 
              className="rounded-lg px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Eye className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="rounded-lg px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="questions" 
              className="rounded-lg px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              Questions ({quiz.questions?.length || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="submissions" 
              className="rounded-lg px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Users className="h-4 w-4 mr-2" />
              Submissions ({analytics?.submissions?.length || 0})
            </TabsTrigger>
          </TabsList>


          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Quiz Details Card */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Quiz Details</CardTitle>
                      <CardDescription>Configuration and settings</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Duration</span>
                      </div>
                      <p className="text-xl font-bold">{quiz.duration} minutes</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Hash className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Questions/Student</span>
                      </div>
                      <p className="text-xl font-bold">{quiz.questionsPerStudent}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Users className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Max Students</span>
                      </div>
                      <p className="text-xl font-bold">{quiz.maxStudents || 'Unlimited'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <CalendarDays className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Created</span>
                      </div>
                      <p className="text-sm font-bold">{format(new Date(quiz.createdAt), "MMM d, yyyy")}</p>
                    </div>
                  </div>

                  {/* Question Type Distribution */}
                  {quiz.questionDistribution && (
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-3">Question Types</h4>
                      <div className="space-y-2">
                        {Object.entries(quiz.questionDistribution).map(([type, count]) => {
                          if (count === 0) return null
                          const config = questionTypeConfig[type as keyof typeof questionTypeConfig]
                          if (!config) return null
                          const Icon = config.icon
                          const total = Object.values(quiz.questionDistribution!).reduce((a, b) => a + b, 0)
                          const percentage = total > 0 ? (count / total) * 100 : 0
                          return (
                            <div key={type} className="flex items-center gap-3">
                              <div className={`h-8 w-8 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                                <Icon className={`h-4 w-4 ${config.color}`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span>{config.label}</span>
                                  <span className="font-medium">{count}</span>
                                </div>
                                <Progress value={percentage} className="h-1.5" />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Insights */}
              <AIInsightsCard quizId={id} />
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : !analytics || analytics.summary.totalSubmissions === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="py-16 text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No analytics yet</h3>
                  <p className="text-muted-foreground">Analytics will appear once students start taking the quiz.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Score Distribution */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <Percent className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Score Overview</CardTitle>
                        <CardDescription>Performance distribution across submissions</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 text-center">
                        <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">{analytics.summary.highestScore.toFixed(0)}%</p>
                        <p className="text-xs text-green-600">Highest</p>
                      </div>
                      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-center">
                        <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{analytics.summary.averageScore.toFixed(0)}%</p>
                        <p className="text-xs text-blue-600">Average</p>
                      </div>
                      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-center">
                        <TrendingDown className="h-6 w-6 text-red-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-red-700 dark:text-red-300">{analytics.summary.lowestScore.toFixed(0)}%</p>
                        <p className="text-xs text-red-600">Lowest</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Question Performance */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Question Performance</CardTitle>
                        <CardDescription>Sorted by accuracy (lowest first)</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {sortedQuestionStats.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No question statistics available yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {sortedQuestionStats.map((stat, i) => (
                          <QuestionAnalysisCard key={stat.questionId} stat={stat} index={i} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-4">
            {!quiz.questions || quiz.questions.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="py-16 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
                  <p className="text-muted-foreground mb-4">Add questions to your quiz to get started.</p>
                  <Button onClick={() => router.push(`/quizzes/${id}/edit`)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Quiz
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {quiz.questions.map((question, i) => (
                  <QuestionCard key={question._id} question={question} index={i} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-4">
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : !analytics?.submissions || analytics.submissions.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="py-16 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                  <p className="text-muted-foreground">Share the access code with students to start collecting responses.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {analytics.submissions.map((submission, i) => (
                  <SubmissionRow key={submission.studentId} submission={submission} index={i} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
