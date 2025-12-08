"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Loader2, 
  Plus, 
  BookOpen, 
  MoreVertical, 
  Users, 
  Clock, 
  Trophy,
  Target,
  Timer,
  TrendingUp,
  BarChart3,
  Play,
  Copy,
  Trash2,
  Eye,
  Share2,
  Calendar,
  ArrowUpRight,
  Sparkles,
  FileText
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { quizService } from "@/services/quiz.service"
import { formatDistanceToNow, format } from "date-fns"
import { Navbar } from "@/components/navbar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

function StatCard({ icon: Icon, label, value, subValue, gradient }: { 
  icon: React.ElementType
  label: string
  value: string | number
  subValue?: string
  gradient: string
}) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.08] group-hover:opacity-[0.12] transition-opacity`} />
      <div className="absolute -right-4 -bottom-4 opacity-[0.08] group-hover:opacity-[0.12] transition-opacity">
        <Icon className="h-32 w-32 text-gray-900 dark:text-white" />
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

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthLoading, isAuthenticated, router])

  // Fetch Quizzes
  const { data: quizzes, isLoading: isQuizzesLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: quizService.getMyQuizzes,
    enabled: isAuthenticated
  })

  // Calculate Stats
  const stats = useMemo(() => {
    if (!quizzes) return {
      totalResponses: 0,
      averageScore: 0,
      highestScore: 0,
      avgDuration: 0,
      totalQuestions: 0,
      activeQuizzes: 0
    }

    const totalResponses = quizzes.reduce((acc, quiz) => acc + (quiz.submissionCount || 0), 0)
    const totalQuestions = quizzes.reduce((acc, quiz) => acc + (quiz.questionsPerStudent || 0), 0)
    const activeQuizzes = quizzes.filter(q => q.status === 'active').length
    const avgDuration = quizzes.length > 0 
      ? Math.round(quizzes.reduce((acc, quiz) => acc + (quiz.duration || 0), 0) / quizzes.length)
      : 0

    return {
      totalResponses,
      averageScore: 0, // Would need analytics data
      highestScore: 0, // Would need analytics data
      avgDuration,
      totalQuestions,
      activeQuizzes
    }
  }, [quizzes])

  const recentQuizzes = useMemo(() => {
    return quizzes?.slice(0, 5) || []
  }, [quizzes])

  const upcomingQuizzes = useMemo(() => {
    return quizzes?.filter(q => q.status === 'scheduled').slice(0, 3) || []
  }, [quizzes])

  if (isAuthLoading || isQuizzesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <Navbar />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your quizzes today.
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              <Sparkles className="h-4 w-4" />
              Create with AI
            </Button>
          </div>
        </div>

        {/* Stats Cards - Matching quiz details page design */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            icon={Users} 
            label="Total Responses" 
            value={stats.totalResponses}
            subValue={`${quizzes?.length || 0} quizzes`}
            gradient="from-blue-500 to-cyan-600"
          />
          <StatCard 
            icon={Target} 
            label="Average Score" 
            value={stats.averageScore > 0 ? `${stats.averageScore}%` : 'N/A'}
            subValue="across all submissions"
            gradient="from-green-500 to-emerald-600"
          />
          <StatCard 
            icon={Trophy} 
            label="Highest Score" 
            value={stats.highestScore > 0 ? `${stats.highestScore}%` : 'N/A'}
            subValue="best performance"
            gradient="from-amber-500 to-orange-600"
          />
          <StatCard 
            icon={Timer} 
            label="Avg Duration" 
            value={`${stats.avgDuration} min`}
            subValue={`${stats.totalQuestions} questions total`}
            gradient="from-purple-500 to-pink-600"
          />
        </section>

        {/* Quick Actions */}
        <section className="grid gap-4 md:grid-cols-4">
          <button 
            onClick={() => router.push('/create-quiz')}
            className="group flex items-center gap-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all"
          >
            <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/30 p-3 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
              <Plus className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="text-left">
              <p className="font-medium">Create Quiz</p>
              <p className="text-xs text-muted-foreground">Start from scratch</p>
            </div>
          </button>

          <button 
            onClick={() => router.push('/create-quiz?mode=ai')}
            className="group flex items-center gap-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
          >
            <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium">AI Generate</p>
              <p className="text-xs text-muted-foreground">Use AI assistant</p>
            </div>
          </button>

          <button 
            onClick={() => router.push('/quizzes')}
            className="group flex items-center gap-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all"
          >
            <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-3 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-left">
              <p className="font-medium">View Analytics</p>
              <p className="text-xs text-muted-foreground">Check performance</p>
            </div>
          </button>

          <button 
            className="group flex items-center gap-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all"
          >
            <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-3 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-left">
              <p className="font-medium">Import Quiz</p>
              <p className="text-xs text-muted-foreground">From file or URL</p>
            </div>
          </button>
        </section>


        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - Recent Quizzes */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Recent Quizzes</h2>
                <p className="text-sm text-muted-foreground">Manage your latest assessments</p>
              </div>
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => router.push('/quizzes')}>
                View All <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>

            {recentQuizzes.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">No quizzes yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Create your first quiz to get started</p>
                  <Button onClick={() => router.push('/create-quiz')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Quiz
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentQuizzes.map((quiz) => (
                  <Card 
                    key={quiz._id} 
                    className="group hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => router.push(`/quizzes/${quiz._id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          {/* Status Indicator */}
                          <div className={`mt-1 flex-shrink-0 rounded-lg p-2.5 ${
                            quiz.status === 'active' 
                              ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                              : quiz.status === 'expired' 
                              ? 'bg-gray-100 dark:bg-gray-800' 
                              : quiz.status === 'scheduled'
                              ? 'bg-amber-100 dark:bg-amber-900/30'
                              : 'bg-blue-100 dark:bg-blue-900/30'
                          }`}>
                            {quiz.status === 'active' ? (
                              <Play className="h-4 w-4 text-emerald-600" />
                            ) : quiz.status === 'expired' ? (
                              <Clock className="h-4 w-4 text-gray-500" />
                            ) : quiz.status === 'scheduled' ? (
                              <Calendar className="h-4 w-4 text-amber-600" />
                            ) : (
                              <FileText className="h-4 w-4 text-blue-600" />
                            )}
                          </div>

                          {/* Quiz Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate group-hover:text-indigo-600 transition-colors">
                                {quiz.title}
                              </h3>
                              <Badge variant={
                                quiz.status === 'active' ? 'default' : 
                                quiz.status === 'expired' ? 'secondary' : 
                                'outline'
                              } className={`text-xs ${
                                quiz.status === 'active' ? 'bg-emerald-500' : ''
                              }`}>
                                {quiz.status}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-3.5 w-3.5" />
                                {quiz.questionsPerStudent} questions
                              </span>
                              <span className="flex items-center gap-1">
                                <Timer className="h-3.5 w-3.5" />
                                {quiz.duration} min
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {quiz.submissionCount} responses
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {formatDistanceToNow(new Date(quiz.createdAt), { addSuffix: true })}
                              </span>
                            </div>

                            {/* Access Code */}
                            {quiz.accessCode && quiz.status === 'active' && (
                              <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-xs font-mono">
                                Code: {quiz.accessCode}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigator.clipboard.writeText(quiz.accessCode)
                                  }}
                                  className="hover:text-indigo-600"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/quizzes/${quiz._id}`)
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/quizzes/${quiz._id}/analytics`)
                            }}>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              navigator.clipboard.writeText(`${window.location.origin}/take-quiz?code=${quiz.accessCode}`)
                            }}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share Link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>


          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                  Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Quizzes</span>
                    <span className="font-medium">{stats.activeQuizzes}</span>
                  </div>
                  <Progress value={quizzes?.length ? (stats.activeQuizzes / quizzes.length) * 100 : 0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Response Rate</span>
                    <span className="font-medium">{stats.totalResponses > 0 ? '100%' : '0%'}</span>
                  </div>
                  <Progress value={stats.totalResponses > 0 ? 100 : 0} className="h-2" />
                </div>
                <div className="pt-2 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-indigo-600">{quizzes?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Total Quizzes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">{stats.totalResponses}</p>
                      <p className="text-xs text-muted-foreground">Total Responses</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Quizzes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-500" />
                  Scheduled Quizzes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingQuizzes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No scheduled quizzes
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingQuizzes.map((quiz) => (
                      <div 
                        key={quiz._id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                        onClick={() => router.push(`/quizzes/${quiz._id}`)}
                      >
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{quiz.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {quiz.startDate ? format(new Date(quiz.startDate), 'MMM d, h:mm a') : 'Not scheduled'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/20 dark:to-gray-900 border-amber-200/50 dark:border-amber-900/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground text-center py-4">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-amber-300" />
                  <p>Complete some quizzes to see top performers!</p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  )
}
