"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Gamepad2, Loader2, Clock, FileText, ArrowRight, User, School, IdCard, BookOpen, Mail, Hash } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"

interface QuizInfo {
  _id: string
  title: string
  duration: number
  questionsPerStudent: number
  expiresAt: string
  startDate?: string
  maxStudents?: number
  currentSubmissions?: number
  studentInfoRequirements: {
    firstName: boolean
    middleName: boolean
    lastName: boolean
    suffix: boolean
    studentId: boolean
    course: boolean
    year: boolean
    section: boolean
    email: boolean
  }
}

interface StudentInfo {
  firstName: string
  middleName: string
  lastName: string
  suffix: string
  studentId: string
  course: string
  year: string
  section: string
  email: string
}

export default function JoinPage() {
  const router = useRouter()
  const [step, setStep] = useState<'code' | 'info'>('code')
  const [accessCode, setAccessCode] = useState("")
  const [quizInfo, setQuizInfo] = useState<QuizInfo | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    studentId: "",
    course: "",
    year: "",
    section: "",
    email: ""
  })

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessCode.trim()) {
      toast.error("Please enter a quiz code")
      return
    }

    setIsValidating(true)
    try {
      const response = await api.post('/quiz/validate', { accessCode: accessCode.toUpperCase() })
      setQuizInfo(response.data)
      setStep('info')
      toast.success("Quiz found! Please enter your information.")
    } catch (error: any) {
      const message = error.response?.data?.message || "Invalid quiz code"
      toast.error(message)
    } finally {
      setIsValidating(false)
    }
  }

  const handleStartQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quizInfo) return

    const reqs = quizInfo.studentInfoRequirements
    
    // Validate required fields
    if (reqs.firstName && !studentInfo.firstName.trim()) {
      toast.error("First name is required")
      return
    }
    if (reqs.lastName && !studentInfo.lastName.trim()) {
      toast.error("Last name is required")
      return
    }
    if (reqs.studentId && !studentInfo.studentId.trim()) {
      toast.error("Student ID is required")
      return
    }
    if (reqs.email && !studentInfo.email.trim()) {
      toast.error("Email is required")
      return
    }

    setIsStarting(true)
    try {
      // Store student info and quiz code in sessionStorage for the quiz page
      sessionStorage.setItem('quizAccessCode', accessCode.toUpperCase())
      sessionStorage.setItem('studentInfo', JSON.stringify(studentInfo))
      sessionStorage.setItem('quizTitle', quizInfo.title)
      sessionStorage.setItem('quizDuration', quizInfo.duration.toString())
      
      router.push('/take-quiz')
    } catch (error: any) {
      toast.error("Failed to start quiz. Please try again.")
      setIsStarting(false)
    }
  }

  const handleInputChange = (field: keyof StudentInfo, value: string) => {
    setStudentInfo(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute h-full w-full bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <AnimatePresence mode="wait">
          {step === 'code' ? (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl transition-all hover:border-primary/20 hover:shadow-primary/10">
                <CardHeader className="space-y-1 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-1 ring-primary/20">
                    <Gamepad2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-3xl font-bold tracking-tight">Join Quiz</CardTitle>
                  <CardDescription className="text-base">
                    Enter the quiz code to join a session
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleValidateCode}>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="code" className="sr-only">Quiz Code</Label>
                      <Input 
                        id="code" 
                        placeholder="ENTER CODE" 
                        className="text-center text-2xl tracking-[0.5em] font-mono h-16 uppercase placeholder:tracking-normal placeholder:text-base placeholder:font-sans bg-background/50 border-primary/20 focus-visible:ring-primary" 
                        maxLength={8}
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                        required 
                        disabled={isValidating}
                      />
                    </div>
                    <Button 
                      type="submit"
                      className="w-full text-lg h-12 font-bold shadow-lg shadow-primary/20" 
                      size="lg"
                      disabled={isValidating}
                    >
                      {isValidating ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        "Continue"
                      )}
                    </Button>
                  </CardContent>
                </form>
                <CardFooter className="flex flex-col space-y-4">
                  <p className="text-center text-sm text-muted-foreground">
                    Ask your instructor for the quiz code.
                  </p>
                </CardFooter>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
                <CardHeader className="space-y-1">
                  <button 
                    onClick={() => setStep('code')}
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-2 transition-colors w-fit"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Change code
                  </button>
                  <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4 ring-1 ring-green-500/20">
                    <User className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-center">{quizInfo?.title}</CardTitle>
                  <CardDescription className="text-center">
                    Enter your information to start the quiz
                  </CardDescription>
                  
                  {/* Quiz Info */}
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{quizInfo?.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{quizInfo?.questionsPerStudent} questions</span>
                    </div>
                  </div>
                </CardHeader>
                <form onSubmit={handleStartQuiz}>
                  <CardContent className="space-y-4">
                    {quizInfo?.studentInfoRequirements && (
                      <>
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-3">
                          {quizInfo.studentInfoRequirements.firstName && (
                            <div className="space-y-2">
                              <Label htmlFor="firstName">First Name *</Label>
                              <Input
                                id="firstName"
                                placeholder="Juan"
                                value={studentInfo.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                required
                              />
                            </div>
                          )}
                          {quizInfo.studentInfoRequirements.lastName && (
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Last Name *</Label>
                              <Input
                                id="lastName"
                                placeholder="Dela Cruz"
                                value={studentInfo.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                required
                              />
                            </div>
                          )}
                        </div>

                        {(quizInfo.studentInfoRequirements.middleName || quizInfo.studentInfoRequirements.suffix) && (
                          <div className="grid grid-cols-2 gap-3">
                            {quizInfo.studentInfoRequirements.middleName && (
                              <div className="space-y-2">
                                <Label htmlFor="middleName">Middle Name</Label>
                                <Input
                                  id="middleName"
                                  placeholder="Santos"
                                  value={studentInfo.middleName}
                                  onChange={(e) => handleInputChange('middleName', e.target.value)}
                                />
                              </div>
                            )}
                            {quizInfo.studentInfoRequirements.suffix && (
                              <div className="space-y-2">
                                <Label htmlFor="suffix">Suffix</Label>
                                <Input
                                  id="suffix"
                                  placeholder="Jr., III, etc."
                                  value={studentInfo.suffix}
                                  onChange={(e) => handleInputChange('suffix', e.target.value)}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Student ID */}
                        {quizInfo.studentInfoRequirements.studentId && (
                          <div className="space-y-2">
                            <Label htmlFor="studentId" className="flex items-center gap-2">
                              <IdCard className="h-4 w-4" />
                              Student ID *
                            </Label>
                            <Input
                              id="studentId"
                              placeholder="2024-00001"
                              value={studentInfo.studentId}
                              onChange={(e) => handleInputChange('studentId', e.target.value)}
                              required
                            />
                          </div>
                        )}

                        {/* Course, Year, Section */}
                        {(quizInfo.studentInfoRequirements.course || quizInfo.studentInfoRequirements.year || quizInfo.studentInfoRequirements.section) && (
                          <div className="grid grid-cols-3 gap-3">
                            {quizInfo.studentInfoRequirements.course && (
                              <div className="space-y-2">
                                <Label htmlFor="course">Course</Label>
                                <Input
                                  id="course"
                                  placeholder="BSIT"
                                  value={studentInfo.course}
                                  onChange={(e) => handleInputChange('course', e.target.value)}
                                />
                              </div>
                            )}
                            {quizInfo.studentInfoRequirements.year && (
                              <div className="space-y-2">
                                <Label htmlFor="year">Year</Label>
                                <Input
                                  id="year"
                                  placeholder="3rd"
                                  value={studentInfo.year}
                                  onChange={(e) => handleInputChange('year', e.target.value)}
                                />
                              </div>
                            )}
                            {quizInfo.studentInfoRequirements.section && (
                              <div className="space-y-2">
                                <Label htmlFor="section">Section</Label>
                                <Input
                                  id="section"
                                  placeholder="A"
                                  value={studentInfo.section}
                                  onChange={(e) => handleInputChange('section', e.target.value)}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Email */}
                        {quizInfo.studentInfoRequirements.email && (
                          <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="juan@example.com"
                              value={studentInfo.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                            />
                          </div>
                        )}
                      </>
                    )}

                    <Button 
                      type="submit"
                      className="w-full text-lg h-12 font-bold shadow-lg shadow-primary/20 mt-4" 
                      size="lg"
                      disabled={isStarting}
                    >
                      {isStarting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          Start Quiz
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
