"use client"

import { useQuizStore, Difficulty } from "@/store/quiz-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { 
  Check, 
  BrainCircuit, 
  Zap, 
  BarChart3, 
  Layers, 
  Sparkles,
  ListChecks,
  ToggleLeft,
  PenLine,
  Link2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"



const difficultyOptions = [
  { 
    value: 'easy' as Difficulty, 
    label: 'Easy', 
    icon: Zap, 
    description: 'Basic recall',
    gradient: 'from-emerald-500 to-green-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-500 ring-emerald-500/20'
  },
  { 
    value: 'medium' as Difficulty, 
    label: 'Medium', 
    icon: BarChart3, 
    description: 'Understanding',
    gradient: 'from-amber-500 to-yellow-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-500 ring-amber-500/20'
  },
  { 
    value: 'hard' as Difficulty, 
    label: 'Hard', 
    icon: Layers, 
    description: 'Analysis',
    gradient: 'from-red-500 to-rose-500',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-500 ring-red-500/20'
  },
  { 
    value: 'mixed' as Difficulty, 
    label: 'Mixed', 
    icon: BrainCircuit, 
    description: 'Varied levels',
    gradient: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    border: 'border-violet-500 ring-violet-500/20'
  }
]

const questionTypes = [
  { 
    id: 'multiple-choice', 
    label: 'Multiple Choice', 
    icon: ListChecks,
    description: '4 options, 1 correct',
    gradient: 'from-blue-500 to-indigo-500'
  },
  { 
    id: 'true-false', 
    label: 'True / False', 
    icon: ToggleLeft,
    description: 'Binary choice',
    gradient: 'from-emerald-500 to-teal-500'
  },
  { 
    id: 'fill-in-the-blank', 
    label: 'Fill in Blank', 
    icon: PenLine,
    description: 'Complete sentence',
    gradient: 'from-orange-500 to-amber-500'
  },
  { 
    id: 'matching', 
    label: 'Matching', 
    icon: Link2,
    description: 'Pair items',
    gradient: 'from-pink-500 to-rose-500'
  }
]

export default function StepConfig() {
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-2">
          <Sparkles className="h-3 w-3" />
          Step 2 of 4
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Configure Your Quiz</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Set difficulty and question distribution
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Difficulty Selection */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <BrainCircuit className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Difficulty Level</h3>
                <p className="text-xs text-muted-foreground">Choose question complexity</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {difficultyOptions.map((option) => {
                const Icon = option.icon
                const isSelected = config.difficulty === option.value
                
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => setConfig({ difficulty: option.value })}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      isSelected 
                        ? `${option.border} ${option.bg} ring-4` 
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                      isSelected 
                        ? `bg-gradient-to-br ${option.gradient} shadow-lg` 
                        : "bg-slate-100 dark:bg-slate-700"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5",
                        isSelected ? "text-white" : "text-slate-500 dark:text-slate-400"
                      )} />
                    </div>
                    <div className="text-center">
                      <span className="font-semibold text-sm block">{option.label}</span>
                      <span className="text-[10px] text-muted-foreground">{option.description}</span>
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 shadow flex items-center justify-center">
                        <Check className="h-3 w-3 text-indigo-500" />
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Question Count */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Total Questions</h3>
                  <p className="text-xs text-muted-foreground">How many to generate</p>
                </div>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                {config.questionCount}
              </div>
            </div>
            
            <Slider
              value={[config.questionCount]}
              onValueChange={(val) => setQuestionCount(val[0])}
              max={50}
              min={1}
              step={1}
              className="mb-4"
            />
            
            <div className="flex gap-2">
              {[5, 10, 15, 20, 25].map((num) => (
                <Button
                  key={num}
                  variant={config.questionCount === num ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQuestionCount(num)}
                  className={cn(
                    "flex-1 h-9 text-xs font-medium rounded-lg",
                    config.questionCount === num && "bg-gradient-to-r from-indigo-500 to-purple-500 border-0"
                  )}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Distribution */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Question Types</h3>
                  <p className="text-xs text-muted-foreground">Distribute across types</p>
                </div>
              </div>
              <div className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors",
                isTotalMatching 
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              )}>
                {isTotalMatching ? <Check className="h-3 w-3" /> : <span>!</span>}
                {totalQuestions} / {config.questionCount}
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {questionTypes.map((type) => {
              const Icon = type.icon
              const value = config.distribution[type.id as keyof typeof config.distribution]
              
              return (
                <div key={type.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-sm",
                      type.gradient
                    )}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-sm font-medium block">{type.label}</Label>
                      <p className="text-[10px] text-muted-foreground">{type.description}</p>
                    </div>
                    <Input 
                      type="number" 
                      min={0} 
                      max={config.questionCount}
                      value={value}
                      onChange={(e) => handleDistributionChange(type.id, parseInt(e.target.value) || 0)}
                      className="w-16 h-9 text-center font-mono text-sm rounded-lg"
                    />
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={(val) => handleDistributionChange(type.id, val[0])}
                    max={config.questionCount}
                    step={1}
                    className="py-1"
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
