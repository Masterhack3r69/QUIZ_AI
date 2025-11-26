"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, User, Mail, Lock, KeyRound, Loader2, Check, X } from "lucide-react"
import { authService } from "@/services/auth.service"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [step, setStep] = useState<'register' | 'otp'>('register')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  
  const [otp, setOtp] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)

  useEffect(() => {
    const strength = calculatePasswordStrength(formData.password)
    setPasswordStrength(strength)
  }, [formData.password])

  const calculatePasswordStrength = (password: string) => {
    let score = 0
    if (!password) return 0
    if (password.length > 8) score += 1
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    return score
  }

  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-border"
    if (score <= 1) return "bg-red-500"
    if (score <= 2) return "bg-yellow-500"
    if (score <= 3) return "bg-blue-500"
    return "bg-green-500"
  }

  const getStrengthText = (score: number) => {
    if (score === 0) return ""
    if (score <= 1) return "Weak"
    if (score <= 2) return "Fair"
    if (score <= 3) return "Good"
    return "Strong"
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (passwordStrength < 2) {
      setError("Password is too weak")
      setIsLoading(false)
      return
    }

    try {
      // Exclude confirmPassword from API call
      const { confirmPassword, ...registerData } = formData
      await authService.register(registerData)
      setStep('otp')
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await authService.verifyOTP({
        email: formData.email,
        code: otp
      })
      
      login(response.token, response.user)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await authService.resendOTP(formData.email)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute h-full w-full bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
        
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-md"
        >
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Link>
            
            <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-xl transition-all hover:border-primary/20 hover:shadow-2xl overflow-hidden">
                <AnimatePresence mode="wait">
                    {step === 'register' ? (
                        <motion.div
                            key="register"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <form onSubmit={handleRegister}>
                                <CardHeader className="space-y-1 text-center">
                                    <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
                                    <CardDescription>
                                        Enter your information to get started
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {error && (
                                        <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20 flex items-center gap-2">
                                            <X className="h-4 w-4" />
                                            {error}
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="name" 
                                                placeholder="John Doe" 
                                                className="pl-9 bg-background/50" 
                                                required 
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="email" 
                                                type="email" 
                                                placeholder="name@example.com" 
                                                className="pl-9 bg-background/50" 
                                                required 
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="password" 
                                                type="password" 
                                                className="pl-9 bg-background/50" 
                                                required 
                                                value={formData.password}
                                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            />
                                        </div>
                                        {formData.password && (
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className={cn(
                                                        "font-medium transition-colors",
                                                        passwordStrength <= 1 ? "text-red-500" :
                                                        passwordStrength <= 2 ? "text-yellow-500" :
                                                        passwordStrength <= 3 ? "text-blue-500" : "text-green-500"
                                                    )}>
                                                        {getStrengthText(passwordStrength)}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1 h-1">
                                                    {[1, 2, 3, 4].map((level) => (
                                                        <div 
                                                            key={level}
                                                            className={cn(
                                                                "h-full flex-1 rounded-full transition-all duration-300",
                                                                level <= passwordStrength ? getStrengthColor(passwordStrength) : "bg-muted"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="confirmPassword" 
                                                type="password" 
                                                className="pl-9 bg-background/50" 
                                                required 
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <Button className="w-full font-semibold shadow-lg shadow-primary/20" size="lg" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Create Account
                                    </Button>
                                </CardContent>
                                <CardFooter className="flex flex-col space-y-4">
                                    <div className="text-center text-sm text-muted-foreground">
                                        Already have an account?{" "}
                                        <Link href="/login" className="text-primary hover:underline font-medium">
                                            Sign in
                                        </Link>
                                    </div>
                                </CardFooter>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="otp"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <form onSubmit={handleVerifyOTP}>
                                <CardHeader className="space-y-1 text-center">
                                    <CardTitle className="text-2xl font-bold tracking-tight">Verify Email</CardTitle>
                                    <CardDescription>
                                        We sent a verification code to {formData.email}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {error && (
                                        <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20 flex items-center gap-2">
                                            <X className="h-4 w-4" />
                                            {error}
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label htmlFor="otp">Verification Code</Label>
                                        <div className="relative">
                                            <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="otp" 
                                                placeholder="123456" 
                                                className="pl-9 bg-background/50 tracking-widest text-center text-lg" 
                                                required 
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                maxLength={6}
                                            />
                                        </div>
                                    </div>
                                    <Button className="w-full font-semibold shadow-lg shadow-primary/20" size="lg" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Verify Email
                                    </Button>
                                    <div className="text-center">
                                        <button 
                                            type="button"
                                            onClick={handleResendOTP}
                                            className="text-sm text-primary hover:underline font-medium"
                                            disabled={isLoading}
                                        >
                                            Resend Verification Code
                                        </button>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col space-y-4">
                                    <div className="text-center text-sm text-muted-foreground">
                                        <button 
                                            type="button"
                                            onClick={() => setStep('register')}
                                            className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-center w-full"
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back to Registration
                                        </button>
                                    </div>
                                </CardFooter>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </motion.div>
    </div>
  )
}
