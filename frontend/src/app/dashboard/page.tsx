  "use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Loader2, 
  Zap, 
  Search, 
  Bell, 
  Plus, 
  BookOpen, 
  MoreVertical, 
  Users, 
  Clock, 
  Trophy,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { quizService } from "@/services/quiz.service"
import { formatDistanceToNow } from "date-fns"

export default function DashboardPage() {
  const { user, logout, isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthLoading, isAuthenticated, router])

  // Fetch Quizzes
  const { data: quizzes, isLoading: isQuizzesLoading, error } = useQuery({
    queryKey: ['quizzes'],
    queryFn: quizService.getMyQuizzes,
    enabled: isAuthenticated
  })

  // Calculate Stats
  const stats = useMemo(() => {
    if (!quizzes) return [
      { label: "Total Quizzes", value: "0", icon: BookOpen, color: "text-blue-500" },
      { label: "Total Plays", value: "0", icon: Users, color: "text-green-500" },
      { label: "Active Quizzes", value: "0", icon: Zap, color: "text-purple-500" },
      { label: "Scheduled", value: "0", icon: Clock, color: "text-orange-500" },
    ]

    const totalQuizzes = quizzes.length
    const totalPlays = quizzes.reduce((acc, quiz) => acc + (quiz.submissionCount || 0), 0)
    const activeQuizzes = quizzes.filter(q => q.status === 'active').length
    const scheduledQuizzes = quizzes.filter(q => q.status === 'scheduled').length

    return [
      { label: "Total Quizzes", value: totalQuizzes.toString(), icon: BookOpen, color: "text-blue-500" },
      { label: "Total Plays", value: totalPlays.toString(), icon: Users, color: "text-green-500" },
      { label: "Active Quizzes", value: activeQuizzes.toString(), icon: Zap, color: "text-purple-500" },
      { label: "Scheduled", value: scheduledQuizzes.toString(), icon: Clock, color: "text-orange-500" },
    ]
  }, [quizzes])

  const recentQuizzes = useMemo(() => {
    return quizzes?.slice(0, 4) || []
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
      {/* Top Navigation - Glassmorphism */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-white/70 dark:bg-black/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Zap className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">QuizAI</span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/dashboard">
                <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full px-4">
                  Overview
                </Button>
              </Link>
              <Link href="/quizzes">
                <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full px-4">
                  Library
                </Button>
              </Link>
              <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full px-4">
                Reports
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full px-4">
                Community
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {/* <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-black" /> */}
            </Button>
            
            {/* User Profile Dropdown Trigger */}
            <div className="flex items-center gap-2 pl-2 border-l ml-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={logout} title="Click to logout">
               <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 ring-2 ring-white dark:ring-black flex items-center justify-center text-white font-bold text-xs shadow-sm">
                 {user.name.charAt(0).toUpperCase()}
               </div>
               <div className="hidden md:block">
                 <p className="text-sm font-medium leading-none">{user.name}</p>
                 <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
               </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 p-8 md:p-12 text-white shadow-2xl shadow-indigo-500/25">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-md border border-white/20">
                <span className="mr-2 flex h-2 w-2 rounded-full bg-green-400"></span>
                System Operational
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Welcome back, {user.name.split(' ')[0]}!
              </h1>
              <p className="text-lg text-indigo-100/90 leading-relaxed">
                Ready to create engaging quizzes? Your AI assistant is ready.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 border-0 shadow-lg shadow-black/10 transition-transform hover:scale-105">
                  <Zap className="mr-2 h-4 w-4" />
                  Generate with AI
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Manually
                </Button>
              </div>
            </div>
            
            {/* Abstract Decorative Elements */}
            <div className="hidden md:block relative">
               <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-pink-500/30 blur-3xl" />
               <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl" />
               <Card className="relative w-72 bg-white/10 backdrop-blur-md border-white/20 text-white shadow-xl rotate-3 transition-transform hover:rotate-0 duration-500">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <CheckCircle2 className="h-5 w-5 text-green-400" />
                     Ready to Deploy
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-2">
                   <div className="h-2 w-3/4 rounded-full bg-white/20" />
                   <div className="h-2 w-1/2 rounded-full bg-white/20" />
                   <div className="mt-4 flex gap-2">
                     <div className="h-8 w-8 rounded-full bg-white/20" />
                     <div className="h-8 w-8 rounded-full bg-white/20" />
                     <div className="h-8 w-8 rounded-full bg-white/20" />
                   </div>
                 </CardContent>
               </Card>
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card key={i} className="group relative overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-900">
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${stat.color.replace('text-', 'bg-')}`} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${stat.color.replace('text-', 'bg-').replace('500', '100')} dark:bg-opacity-10`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  {/* <span className="flex items-center text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                    +12%
                  </span> */}
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - Recent Quizzes */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Recent Quizzes</h2>
                <p className="text-muted-foreground">Manage and monitor your latest assessments.</p>
              </div>
              <Button variant="outline" className="gap-2" onClick={() => router.push('/quizzes')}>
                View All <BookOpen className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Create New Card */}
              <button className="group relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-8 text-center hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 transition-all duration-300">
                <div className="rounded-full bg-white dark:bg-gray-800 p-4 shadow-sm group-hover:scale-110 transition-transform duration-300 group-hover:text-indigo-600">
                  <Plus className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">Create New Quiz</h3>
                  <p className="text-sm text-muted-foreground">Start from scratch or use AI</p>
                </div>
              </button>

              {/* Quiz Cards */}
              {recentQuizzes.length === 0 && (
                 <div className="col-span-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                   <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                   <p>No quizzes found. Create one to get started!</p>
                 </div>
              )}

              {recentQuizzes.map((quiz) => (
                <Card key={quiz._id} className="group cursor-pointer overflow-hidden border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-gray-900">
                  <div className={`h-2 w-full bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity ${
                    quiz.status === 'active' ? 'from-green-500 to-emerald-500' : 
                    quiz.status === 'expired' ? 'from-gray-500 to-slate-500' :
                    'from-indigo-500 to-purple-500'
                  }`} />
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg group-hover:text-indigo-600 transition-colors line-clamp-1" title={quiz.title}>
                          {quiz.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                            quiz.status === 'active' ? 'bg-green-500' : 
                            quiz.status === 'expired' ? 'bg-gray-400' :
                            'bg-yellow-500'
                          }`} />
                          <span className="capitalize">{quiz.status}</span>
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 py-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4 text-indigo-500/70" />
                        <span>{quiz.questionsPerStudent} Qs</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 text-purple-500/70" />
                        <span>{quiz.submissionCount} Plays</span>
                      </div>
                    </div>
                  </CardContent>
                  <div className="px-6 py-4 border-t bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {formatDistanceToNow(new Date(quiz.createdAt), { addSuffix: true })}
                    </span>
                    <div className="flex -space-x-2">
                      {/* Placeholder for student avatars if we had them */}
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-6 w-6 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 opacity-50" />
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/20 dark:to-gray-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground text-center py-4">
                  No data available yet.
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-pink-500 to-orange-500" />
              <CardHeader>
                <CardTitle>Upcoming Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="text-sm text-muted-foreground text-center py-4">
                  No upcoming quizzes.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
