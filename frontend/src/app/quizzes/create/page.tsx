"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuizStore } from "@/store/quiz-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Save, Wand2 } from "lucide-react"
import { toast } from "sonner"

// Step Components (Placeholders for now)
import StepSource from "./steps/StepSource"
import StepConfig from "./steps/StepConfig"
import StepReview from "./steps/StepReview"
import StepFinalize from "./steps/StepFinalize"

const STEPS = [
  { id: 1, title: "Source Material", description: "Upload or choose content" },
  { id: 2, title: "Configuration", description: "Customize difficulty & types" },
  { id: 3, title: "Review & Edit", description: "Refine generated questions" },
  { id: 4, title: "Finalize", description: "Set quiz details" },
]

export default function CreateQuizPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const { reset, questions, sourceType, sourceMetadata } = useQuizStore()

  // Reset store on mount (optional, or handle via a "Start Over" button)
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
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    } else {
      router.back()
    }
  }

  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl min-h-screen flex flex-col">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground hover:text-primary cursor-pointer transition-colors" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Library</span>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Step {currentStep} of {STEPS.length}
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create New Quiz</h1>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="grid grid-cols-4 gap-4 pt-4">
          {STEPS.map((step) => (
            <div 
              key={step.id}
              className={`flex flex-col gap-1 border-t-4 pt-4 transition-colors ${
                currentStep >= step.id 
                  ? "border-indigo-600 text-foreground" 
                  : "border-gray-200 dark:border-gray-800 text-muted-foreground"
              }`}
            >
              <span className={`text-xs font-bold uppercase tracking-wider ${
                currentStep >= step.id ? "text-indigo-600" : ""
              }`}>
                Step 0{step.id}
              </span>
              <span className="font-semibold text-sm">{step.title}</span>
              <span className="text-xs hidden md:block opacity-70">{step.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="flex-1 p-6 md:p-8 shadow-lg border-muted/40 bg-card/50 backdrop-blur-sm mb-8">
        {currentStep === 1 && <StepSource onNext={handleNext} />}
        {currentStep === 2 && <StepConfig onNext={handleNext} />}
        {currentStep === 3 && <StepReview onNext={handleNext} />}
        {currentStep === 4 && <StepFinalize />}
      </Card>

      {/* Footer Navigation (Global, though steps might have their own specific actions) */}
      <div className="flex justify-between items-center mt-auto pb-8">
        <Button variant="outline" onClick={handleBack} size="lg">
          {currentStep === 1 ? "Cancel" : "Back"}
        </Button>
        
        {currentStep < 4 && (
           <Button onClick={handleNext} size="lg" className="gap-2 shadow-lg shadow-primary/20" disabled={currentStep === 3 && questions.length === 0}>
             {currentStep === 3 ? "Finalize Quiz" : "Next Step"}
             <ArrowRight className="h-4 w-4" />
           </Button>
        )}
      </div>
    </div>
  )
}
