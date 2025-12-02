"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuizStore } from "@/store/quiz-store"
import { aiService } from "@/services/ai.service"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Check, Sparkles, BookOpen, Settings2, Eye, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// Step Components
import StepSource from "./steps/StepSource"
import StepConfig from "./steps/StepConfig"
import StepReview from "./steps/StepReview"
import StepFinalize from "./steps/StepFinalize"

const STEPS = [
  { id: 1, title: "Source", description: "Choose content", icon: BookOpen },
  { id: 2, title: "Configure", description: "Set options", icon: Settings2 },
  { id: 3, title: "Review", description: "Edit questions", icon: Eye },
  { id: 4, title: "Publish", description: "Finalize quiz", icon: Send },
]

export default function CreateQuizPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const { questions, sourceType, sourceContent, sourceMetadata, setSource } = useQuizStore()

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!sourceType) {
        toast.error("Please select a source type and provide content.")
        return
      }
      
      // Process URL and YouTube sources before moving to next step
      if (sourceType === 'url' || sourceType === 'video') {
        setIsProcessing(true)
        try {
          let result
          if (sourceType === 'url') {
            result = await aiService.processUrl(sourceContent as string)
          } else {
            result = await aiService.processVideo(sourceContent as string)
          }
          setSource(sourceType, result.content, {
            ...sourceMetadata,
            processedContent: result.content
          })
          toast.success("Content extracted successfully!")
        } catch (error: any) {
          toast.error(error.response?.data?.message || error.message || "Failed to extract content")
          setIsProcessing(false)
          return
        } finally {
          setIsProcessing(false)
        }
      }
      
      // Process topic to get content
      if (sourceType === 'topic') {
        setIsProcessing(true)
        try {
          const result = await aiService.processTopic(sourceContent as string)
          setSource(sourceType, result.content, {
            ...sourceMetadata,
            processedContent: result.content
          })
        } catch (error: any) {
          toast.error(error.response?.data?.message || error.message || "Failed to process topic")
          setIsProcessing(false)
          return
        } finally {
          setIsProcessing(false)
        }
      }
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

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 dark:from-indigo-400/20 dark:to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/5 to-cyan-400/5 dark:from-blue-400/10 dark:to-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-6 max-w-7xl flex flex-col min-h-screen">
        
        {/* Compact Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              className="gap-2 text-muted-foreground hover:text-foreground -ml-2 h-9" 
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 dark:border-indigo-800/50">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">AI-Powered</span>
            </div>
          </div>

          {/* Title and Stepper Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Create Quiz
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].description}
              </p>
            </div>

            {/* Desktop Stepper */}
            <div className="hidden lg:flex items-center gap-2 bg-white dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-2 border border-slate-200 dark:border-slate-700/50 shadow-sm">
              {STEPS.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id
                
                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => {
                        if (isCompleted) setCurrentStep(step.id)
                      }}
                      disabled={!isCompleted && !isActive}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300",
                        isActive && "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25",
                        isCompleted && "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-pointer",
                        !isActive && !isCompleted && "text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                        isActive && "bg-white/20",
                        isCompleted && "bg-indigo-500 text-white",
                        !isActive && !isCompleted && "bg-slate-200 dark:bg-slate-700"
                      )}>
                        {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.id}
                      </div>
                      <span className="font-medium text-sm">{step.title}</span>
                    </button>
                    {index < STEPS.length - 1 && (
                      <div className={cn(
                        "w-8 h-0.5 mx-1 rounded-full transition-colors",
                        currentStep > step.id ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-700"
                      )} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mobile Progress */}
          <div className="lg:hidden mt-4">
            <div className="flex gap-1.5">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-300",
                    currentStep >= step.id 
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500" 
                      : "bg-slate-200 dark:bg-slate-700"
                  )}
                />
              ))}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full"
            >
              <div className="bg-white dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-lg shadow-slate-300/50 dark:shadow-slate-900/50 p-4 sm:p-6 lg:p-8 min-h-[500px]">
                {currentStep === 1 && <StepSource />}
                {currentStep === 2 && <StepConfig />}
                {currentStep === 3 && <StepReview />}
                {currentStep === 4 && <StepFinalize />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700/50 z-50 lg:static lg:bg-transparent lg:border-none lg:p-0 lg:mt-6">
          <div className="container mx-auto max-w-7xl flex justify-between items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleBack} 
              size="lg"
              className="min-w-[100px] sm:min-w-[120px] h-11 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2 sm:mr-2" />
              <span>{currentStep === 1 ? "Cancel" : "Back"}</span>
            </Button>
            
            {currentStep < 4 && (
              <Button 
                onClick={handleNext} 
                size="lg" 
                className="min-w-[120px] sm:min-w-[160px] h-11 gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 border-0"
                disabled={(currentStep === 3 && questions.length === 0) || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{currentStep === 3 ? "Finalize" : "Continue"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
