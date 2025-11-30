"use client"

import { useQuizStore, Difficulty } from "@/store/quiz-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

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

  // Calculate total from distribution if we want to enforce it, 
  // or just use the slider for total and auto-distribute.
  // For simplicity, let's use the slider for total and simple checkboxes for types for now, 
  // OR advanced mode with specific counts. Let's stick to the plan: specific counts.

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Quiz Configuration</h2>
        <p className="text-muted-foreground">Customize the difficulty and structure of your quiz.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column: General Settings */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <RadioGroup 
                  value={config.difficulty} 
                  onValueChange={(val) => setConfig({ difficulty: val as Difficulty })}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="easy" id="easy" />
                    <Label htmlFor="easy" className="cursor-pointer">Easy</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="cursor-pointer">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="hard" id="hard" />
                    <Label htmlFor="hard" className="cursor-pointer">Hard</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="mixed" id="mixed" />
                    <Label htmlFor="mixed" className="cursor-pointer">Mixed</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Total Questions</Label>
                  <span className="font-bold text-primary">{config.questionCount}</span>
                </div>
                <Slider 
                  value={[config.questionCount]} 
                  min={1} 
                  max={50} 
                  step={1} 
                  onValueChange={(vals) => setConfig({ questionCount: vals[0] })}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 10-20 questions for a standard quiz.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Question Types */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <Label className="text-base">Question Distribution</Label>
              <p className="text-sm text-muted-foreground -mt-4">
                Specify how many questions of each type you want.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="mcq" className="col-span-2">Multiple Choice</Label>
                  <Input 
                    id="mcq" 
                    type="number" 
                    min={0} 
                    value={config.distribution['multiple-choice']}
                    onChange={(e) => handleDistributionChange('multiple-choice', parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="tf" className="col-span-2">True / False</Label>
                  <Input 
                    id="tf" 
                    type="number" 
                    min={0} 
                    value={config.distribution['true-false']}
                    onChange={(e) => handleDistributionChange('true-false', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="fitb" className="col-span-2">Fill in the Blank</Label>
                  <Input 
                    id="fitb" 
                    type="number" 
                    min={0} 
                    value={config.distribution['fill-in-the-blank']}
                    onChange={(e) => handleDistributionChange('fill-in-the-blank', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="sa" className="col-span-2">Short Answer</Label>
                  <Input 
                    id="sa" 
                    type="number" 
                    min={0} 
                    value={config.distribution['short-answer']}
                    onChange={(e) => handleDistributionChange('short-answer', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-between items-center">
                <span className="text-sm font-medium">Current Total:</span>
                <span className={`text-lg font-bold ${
                  Object.values(config.distribution).reduce((a, b) => a + b, 0) === config.questionCount 
                    ? "text-green-600" 
                    : "text-orange-500"
                }`}>
                  {Object.values(config.distribution).reduce((a, b) => a + b, 0)} / {config.questionCount}
                </span>
              </div>
              {Object.values(config.distribution).reduce((a, b) => a + b, 0) !== config.questionCount && (
                <p className="text-xs text-orange-500">
                  Note: The sum of distribution counts should match the total questions.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
