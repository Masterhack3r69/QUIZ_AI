"use client"

import { useState } from "react"
import { useQuizStore, Difficulty, Language } from "@/store/quiz-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
  Link2,
  Globe,
  ChevronsUpDown,
  Search
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

const languageOptions: { value: Language; label: string; flag: string }[] = [
  { value: 'Auto', label: 'Auto-detect', flag: '🌐' },
  { value: 'English', label: 'English', flag: '🇺🇸' },
  { value: 'Filipino', label: 'Filipino', flag: '🇵🇭' },
  { value: 'Spanish', label: 'Spanish', flag: '🇪🇸' },
  { value: 'French', label: 'French', flag: '🇫🇷' },
  { value: 'German', label: 'German', flag: '🇩🇪' },
  { value: 'Japanese', label: 'Japanese', flag: '🇯🇵' },
  { value: 'Korean', label: 'Korean', flag: '🇰🇷' },
  { value: 'Chinese', label: 'Chinese', flag: '🇨🇳' },
]

export default function StepConfig() {
  const { config, setConfig } = useQuizStore()
  const [languageOpen, setLanguageOpen] = useState(false)
  const [languageSearch, setLanguageSearch] = useState("")

  // Priority order for auto-adjustment (first one with questions gets adjusted)
  const adjustmentPriority = ['multiple-choice', 'true-false', 'fill-in-the-blank', 'matching']
  
  // Filter languages based on search
  const filteredLanguages = languageOptions.filter(lang => 
    lang.label.toLowerCase().includes(languageSearch.toLowerCase())
  )
  
  // Get current language display
  const currentLanguage = languageOptions.find(l => l.value === config.targetLanguage)

  const handleDistributionChange = (type: string, value: number) => {
    const currentValue = config.distribution[type as keyof typeof config.distribution]
    const diff = value - currentValue // positive = adding, negative = removing
    
    // Find a type to compensate (not the one being changed)
    const newDistribution = { ...config.distribution, [type]: value }
    
    // Calculate how much we need to adjust
    let remaining = -diff // if adding questions, we need to remove from others
    
    // Go through priority list and adjust
    for (const adjustType of adjustmentPriority) {
      if (adjustType === type || remaining === 0) continue
      
      const currentAdjustValue = newDistribution[adjustType as keyof typeof newDistribution]
      
      if (remaining < 0) {
        // Need to remove questions from this type
        const canRemove = Math.min(currentAdjustValue, Math.abs(remaining))
        newDistribution[adjustType as keyof typeof newDistribution] = currentAdjustValue - canRemove
        remaining += canRemove
      } else {
        // Need to add questions to this type (when user reduces a type)
        newDistribution[adjustType as keyof typeof newDistribution] = currentAdjustValue + remaining
        remaining = 0
      }
    }
    
    setConfig({ distribution: newDistribution })
  }

  const totalQuestions = Object.values(config.distribution).reduce((a, b) => a + b, 0)
  const isTotalMatching = totalQuestions === config.questionCount

  const setQuestionCount = (count: number) => {
    // When changing total, put all questions in multiple-choice, keep others at 0
    setConfig({ 
      questionCount: count,
      distribution: {
        'multiple-choice': count,
        'true-false': 0,
        'fill-in-the-blank': 0,
        'matching': 0
      }
    })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
          <Sparkles className="h-3 w-3" />
          Step 2 of 4
        </div>
        <h2 className="text-xl font-bold text-foreground">Configure Your Quiz</h2>
        <p className="text-muted-foreground text-sm">Set difficulty and question distribution</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Difficulty Selection */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <BrainCircuit className="h-3.5 w-3.5 text-white" />
              </div>
              <h3 className="font-semibold text-sm">Difficulty Level</h3>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
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
                      "relative flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all",
                      isSelected 
                        ? `${option.border} ${option.bg} ring-2` 
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-md flex items-center justify-center transition-all",
                      isSelected 
                        ? `bg-gradient-to-br ${option.gradient} shadow` 
                        : "bg-slate-100 dark:bg-slate-700"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4",
                        isSelected ? "text-white" : "text-slate-500 dark:text-slate-400"
                      )} />
                    </div>
                    <span className="font-medium text-xs">{option.label}</span>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 shadow flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-indigo-500" />
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Question Count */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Layers className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="font-semibold text-sm">Total Questions</h3>
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                {config.questionCount}
              </div>
            </div>
            
            <Slider
              value={[config.questionCount]}
              onValueChange={(val) => setQuestionCount(val[0])}
              max={50}
              min={1}
              step={1}
              className="mb-3"
            />
            
            <div className="flex gap-1.5">
              {[5, 10, 15, 20, 25].map((num) => (
                <Button
                  key={num}
                  variant={config.questionCount === num ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQuestionCount(num)}
                  className={cn(
                    "flex-1 h-8 text-xs font-medium rounded-md",
                    config.questionCount === num && "bg-gradient-to-r from-indigo-500 to-purple-500 border-0"
                  )}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                  <Globe className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="font-semibold text-sm">Language</h3>
              </div>
              
              <Popover open={languageOpen} onOpenChange={setLanguageOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={languageOpen}
                    className="w-40 justify-between h-9 rounded-lg"
                  >
                    <span className="flex items-center gap-2">
                      <span>{currentLanguage?.flag}</span>
                      <span className="text-sm">{currentLanguage?.label}</span>
                    </span>
                    <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-0" align="end">
                  <div className="flex items-center border-b px-2">
                    <Search className="mr-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                    <input
                      placeholder="Search..."
                      value={languageSearch}
                      onChange={(e) => setLanguageSearch(e.target.value)}
                      className="flex h-9 w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="max-h-[180px] overflow-y-auto p-1">
                    {filteredLanguages.length === 0 ? (
                      <div className="py-4 text-center text-xs text-muted-foreground">
                        No language found.
                      </div>
                    ) : (
                      filteredLanguages.map((lang) => (
                        <button
                          key={lang.value}
                          onClick={() => {
                            setConfig({ targetLanguage: lang.value })
                            setLanguageOpen(false)
                            setLanguageSearch("")
                          }}
                          className={cn(
                            "relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                            config.targetLanguage === lang.value && "bg-accent"
                          )}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                          {config.targetLanguage === lang.value && (
                            <Check className="ml-auto h-3.5 w-3.5 text-teal-500" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Right Column - Distribution */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <BarChart3 className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="font-semibold text-sm">Question Types</h3>
              </div>
              <div className={cn(
                "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-colors",
                isTotalMatching 
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              )}>
                {isTotalMatching ? <Check className="h-3 w-3" /> : <span>!</span>}
                {totalQuestions}/{config.questionCount}
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {questionTypes.map((type) => {
              const Icon = type.icon
              const value = config.distribution[type.id as keyof typeof config.distribution]
              
              return (
                <div key={type.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn(
                      "w-7 h-7 rounded-md flex items-center justify-center bg-gradient-to-br shadow-sm",
                      type.gradient
                    )}>
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <Label className="text-sm font-medium flex-1">{type.label}</Label>
                    <Input 
                      type="number" 
                      min={0} 
                      max={config.questionCount}
                      value={value}
                      onChange={(e) => handleDistributionChange(type.id, parseInt(e.target.value) || 0)}
                      className="w-14 h-8 text-center font-mono text-sm rounded-md"
                    />
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={(val) => handleDistributionChange(type.id, val[0])}
                    max={config.questionCount}
                    step={1}
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
