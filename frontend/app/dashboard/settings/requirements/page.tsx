"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/contexts/ToastContext"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface StudentInfoRequirements {
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

export default function RequirementsPage() {
  const { showSuccess, showError } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [requirements, setRequirements] = useState<StudentInfoRequirements>({
    firstName: true,
    middleName: false,
    lastName: true,
    suffix: false,
    studentId: true,
    course: false,
    year: false,
    section: false,
    email: false,
  })

  const handleToggle = (field: keyof StudentInfoRequirements) => {
    setRequirements(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      
      // Store in localStorage for now (can be moved to backend later)
      localStorage.setItem('defaultStudentInfoRequirements', JSON.stringify(requirements))
      
      showSuccess("Requirements saved successfully")
    } catch (error) {
      showError("Failed to save requirements. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Load saved requirements
    const saved = localStorage.getItem('defaultStudentInfoRequirements')
    if (saved) {
      try {
        setRequirements(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved requirements:', e)
      }
    }
  }, [])

  const requirementFields = [
    { key: 'firstName' as const, label: 'First Name', description: 'Student\'s first name' },
    { key: 'middleName' as const, label: 'Middle Name', description: 'Student\'s middle name' },
    { key: 'lastName' as const, label: 'Last Name', description: 'Student\'s last name' },
    { key: 'suffix' as const, label: 'Suffix', description: 'Name suffix (Jr., Sr., III, etc.)' },
    { key: 'studentId' as const, label: 'Student ID', description: 'Student identification number' },
    { key: 'course' as const, label: 'Course', description: 'Student\'s course or program' },
    { key: 'year' as const, label: 'Year Level', description: 'Student\'s year level' },
    { key: 'section' as const, label: 'Section', description: 'Student\'s section or class' },
    { key: 'email' as const, label: 'Email Address', description: 'Student\'s email address' },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Information Requirements</h1>
        <p className="mt-2 text-muted-foreground">
          Configure what information students need to provide when joining a quiz
        </p>
      </div>

      {/* Requirements Section */}
      <Card>
        <CardHeader>
          <CardTitle>Default Requirements</CardTitle>
          <CardDescription>
            These settings will be applied to all new quizzes. You can customize requirements for individual quizzes later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {requirementFields.map((field, index) => (
            <div key={field.key}>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <p className="text-sm text-muted-foreground">
                    {field.description}
                  </p>
                </div>
                <Switch
                  id={field.key}
                  checked={requirements[field.key]}
                  onCheckedChange={() => handleToggle(field.key)}
                />
              </div>
              {index < requirementFields.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}

          <div className="pt-4">
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading && (
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {isLoading ? "Saving..." : "Save Requirements"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-lg">How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Students will first enter the quiz code
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              After validation, they'll be asked to provide the information you've enabled
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Only enabled fields will be shown to students
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              All enabled fields are required for students to proceed
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
