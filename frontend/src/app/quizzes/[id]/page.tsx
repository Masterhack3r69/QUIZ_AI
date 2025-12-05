"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { quizService } from "@/services/quiz.service"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Loader2, ArrowLeft, Copy, Users, Clock, Calendar, Hash, KeyRound,
  BarChart3, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2,
  Brain, Sparkles, BookOpen, Target, Award, Timer
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

const statusConfig = {
  active: { label: "Active", color: "bg-green-500", bgColor: "bg-green-50 dark:bg-green-950/30", textColor: "text-green-700 dark:text-green-400" },
  scheduled: { label: "Scheduled", color: "bg-yellow-500", bgColor: "bg-yellow-50 dark:bg-yellow-950/30", textColor: "text-yellow-700 dark:text-yellow-400" },
  expired: { label: "Expired", color: "bg-gray-400", bgColor: "bg-gray-50 dark:bg-gray-800/50", textColor: "text-gray-600 dark:text-gray-400" },
  draft: { label: "Draft", color: "bg-blue-500", bgColor: "bg-blue-50 dark:bg-blue-950/30", textColor: "text-blue-700 dark:text-blue-400" },
  full: { label: "Full", color: "bg-purple-500", bgColor: "bg-purple-50 dark:bg-purple-950/30", textColor: "text-purple-700 dark:text-purple-400" },
}

function StatCard({ icon: Icon, label, value, subValue, color }: {
  icon: React.ElementType
  label: string
  value: string | number
  subValue?: string
  color: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function QuestionAnalysisCard({ question, accuracyRate, totalAttempts, correctCount, questionType }: {
  question: string
  accuracyRate: number
  totalAttempts: number
  correctCount: number
  questionType: string
}) {
  const isLowAccuracy = accuracyRate < 50
  const isMediumAccuracy = accuracyRate >= 50 && accuracyRate < 75
  
  return (
    <Card className={`border-l-4 ${isLowAccuracy ? 'border-l-red-500' : isMediumAccuracy ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium line-clamp-2">{question}</p>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className="text-xs capitalize">
                {questionType.replace(/([A-Z])/g, ' $1').trim()}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {correctCount}/{totalAttempts} correct
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className={`text-lg font-bold ${isLowAccuracy ? 'text-red-600' : isMediumAccuracy ? 'text-yellow-600' : 'text-green-600'}`}>
              {accuracyRate}%
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {isLowAccuracy ? (
                <>
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span>Needs attention</span>
                </>
              ) : isMediumAccuracy ? (
                <>
                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                  <span>Moderate</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span>Good</span>
                </>
              )}
            </div>
          </div>
        </div>
        <Progress 
          value={accuracyRate} 
          className={`h-1.5 mt-3 ${isLowAccuracy ? '[&>div]:bg-red-500' : isMediumAccuracy ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`}
        />
      </CardContent>
    </Card>
  )
}


function AIInsightsCard({ analytics, isLoading }: { 
  analytics: ReturnType<typeof useQuery<Awaited<ReturnType<typeof quizService.getQuizAnalytics>>>>['data']
  isLoading: boolean 
}) {
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        </CardContent>
      </Card>
    )
  }

  if (!analytics || analytics.summary.totalSubmissions === 0) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No submissions yet. AI insights will be available once students start taking the quiz.
          </p>
        </CardContent>
      </Card>
    )
  }

  const { summary, questionStats } = analytics
  const avgPercentage = summary.totalSubmissions > 0 
    ? ((summary.averageScore / analytics.totalQuestions) * 100).toFixed(1) 
    : 0

  // Generate AI-like insights based on data
  const hardestQuestions = questionStats.filter(q => q.accuracyRate < 50).slice(0, 3)
  const easiestQuestions = [...questionStats].sort((a, b) => b.accuracyRate - a.accuracyRate).slice(0, 3)
  
  const insights: string[] = []
  
  if (Number(avgPercentage) < 50) {
    insights.push("Overall performance is below average. Consider reviewing the content or providing additional study materials.")
  } else if (Number(avgPercentage) >= 80) {
    insights.push("Excellent overall performance! Students have a strong grasp of the material.")
  } else {
    insights.push("Performance is moderate. Some topics may need reinforcement.")
  }

  if (hardestQuestions.length > 0) {
    insights.push(`${hardestQuestions.length} question(s) have accuracy below 50%. These topics need more attention.`)
  }

  // Question type analysis
  const typePerformance = summary.averageScoreByType
  const weakestType = Object.entries(typePerformance).reduce((a, b) => a[1] < b[1] ? a : b)
  const strongestType = Object.entries(typePerformance).reduce((a, b) => a[1] > b[1] ? a : b)
  
  if (weakestType[1] < strongestType[1] - 20) {
    insights.push(`Students struggle most with ${weakestType[0].replace(/([A-Z])/g, ' $1').toLowerCase()} questions (${weakestType[1]}% accuracy).`)
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-600" />
          AI-Powered Insights
        </CardTitle>
        <CardDescription>Automated analysis of quiz performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-900/50">
            <Sparkles className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
            <p className="text-sm">{insight}</p>
          </div>
        ))}

        {hardestQuestions.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Questions Needing Review
            </h4>
            <ul className="space-y-2">
              {hardestQuestions.map((q, i) => (
                <li key={i} className="text-sm text-muted-foreground pl-6 border-l-2 border-red-200">
                  {q.question.substring(0, 80)}... ({q.accuracyRate}% accuracy)
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-semibold mb-3">Performance by Question Type</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(typePerformance).map(([type, score]) => (
              <div key={type} className="flex items-center justify-between p-2 rounded-md bg-white/50 dark:bg-gray-900/50">
                <span className="text-xs capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className={`text-xs font-semibold ${score >= 70 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {score}%
                </span>
              </div>
            ))}
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

  const { data: quiz, isLoading: isQuizLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => quizService.getQuizById(id)
  })

  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['quiz-analytics', id],
    queryFn: () => quizService.getQuizAnalytics(id)
  })

  const copyAccessCode = () => {
    if (quiz?.accessCode) {
      navigator.clipboard.writeText(quiz.accessCode)
      toast.success("Access code copied!")
    }
  }

  if (isQuizLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Quiz not found</h2>
          <Button onClick={() => router.push('/quizzes')} className="mt-4">
            Back to Library
          </Button>
        </div>
      </div>
    )
  }

  const status = statusConfig[quiz.status] || statusConfig.active
  const totalQuestions = quiz.questions?.length || 0

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/quizzes')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="secondary" className={`${status.bgColor} ${status.textColor} border-0`}>
                  <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${status.color}`} />
                  {status.label}
                </Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={copyAccessCode}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-mono"
                      >
                        <KeyRound className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="font-semibold">{quiz.accessCode}</span>
                        <Copy className="h-3 w-3 text-gray-400 ml-1" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Click to copy access code</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          <Button onClick={() => router.push(`/quizzes/${id}/edit`)}>
            Edit Quiz
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            icon={Users} 
            label="Total Responses" 
            value={analytics?.summary.totalSubmissions || 0}
            color="bg-indigo-500"
          />
          <StatCard 
            icon={Target} 
            label="Average Score" 
            value={analytics?.summary.averageScore ? `${((analytics.summary.averageScore / (analytics.totalQuestions || 1)) * 100).toFixed(1)}%` : "N/A"}
            subValue={analytics?.summary.averageScore ? `${analytics.summary.averageScore.toFixed(1)} / ${analytics.totalQuestions}` : undefined}
            color="bg-green-500"
          />
          <StatCard 
            icon={Award} 
            label="Highest Score" 
            value={analytics?.summary.highestScore ?? "N/A"}
            subValue={analytics?.totalQuestions ? `out of ${analytics.totalQuestions}` : undefined}
            color="bg-purple-500"
          />
          <StatCard 
            icon={Timer} 
            label="Duration" 
            value={`${quiz.duration} min`}
            subValue={`${quiz.questionsPerStudent} questions per student`}
            color="bg-orange-500"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-900 border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="questions">Questions ({totalQuestions})</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Quiz Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Quiz Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Questions</p>
                      <p className="font-semibold">{totalQuestions}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Questions Per Student</p>
                      <p className="font-semibold">{quiz.questionsPerStudent}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-semibold">{quiz.duration} minutes</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Max Students</p>
                      <p className="font-semibold">{quiz.maxStudents || "Unlimited"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-semibold">{format(new Date(quiz.createdAt), "PPP")}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Expires</p>
                      <p className="font-semibold">{format(new Date(quiz.expiresAt), "PPP")}</p>
                    </div>
                  </div>

                  {quiz.questionDistribution && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-3">Question Distribution</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                          <p className="text-xs text-muted-foreground">Multiple Choice</p>
                          <p className="text-lg font-bold text-blue-600">{quiz.questionDistribution.multipleChoice}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                          <p className="text-xs text-muted-foreground">True/False</p>
                          <p className="text-lg font-bold text-green-600">{quiz.questionDistribution.trueFalse}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                          <p className="text-xs text-muted-foreground">Fill in Blank</p>
                          <p className="text-lg font-bold text-purple-600">{quiz.questionDistribution.fillInBlank}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                          <p className="text-xs text-muted-foreground">Matching</p>
                          <p className="text-lg font-bold text-orange-600">{quiz.questionDistribution.matching}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Insights */}
              <AIInsightsCard analytics={analytics} isLoading={isAnalyticsLoading} />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {!analytics || analytics.summary.totalSubmissions === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No Analytics Available</h3>
                  <p className="text-muted-foreground mt-2">Analytics will appear once students start submitting responses.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-6 lg:grid-cols-2">
                  <AIInsightsCard analytics={analytics} isLoading={isAnalyticsLoading} />
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Score Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Highest Score</span>
                          <span className="font-semibold text-green-600">{analytics.summary.highestScore}/{analytics.totalQuestions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Average Score</span>
                          <span className="font-semibold">{analytics.summary.averageScore.toFixed(1)}/{analytics.totalQuestions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Lowest Score</span>
                          <span className="font-semibold text-red-600">{analytics.summary.lowestScore}/{analytics.totalQuestions}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Question Performance Analysis
                    </CardTitle>
                    <CardDescription>Questions sorted by accuracy rate (lowest first)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {analytics.questionStats.map((stat, i) => (
                        <QuestionAnalysisCard
                          key={stat.questionId}
                          question={stat.question}
                          accuracyRate={stat.accuracyRate}
                          totalAttempts={stat.totalAttempts}
                          correctCount={stat.correctCount}
                          questionType={stat.questionType}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            {quiz.questions?.map((q, i) => (
              <Card key={q._id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 text-xs font-semibold shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{q.question}</p>
                      <Badge variant="outline" className="mt-2 text-xs capitalize">
                        {q.type.replace(/([A-Z])/g, ' $1').trim()}
                      </Badge>
                      {q.type === 'multipleChoice' && q.options && (
                        <div className="mt-3 space-y-1">
                          {q.options.map((opt, j) => (
                            <div 
                              key={j} 
                              className={`text-sm px-3 py-1.5 rounded ${j === q.correctAnswer ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400' : 'text-muted-foreground'}`}
                            >
                              {String.fromCharCode(65 + j)}. {opt}
                              {j === q.correctAnswer && <CheckCircle2 className="inline h-3.5 w-3.5 ml-2" />}
                            </div>
                          ))}
                        </div>
                      )}
                      {q.type === 'trueFalse' && (
                        <p className="mt-2 text-sm text-green-600">
                          Answer: {q.correctAnswer ? 'True' : 'False'}
                        </p>
                      )}
                      {q.type === 'fillInBlank' && (
                        <p className="mt-2 text-sm text-green-600">
                          Answer: {String(q.correctAnswer)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4">
            {!analytics || analytics.submissions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No Submissions Yet</h3>
                  <p className="text-muted-foreground mt-2">Share the access code with students to start collecting responses.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Student Submissions</CardTitle>
                  <CardDescription>{analytics.submissions.length} total submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium">Student</th>
                          <th className="text-left py-3 px-2 font-medium">ID</th>
                          <th className="text-center py-3 px-2 font-medium">Score</th>
                          <th className="text-center py-3 px-2 font-medium">Percentage</th>
                          <th className="text-right py-3 px-2 font-medium">Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.submissions.map((sub, i) => (
                          <tr key={i} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                            <td className="py-3 px-2">{sub.studentName}</td>
                            <td className="py-3 px-2 text-muted-foreground">{sub.studentId || '-'}</td>
                            <td className="py-3 px-2 text-center font-medium">{sub.score}/{sub.totalQuestions}</td>
                            <td className="py-3 px-2 text-center">
                              <span className={`font-semibold ${Number(sub.percentage) >= 70 ? 'text-green-600' : Number(sub.percentage) >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {sub.percentage}%
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right text-muted-foreground">
                              {formatDistanceToNow(new Date(sub.submittedAt), { addSuffix: true })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
