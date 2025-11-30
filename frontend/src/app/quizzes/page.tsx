"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { quizService } from "@/services/quiz.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Loader2, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  BookOpen, 
  Users, 
  Clock, 
  Calendar,
  AlertCircle
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

export default function QuizzesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | null>(null)

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: quizService.getMyQuizzes
  })

  const filteredQuizzes = quizzes?.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus ? quiz.status === filterStatus : true
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Library</h1>
          <p className="text-muted-foreground">Manage your quizzes and assessments.</p>
        </div>
        <Button onClick={() => router.push('/quizzes/create')} className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" />
          Create New Quiz
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search quizzes..." 
            className="pl-9" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filterStatus === null ? "secondary" : "outline"} 
            onClick={() => setFilterStatus(null)}
          >
            All
          </Button>
          <Button 
            variant={filterStatus === 'active' ? "secondary" : "outline"} 
            onClick={() => setFilterStatus('active')}
          >
            Active
          </Button>
          <Button 
            variant={filterStatus === 'draft' ? "secondary" : "outline"} 
            onClick={() => setFilterStatus('draft')}
          >
            Drafts
          </Button>
        </div>
      </div>

      {/* Quiz Grid */}
      {filteredQuizzes?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No quizzes found</h3>
          <p className="text-muted-foreground max-w-sm mt-2 mb-6">
            {searchQuery ? "Try adjusting your search terms." : "Get started by creating your first AI-powered quiz."}
          </p>
          <Button onClick={() => router.push('/quizzes/create')}>
            Create Quiz
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredQuizzes?.map((quiz) => (
            <Card key={quiz._id} className="group hover:shadow-lg transition-all duration-300 border-l-4" style={{ borderLeftColor: quiz.status === 'active' ? '#22c55e' : '#6366f1' }}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="line-clamp-1" title={quiz.title}>{quiz.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${
                        quiz.status === 'active' ? 'bg-green-500' : 
                        quiz.status === 'draft' ? 'bg-yellow-500' : 
                        'bg-gray-400'
                      }`} />
                      <span className="capitalize">{quiz.status}</span>
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="-mr-2">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{quiz.questionsPerStudent || quiz.questions?.length || 0} Qs</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{quiz.duration} mins</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{quiz.submissionCount} Plays</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t bg-gray-50/50 dark:bg-gray-900/50">
                <div className="w-full flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(quiz.createdAt), { addSuffix: true })}
                  </span>
                  <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30" onClick={() => router.push(`/quizzes/${quiz._id}`)}>
                    View Details
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
