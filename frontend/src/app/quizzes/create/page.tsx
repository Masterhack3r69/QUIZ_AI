"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuizStore } from "@/store/quiz-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// Step Components
import StepSource from "./steps/StepSource"
import StepConfig from "./steps/StepConfig"
import StepReview from "./steps/StepReview"
import StepFinalize from "./steps/StepFinalize"

const STEPS = [
  { id: 1, title: "Source", description: "Choose content" },
  { id: 2, title: "Configure", description: "Set difficulty" },
  { id: 3, title: "Review", description: "Edit questions" },
  { id: 4, title: "Finalize", description: "Publish quiz" },
]

export default function CreateQuizPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const { reset, questions, sourceType } = useQuizStore()

  // Optional: Reset on mount if needed, but usually we want to persist state if user navigates away and back
  // useEffect(() => { reset() }, [])

  const handleNext = () => {
    if (currentStep === 1 && !sourceType) {
      toast.error("Please select a source type and provide content.")
      return
    }
    if (currentStep === 3 && questions.length === 0) {
      toast.error("No questions generated yet.")
      return
    }
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      router.back()
    }
  }

  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl flex flex-col min-h-screen">
        
        {/* Header Section */}
        <header className="mb-10 space-y-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              className="gap-2 text-muted-foreground hover:text-primary -ml-4" 
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
              <Sparkles className="h-3 w-3" />
              AI Quiz Generator
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                Create New Quiz
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Follow the steps to generate an engaging quiz for your students.
              </p>
            </div>
          </div>

          {/* Modern Stepper */}
          <div className="relative mt-8">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0 hidden md:block" />
            <div className="grid grid-cols-4 gap-4 relative z-10">
              {STEPS.map((step) => {
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id
                
                return (
                  <div key={step.id} className="flex flex-col items-center gap-3">
                    <div 
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-background",
                        isActive ? "border-indigo-600 text-indigo-600 scale-110 shadow-lg shadow-indigo-500/20" : 
                        isCompleted ? "border-indigo-600 bg-indigo-600 text-white" : "border-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? <Check className="h-5 w-5" /> : <span className="font-bold">{step.id}</span>}
                    </div>
                    <div className="text-center hidden md:block">
                      <p className={cn("text-sm font-semibold transition-colors", isActive || isCompleted ? "text-foreground" : "text-muted-foreground")}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            {/* Mobile Progress Bar */}
            <div className="md:hidden mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Step {currentStep} of {STEPS.length}</span>
                <span className="text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </header>

        {/* Main Content with Transitions */}
        <div className="flex-1 mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20, x: 10 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20, x: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Card className="p-6 md:p-10 shadow-xl border-muted/40 bg-card/80 backdrop-blur-sm min-h-[500px]">
                {currentStep === 1 && <StepSource onNext={handleNext} />}
                {currentStep === 2 && <StepConfig onNext={handleNext} />}
                {currentStep === 3 && <StepReview onNext={handleNext} />}
                {currentStep === 4 && <StepFinalize />}
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-50 md:static md:bg-transparent md:border-none md:p-0">
          <div className="container mx-auto max-w-6xl flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={handleBack} 
              size="lg"
              className="min-w-[120px]"
            >
              {currentStep === 1 ? "Cancel" : "Back"}
            </Button>
            
            {currentStep < 4 && (
              <Button 
                onClick={handleNext} 
                size="lg" 
                className="min-w-[140px] gap-2 shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={currentStep === 3 && questions.length === 0}
              >
                {currentStep === 3 ? "Finalize Quiz" : "Next Step"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
