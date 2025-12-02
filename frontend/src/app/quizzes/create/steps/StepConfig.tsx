"use client"

import { useQuizStore, Difficulty } from "@/store/quiz-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "../../../../components/ui/badge"
import { Check, BrainCircuit, Zap, BarChart3, Layers, ArrowRight } from "lucide-react"
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

  const setQuestionCount = (count: number) => {
    // Distribute evenly-ish
    const types = Object.keys(config.distribution)
    const base = Math.floor(count / types.length)
    const remainder = count % types.length
    
    const newDist: any = {}
    types.forEach((t, i) => {
      newDist[t] = base + (i < remainder ? 1 : 0)
    })

    setConfig({ 
      questionCount: count,
      distribution: newDist
    })
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full animate-in fade-in slide-in-from-right-8 duration-500">
      {/* Left Column: General Settings */}
      <div className="w-full lg:w-1/3 space-y-4">
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BrainCircuit className="h-4 w-4 text-indigo-500" />
              Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
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
                  <RadioGroup 
                    value={config.difficulty} 
                    onValueChange={(val) => setConfig({ difficulty: val as Difficulty })}
                    className="hidden"
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                  </RadioGroup>
                  <div 
                    onClick={() => setConfig({ difficulty: option.value as Difficulty })}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent/50",
                      isSelected 
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-900 dark:text-indigo-100" 
                        : "border-muted bg-card text-muted-foreground hover:border-indigo-200"
                    )}
                  >
                    <div className={cn("p-1.5 rounded-full", option.bg, option.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-sm">{option.label}</span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 text-indigo-600">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-500" />
                Total Questions
              </div>
              <Badge variant="secondary" className="text-sm font-bold">
                {config.questionCount}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Slider
              value={[config.questionCount]}
              onValueChange={(val) => setQuestionCount(val[0])}
              max={50}
              min={1}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between gap-2">
              {[5, 10, 15, 20].map((num) => (
                <Button
                  key={num}
                  variant={config.questionCount === num ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQuestionCount(num)}
                  className="flex-1 h-8 text-xs"
                >
                  {num}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Distribution */}
      <div className="flex-1 flex flex-col">
        <Card className="border shadow-sm flex-1 flex flex-col">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-500" />
                Question Distribution
              </div>
              <div className={cn(
                "flex items-center gap-2 text-sm px-3 py-1 rounded-full border transition-colors",
                isTotalMatching 
                  ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900"
                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900"
              )}>
                <span className="font-medium">Total: {totalQuestions} / {config.questionCount}</span>
                {isTotalMatching ? <Check className="h-3 w-3" /> : <span className="text-xs font-bold">!</span>}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            <div className="divide-y">
              {[
                { id: 'multiple-choice', label: 'Multiple Choice', desc: 'Standard 4-option questions' },
                { id: 'true-false', label: 'True / False', desc: 'Binary choice questions' },
                { id: 'fill-in-the-blank', label: 'Fill in the Blank', desc: 'Complete the sentence' },
                { id: 'matching', label: 'Matching', desc: 'Pair related items' }
              ].map((type) => (
                <div key={type.id} className="p-4 hover:bg-accent/20 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <Label className="text-sm font-semibold">{type.label}</Label>
                      <p className="text-xs text-muted-foreground">{type.desc}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input 
                        type="number" 
                        min={0} 
                        max={config.questionCount}
                        value={config.distribution[type.id as keyof typeof config.distribution]}
                        onChange={(e) => handleDistributionChange(type.id, parseInt(e.target.value) || 0)}
                        className="w-16 h-8 text-right font-mono"
                      />
                    </div>
                  </div>
                  <Slider
                    value={[config.distribution[type.id as keyof typeof config.distribution]]}
                    onValueChange={(val) => handleDistributionChange(type.id, val[0])}
                    max={config.questionCount}
                    step={1}
                    className="py-1"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
