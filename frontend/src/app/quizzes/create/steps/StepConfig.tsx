"use client"

import { useQuizStore, Difficulty } from "@/store/quiz-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "../../../../components/ui/badge"
import { Check, BrainCircuit, Zap, BarChart3, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface StepConfigProps {
  onNext: () => void
}

export default function StepConfig({ onNext }: StepConfigProps) {
  const { config, setConfig } = useQuizStore()

  const handleDistributionChange = (type: string, value: number) => {
    setConfig({
      distribution: {
        ...config.distribution,
        [type]: value
      }
    })
  }

  const totalQuestions = Object.values(config.distribution).reduce((a, b) => a + b, 0)
  const isTotalMatching = totalQuestions === config.questionCount

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold">Quiz Configuration</h2>
        <p className="text-muted-foreground">Customize the difficulty and structure of your quiz.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: General Settings */}
        <div className="space-y-6">
          <Card className="border-2 border-muted/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BrainCircuit className="h-5 w-5 text-indigo-500" />
                Difficulty Level
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup 
                value={config.difficulty} 
                onValueChange={(val) => setConfig({ difficulty: val as Difficulty })}
                className="grid grid-cols-2 gap-4"
              >
                {[
                  { value: 'easy', label: 'Easy', icon: Zap, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
                  { value: 'medium', label: 'Medium', icon: BarChart3, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
                  { value: 'hard', label: 'Hard', icon: Layers, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
                  { value: 'mixed', label: 'Mixed', icon: BrainCircuit, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' }
                ].map((option) => {
                  const Icon = option.icon
                  const isSelected = config.difficulty === option.value
                  return (
                    <div key={option.value} className="relative">
                      <RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
                      <Label 
                        htmlFor={option.value} 
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-accent/50",
                          isSelected 
                            ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-900 dark:text-indigo-100" 
                            : "border-muted bg-card text-muted-foreground hover:border-indigo-200"
                        )}
                      >
                        <div className={cn("p-2 rounded-full", option.bg, option.color)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-semibold">{option.label}</span>
                      </Label>
                      {isSelected && (
                        <div className="absolute top-2 right-2 text-indigo-600">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className="border-2 border-muted/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-indigo-500" />
                  Total Questions
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {config.questionCount}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Slider 
                value={[config.questionCount]} 
                min={1} 
                max={50} 
                step={1} 
                onValueChange={(vals) => setConfig({ questionCount: vals[0] })}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground font-medium uppercase tracking-wider">
                <span>1 Question</span>
                <span>25 Questions</span>
                <span>50 Questions</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Question Types */}
        <div className="space-y-6">
          <Card className={cn(
            "border-2 shadow-sm transition-all duration-300",
            isTotalMatching ? "border-muted/50 hover:shadow-md" : "border-orange-200 dark:border-orange-900 bg-orange-50/10"
          )}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-500" />
                  Question Distribution
                </div>
                <div className={cn(
                  "flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full transition-colors",
                  isTotalMatching 
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                    : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                )}>
                  <span>{totalQuestions} / {config.questionCount}</span>
                  {isTotalMatching ? <Check className="h-3 w-3" /> : <span className="text-xs">Adjust counts</span>}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground -mt-2">
                Specify how many questions of each type you want.
              </p>

              <div className="space-y-5">
                {[
                  { id: 'multiple-choice', label: 'Multiple Choice', desc: 'Standard 4-option questions' },
                  { id: 'true-false', label: 'True / False', desc: 'Binary choice questions' },
                  { id: 'fill-in-the-blank', label: 'Fill in the Blank', desc: 'Complete the sentence' },
                  { id: 'short-answer', label: 'Short Answer', desc: 'Brief written responses' }
                ].map((type) => (
                  <div key={type.id} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor={type.id} className="text-base font-medium group-hover:text-primary transition-colors">
                        {type.label}
                      </Label>
                      <Input 
                        id={type.id} 
                        type="number" 
                        min={0} 
                        max={config.questionCount}
                        value={config.distribution[type.id as keyof typeof config.distribution]}
                        onChange={(e) => handleDistributionChange(type.id, parseInt(e.target.value) || 0)}
                        className="w-20 text-center font-bold h-9"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider 
                        value={[config.distribution[type.id as keyof typeof config.distribution]]}
                        min={0}
                        max={config.questionCount}
                        step={1}
                        onValueChange={(vals) => handleDistributionChange(type.id, vals[0])}
                        className="flex-1"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {!isTotalMatching && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 text-sm flex items-center gap-2"
                >
                  <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                  Total distribution must match {config.questionCount} questions.
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
