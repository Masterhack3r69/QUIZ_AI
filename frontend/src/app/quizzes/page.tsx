"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Navbar } from "@/components/navbar"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { quizService, Quiz } from "@/services/quiz.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Loader2, Plus, Search, MoreVertical, BookOpen, Users, Clock, Calendar,
  Copy, Trash2, Pencil, Eye, Hash, KeyRound, Settings2
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { toast } from "sonner"
import api from "@/lib/api"

const statusConfig = {
  active: { label: "Active", color: "bg-green-500", bgColor: "bg-green-50 dark:bg-green-950/30", textColor: "text-green-700 dark:text-green-400" },
  scheduled: { label: "Scheduled", color: "bg-yellow-500", bgColor: "bg-yellow-50 dark:bg-yellow-950/30", textColor: "text-yellow-700 dark:text-yellow-400" },
  expired: { label: "Expired", color: "bg-gray-400", bgColor: "bg-gray-50 dark:bg-gray-800/50", textColor: "text-gray-600 dark:text-gray-400" },
  draft: { label: "Draft", color: "bg-blue-500", bgColor: "bg-blue-50 dark:bg-blue-950/30", textColor: "text-blue-700 dark:text-blue-400" },
  full: { label: "Full", color: "bg-purple-500", bgColor: "bg-purple-50 dark:bg-purple-950/30", textColor: "text-purple-700 dark:text-purple-400" },
}

interface QuickEditData {
  _id: string
  title: string
  duration: number
  questionsPerStudent: number
  maxStudents?: number
}

function QuizCard({ quiz, onDelete, onDuplicate, onEdit }: { 
  quiz: Quiz & { submissionCount: number }
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onEdit: (quiz: QuickEditData) => void
}) {
  const router = useRouter()
  const status = statusConfig[quiz.status] || statusConfig.active

  const copyAccessCode = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(quiz.accessCode)
    toast.success("Access code copied!")
  }

  return (
    <Card className="group relative overflow-hidden border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-gray-900">
      <div className={`absolute top-0 left-0 right-0 h-1 ${status.color}`} />
      
      <CardHeader className="pb-3 pt-5">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-indigo-600 transition-colors" title={quiz.title}>
              {quiz.title}
            </CardTitle>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={copyAccessCode}
                    className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-mono"
                  >
                    <KeyRound className="h-3.5 w-3.5 text-indigo-500" />
                    <span className="font-semibold">{quiz.accessCode}</span>
                    <Copy className="h-3 w-3 text-gray-400 ml-1" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Click to copy</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => router.push(`/quizzes/${quiz._id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit({
                _id: quiz._id,
                title: quiz.title,
                duration: quiz.duration,
                questionsPerStudent: quiz.questionsPerStudent,
                maxStudents: quiz.maxStudents
              })}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(quiz._id)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(quiz._id)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Badge variant="secondary" className={`mt-2 w-fit ${status.bgColor} ${status.textColor} border-0`}>
          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${status.color}`} />
          {status.label}
        </Badge>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/30">
              <Hash className="h-3.5 w-3.5 text-indigo-500" />
            </div>
            <span>{quiz.questionsPerStudent} Questions</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="p-1.5 rounded-md bg-purple-50 dark:bg-purple-950/30">
              <Clock className="h-3.5 w-3.5 text-purple-500" />
            </div>
            <span>{quiz.duration} mins</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="p-1.5 rounded-md bg-green-50 dark:bg-green-950/30">
              <Users className="h-3.5 w-3.5 text-green-500" />
            </div>
            <span>{quiz.submissionCount} Responses</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="p-1.5 rounded-md bg-orange-50 dark:bg-orange-950/30">
              <Calendar className="h-3.5 w-3.5 text-orange-500" />
            </div>
            <span>{format(new Date(quiz.createdAt), "MMM d, yyyy")}</span>
          </div>
        </div>
      </CardContent>

      <div className="px-6 py-3 border-t bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(quiz.createdAt), { addSuffix: true })}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 -mr-2"
          onClick={() => router.push(`/quizzes/${quiz._id}`)}
        >
          View Details
        </Button>
      </div>
    </Card>
  )
}

function EditDialog({ 
  quiz, 
  open, 
  onOpenChange,
  onAdvancedEdit 
}: { 
  quiz: QuickEditData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdvancedEdit: (id: string) => void
}) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<QuickEditData | null>(null)

  useEffect(() => {
    if (quiz) {
      setFormData({ ...quiz })
    }
  }, [quiz])

  const updateMutation = useMutation({
    mutationFn: async (data: QuickEditData) => {
      const response = await api.put(`/quiz/${data._id}`, {
        title: data.title,
        duration: data.duration,
        questionsPerStudent: data.questionsPerStudent,
        maxStudents: data.maxStudents || undefined
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      toast.success("Quiz updated successfully")
      onOpenChange(false)
    },
    onError: () => {
      toast.error("Failed to update quiz")
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData) {
      updateMutation.mutate(formData)
    }
  }

  if (!formData) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Pencil className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">Edit Quiz</DialogTitle>
              <DialogDescription>Update quiz settings quickly</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Quiz Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="text-base"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Duration
              </Label>
              <div className="relative">
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">min</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="questionsPerStudent" className="text-sm font-medium flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                Questions/Student
              </Label>
              <Input
                id="questionsPerStudent"
                type="number"
                min={1}
                value={formData.questionsPerStudent}
                onChange={(e) => setFormData({ ...formData, questionsPerStudent: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxStudents" className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Max Students
            </Label>
            <Input
              id="maxStudents"
              type="number"
              min={1}
              placeholder="Unlimited"
              value={formData.maxStudents || ''}
              onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>

          {/* Advanced Edit Link */}
          <button
            type="button"
            onClick={() => {
              onOpenChange(false)
              onAdvancedEdit(formData._id)
            }}
            className="w-full p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all duration-200 group"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                <Settings2 className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Advanced Edit</p>
                <p className="text-xs text-muted-foreground">Edit questions, add new ones, and more</p>
              </div>
            </div>
          </button>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


export default function QuizzesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [quizToEdit, setQuizToEdit] = useState<QuickEditData | null>(null)

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: quizService.getMyQuizzes,
    enabled: isAuthenticated
  })

  const deleteMutation = useMutation({
    mutationFn: quizService.deleteQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      toast.success("Quiz deleted successfully")
      setDeleteDialogOpen(false)
      setQuizToDelete(null)
    },
    onError: () => {
      toast.error("Failed to delete quiz")
    }
  })

  const duplicateMutation = useMutation({
    mutationFn: quizService.duplicateQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      toast.success("Quiz duplicated successfully")
    },
    onError: () => {
      toast.error("Failed to duplicate quiz")
    }
  })

  const filteredQuizzes = quizzes?.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          quiz.accessCode.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus ? quiz.status === filterStatus : true
    return matchesSearch && matchesStatus
  })

  const handleDelete = (id: string) => {
    setQuizToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (quizToDelete) {
      deleteMutation.mutate(quizToDelete)
    }
  }

  const handleDuplicate = (id: string) => {
    duplicateMutation.mutate(id)
  }

  const handleEdit = (quiz: QuickEditData) => {
    setQuizToEdit(quiz)
    setEditDialogOpen(true)
  }

  const handleAdvancedEdit = (id: string) => {
    router.push(`/quizzes/${id}/edit`)
  }

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthLoading, isAuthenticated, router])

  if (isLoading || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-8">
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

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by title or access code..." 
              className="pl-9" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[null, 'active', 'scheduled', 'draft'].map((status) => (
              <Button 
                key={status || 'all'}
                variant={filterStatus === status ? "secondary" : "outline"} 
                onClick={() => setFilterStatus(status)}
                size="sm"
              >
                {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
              </Button>
            ))}
          </div>
        </div>

        {filteredQuizzes?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No quizzes found</h3>
            <p className="text-muted-foreground max-w-sm mt-2 mb-6">
              {searchQuery ? "Try adjusting your search terms." : "Get started by creating your first AI-powered quiz."}
            </p>
            <Button onClick={() => router.push('/quizzes/create')}>Create Quiz</Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredQuizzes?.map((quiz) => (
              <QuizCard 
                key={quiz._id} 
                quiz={quiz as Quiz & { submissionCount: number }} 
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </main>

      <EditDialog
        quiz={quizToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onAdvancedEdit={handleAdvancedEdit}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quiz? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
