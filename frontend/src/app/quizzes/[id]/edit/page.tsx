"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { quizService } from "@/services/quiz.service"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  Loader2, ArrowLeft, Save, Plus, Trash2, CheckCircle2,
  Pencil, AlertTriangle, ListChecks, ToggleLeft, TextCursorInput,
  Clock, Users, Hash, FileText, Sparkles, GripVertical
} from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"

type QuestionType = 'multipleChoice' | 'trueFalse' | 'fillInBlank'

interface EditableQuestion {
  _id?: string
  type: QuestionType
  question: string
  options?: string[]
  correctAnswer?: number | boolean | string
  caseSensitive?: boolean
}

const questionTypeConfig: Record<QuestionType, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  multipleChoice: { label: 'Multiple Choice', icon: ListChecks, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  trueFalse: { label: 'True / False', icon: ToggleLeft, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/30' },
  fillInBlank: { label: 'Fill in the Blank', icon: TextCursorInput, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/30' }
}

const defaultQuestion = (type: QuestionType): EditableQuestion => {
  const base: EditableQuestion = { type, question: '' }
  if (type === 'multipleChoice') {
    base.options = ['', '', '', '']
    base.correctAnswer = 0
  } else if (type === 'trueFalse') {
    base.correctAnswer = true
  } else {
    base.correctAnswer = ''
    base.caseSensitive = false
  }
  return base
}


function QuestionTypeSelector({ value, onChange }: { value: QuestionType; onChange: (type: QuestionType) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {(Object.entries(questionTypeConfig) as [QuestionType, typeof questionTypeConfig[QuestionType]][]).map(([type, config]) => {
        const Icon = config.icon
        const isSelected = value === type
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
              isSelected 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 shadow-md' 
                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'
            }`}
          >
            {isSelected && (
              <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3 text-white" />
              </div>
            )}
            <div className={`mx-auto w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center mb-2`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <p className={`text-xs font-medium text-center ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>
              {config.label}
            </p>
          </button>
        )
      })}
    </div>
  )
}

function QuestionFormContent({ 
  data, 
  onChange 
}: { 
  data: EditableQuestion
  onChange: (data: EditableQuestion) => void 
}) {
  const config = questionTypeConfig[data.type]
  
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Question Type</Label>
        <QuestionTypeSelector 
          value={data.type} 
          onChange={(type) => onChange(defaultQuestion(type))} 
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Question Text</Label>
        <Textarea
          value={data.question}
          onChange={(e) => onChange({ ...data, question: e.target.value })}
          placeholder="Enter your question here..."
          rows={3}
          className="resize-none text-base"
        />
      </div>

      {data.type === 'multipleChoice' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Answer Options</Label>
            <span className="text-xs text-muted-foreground">Click to mark correct</span>
          </div>
          <div className="space-y-2">
            {(data.options || []).map((opt, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <button
                  type="button"
                  onClick={() => onChange({ ...data, correctAnswer: i })}
                  className={`shrink-0 h-8 w-8 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                    data.correctAnswer === i 
                      ? 'border-green-500 bg-green-500 text-white shadow-md shadow-green-500/25' 
                      : 'border-gray-300 dark:border-gray-700 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/30'
                  }`}
                >
                  {data.correctAnswer === i ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-medium text-gray-400">{String.fromCharCode(65 + i)}</span>
                  )}
                </button>
                <Input
                  value={opt}
                  onChange={(e) => {
                    const newOptions = [...(data.options || [])]
                    newOptions[i] = e.target.value
                    onChange({ ...data, options: newOptions })
                  }}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  className="flex-1"
                />
                {(data.options?.length || 0) > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                    onClick={() => {
                      const newOptions = data.options?.filter((_, idx) => idx !== i) || []
                      let newCorrect = data.correctAnswer as number
                      if (i === newCorrect) newCorrect = 0
                      else if (i < newCorrect) newCorrect--
                      onChange({ ...data, options: newOptions, correctAnswer: newCorrect })
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {(data.options?.length || 0) < 6 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full border-dashed"
              onClick={() => onChange({ ...data, options: [...(data.options || []), ''] })}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Option
            </Button>
          )}
        </div>
      )}

      {data.type === 'trueFalse' && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Correct Answer</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onChange({ ...data, correctAnswer: true })}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                data.correctAnswer === true 
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/30 shadow-md' 
                  : 'border-gray-200 dark:border-gray-800 hover:border-green-300'
              }`}
            >
              <CheckCircle2 className={`h-6 w-6 mx-auto mb-2 ${data.correctAnswer === true ? 'text-green-600' : 'text-gray-400'}`} />
              <p className={`font-medium ${data.correctAnswer === true ? 'text-green-700 dark:text-green-300' : 'text-gray-600'}`}>True</p>
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...data, correctAnswer: false })}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                data.correctAnswer === false 
                  ? 'border-red-500 bg-red-50 dark:bg-red-950/30 shadow-md' 
                  : 'border-gray-200 dark:border-gray-800 hover:border-red-300'
              }`}
            >
              <Trash2 className={`h-6 w-6 mx-auto mb-2 ${data.correctAnswer === false ? 'text-red-600' : 'text-gray-400'}`} />
              <p className={`font-medium ${data.correctAnswer === false ? 'text-red-700 dark:text-red-300' : 'text-gray-600'}`}>False</p>
            </button>
          </div>
        </div>
      )}

      {data.type === 'fillInBlank' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Correct Answer</Label>
            <div className="relative">
              <Input
                value={String(data.correctAnswer || '')}
                onChange={(e) => onChange({ ...data, correctAnswer: e.target.value })}
                placeholder="Enter the correct answer..."
                className="pr-10"
              />
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <TextCursorInput className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm">Case sensitive matching</Label>
            </div>
            <Switch
              checked={data.caseSensitive || false}
              onCheckedChange={(checked) => onChange({ ...data, caseSensitive: checked })}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function AddQuestionDialog({ 
  open, 
  onOpenChange, 
  onAdd 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (question: EditableQuestion) => void
}) {
  const [data, setData] = useState<EditableQuestion>(defaultQuestion('multipleChoice'))

  const handleAdd = () => {
    if (!data.question.trim()) {
      toast.error("Please enter a question")
      return
    }
    if (data.type === 'multipleChoice' && data.options?.some(o => !o.trim())) {
      toast.error("Please fill in all options")
      return
    }
    if (data.type === 'fillInBlank' && !String(data.correctAnswer).trim()) {
      toast.error("Please enter the correct answer")
      return
    }
    onAdd(data)
    setData(defaultQuestion('multipleChoice'))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">Add New Question</DialogTitle>
              <DialogDescription>Create a new question for your quiz</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <QuestionFormContent data={data} onChange={setData} />
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAdd} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditQuestionDialog({ 
  question,
  open, 
  onOpenChange, 
  onSave 
}: { 
  question: EditableQuestion | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (question: EditableQuestion) => void
}) {
  const [data, setData] = useState<EditableQuestion | null>(null)

  useEffect(() => {
    if (question) setData({ ...question })
  }, [question])

  const handleSave = () => {
    if (!data) return
    if (!data.question.trim()) {
      toast.error("Please enter a question")
      return
    }
    onSave(data)
    onOpenChange(false)
  }

  if (!data) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Pencil className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">Edit Question</DialogTitle>
              <DialogDescription>Modify this question</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <QuestionFormContent data={data} onChange={setData} />
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


function QuestionCard({ 
  question, 
  index,
  onEdit, 
  onDelete 
}: { 
  question: EditableQuestion
  index: number
  onEdit: () => void
  onDelete: () => void
}) {
  const config = questionTypeConfig[question.type]
  const Icon = config.icon
  
  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        question.type === 'multipleChoice' ? 'bg-blue-500' :
        question.type === 'trueFalse' ? 'bg-green-500' : 'bg-purple-500'
      }`} />
      <CardContent className="p-5 pl-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="cursor-grab opacity-0 group-hover:opacity-50 transition-opacity">
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/25">
                {index + 1}
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-w-0 space-y-3">
            <p className="font-medium text-base leading-relaxed">{question.question || 'No question text'}</p>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className={`${config.bgColor} ${config.color} border-0 gap-1.5`}>
                <Icon className="h-3 w-3" />
                {config.label}
              </Badge>
              {question.type === 'multipleChoice' && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <ListChecks className="h-3 w-3" />
                  {question.options?.length} options
                </span>
              )}
              {question.type === 'trueFalse' && (
                <span className={`text-xs font-medium ${question.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                  Answer: {question.correctAnswer ? 'True' : 'False'}
                </span>
              )}
              {question.type === 'fillInBlank' && (
                <span className="text-xs text-muted-foreground">
                  Answer: "{String(question.correctAnswer).substring(0, 20)}{String(question.correctAnswer).length > 20 ? '...' : ''}"
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 px-3 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600" 
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" 
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => quizService.getQuizById(id)
  })

  const [activeTab, setActiveTab] = useState("questions")
  const [hasChanges, setHasChanges] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

  const [formData, setFormData] = useState<{
    title: string
    duration: number
    questionsPerStudent: number
    maxStudents: number | undefined
  } | null>(null)

  const [questions, setQuestions] = useState<EditableQuestion[]>([])
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<{ index: number; question: EditableQuestion } | null>(null)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  useEffect(() => {
    if (quiz && !formData) {
      setFormData({
        title: quiz.title,
        duration: quiz.duration,
        questionsPerStudent: quiz.questionsPerStudent,
        maxStudents: quiz.maxStudents
      })
      setQuestions(quiz.questions?.map(q => ({ 
        _id: q._id,
        type: q.type as QuestionType,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        caseSensitive: q.caseSensitive
      })) || [])
    }
  }, [quiz, formData])

  const updateMutation = useMutation({
    mutationFn: async () => {
      const response = await api.put(`/quiz/${id}`, { ...formData, questions })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', id] })
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      toast.success("Quiz updated successfully")
      setHasChanges(false)
    },
    onError: () => {
      toast.error("Failed to update quiz")
    }
  })

  const handleFormChange = (updates: Partial<typeof formData>) => {
    if (formData) {
      setFormData({ ...formData, ...updates } as typeof formData)
      setHasChanges(true)
    }
  }

  const handleAddQuestion = (question: EditableQuestion) => {
    setQuestions([...questions, question])
    setHasChanges(true)
  }

  const handleEditQuestion = (index: number) => {
    setEditingQuestion({ index, question: questions[index] })
    setEditDialogOpen(true)
  }

  const handleSaveQuestion = (question: EditableQuestion) => {
    if (editingQuestion) {
      const newQuestions = [...questions]
      newQuestions[editingQuestion.index] = question
      setQuestions(newQuestions)
      setHasChanges(true)
      setEditingQuestion(null)
    }
  }

  const confirmDeleteQuestion = () => {
    if (deleteIndex !== null) {
      setQuestions(questions.filter((_, i) => i !== deleteIndex))
      setHasChanges(true)
      setDeleteIndex(null)
    }
  }

  const handleBack = () => {
    if (hasChanges) {
      setShowUnsavedDialog(true)
    } else {
      router.push(`/quizzes/${id}`)
    }
  }

  // Question type counts
  const typeCounts = questions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1
    return acc
  }, {} as Record<QuestionType, number>)

  if (isLoading || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Advanced Edit
                </h1>
                {hasChanges && (
                  <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30 animate-pulse">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Unsaved
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{quiz?.title}</p>
            </div>
          </div>
          <Button 
            onClick={() => updateMutation.mutate()} 
            disabled={updateMutation.isPending || !hasChanges}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
          >
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-white dark:bg-gray-900 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="questions" className="rounded-lg data-[state=active]:bg-indigo-50 dark:data-[state=active]:bg-indigo-950/30 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-300">
              <FileText className="h-4 w-4 mr-2" />
              Questions ({questions.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-indigo-50 dark:data-[state=active]:bg-indigo-950/30 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-300">
              <Sparkles className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                    <Hash className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{questions.length}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                    <ListChecks className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{typeCounts.multipleChoice || 0}</p>
                    <p className="text-xs text-muted-foreground">Multiple Choice</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                    <ToggleLeft className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{typeCounts.trueFalse || 0}</p>
                    <p className="text-xs text-muted-foreground">True/False</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                    <TextCursorInput className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{typeCounts.fillInBlank || 0}</p>
                    <p className="text-xs text-muted-foreground">Fill in Blank</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add Button */}
            <div className="flex justify-end">
              <Button onClick={() => setAddDialogOpen(true)} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
            
            {/* Questions List */}
            {questions.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-200 dark:border-gray-800 bg-transparent">
                <CardContent className="py-16 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
                  <p className="text-muted-foreground mb-6">Click "Add Question" to create your first question</p>
                  <Button onClick={() => setAddDialogOpen(true)} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Question
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <QuestionCard
                    key={q._id || `q-${i}`}
                    question={q}
                    index={i}
                    onEdit={() => handleEditQuestion(i)}
                    onDelete={() => setDeleteIndex(i)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Quiz Settings</CardTitle>
                    <CardDescription>Configure quiz parameters and limits</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">Quiz Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleFormChange({ title: e.target.value })}
                    className="text-lg"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Duration
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min={1}
                        value={formData.duration}
                        onChange={(e) => handleFormChange({ duration: parseInt(e.target.value) || 0 })}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">min</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      Questions Per Student
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={questions.length || 100}
                      value={formData.questionsPerStudent}
                      onChange={(e) => handleFormChange({ questionsPerStudent: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">Max: {questions.length} questions available</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Max Students
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Unlimited"
                      value={formData.maxStudents || ''}
                      onChange={(e) => handleFormChange({ maxStudents: e.target.value ? parseInt(e.target.value) : undefined })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AddQuestionDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onAdd={handleAddQuestion} />
      
      <EditQuestionDialog 
        question={editingQuestion?.question || null} 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        onSave={handleSaveQuestion} 
      />

      <AlertDialog open={deleteIndex !== null} onOpenChange={() => setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this question? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteQuestion} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>You have unsaved changes. Are you sure you want to leave?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push(`/quizzes/${id}`)}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
