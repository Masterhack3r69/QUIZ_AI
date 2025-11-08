import { z } from "zod"

// Login Form Schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Registration Form Schema
export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

// Quiz Join Form Schema
export const joinQuizSchema = z.object({
  quizCode: z
    .string()
    .length(6, "Quiz code must be 6 characters")
    .regex(/^[A-Z0-9]+$/, "Quiz code must contain only uppercase letters and numbers")
    .transform((val) => val.toUpperCase()),
  studentName: z.string().min(2, "Name must be at least 2 characters"),
  studentId: z.string().optional(),
  school: z.string().min(2, "School name is required"),
})

export type JoinQuizFormData = z.infer<typeof joinQuizSchema>

// Quiz Configuration Form Schema
export const quizConfigSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  duration: z
    .number()
    .min(5, "Duration must be at least 5 minutes")
    .max(180, "Duration cannot exceed 180 minutes"),
  expiresAt: z.date().min(new Date(), "Expiration date must be in the future"),
  questionCount: z
    .number()
    .min(5, "Must have at least 5 questions")
    .max(50, "Cannot exceed 50 questions"),
  showCorrectAnswers: z.boolean().default(false),
})

export type QuizConfigFormData = z.infer<typeof quizConfigSchema>
