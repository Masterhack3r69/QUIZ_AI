"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { ArrowLeft, Gamepad2 } from "lucide-react"

export default function JoinPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute h-full w-full bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
        
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-md"
        >
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Link>
            
            <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl transition-all hover:border-primary/20 hover:shadow-primary/10">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-1 ring-primary/20">
                        <Gamepad2 className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">Join Quiz</CardTitle>
                    <CardDescription className="text-base">
                        Enter the game code to join a live session
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="code" className="sr-only">Game Code</Label>
                        <Input 
                            id="code" 
                            placeholder="ENTER CODE" 
                            className="text-center text-2xl tracking-[0.5em] font-mono h-16 uppercase placeholder:tracking-normal placeholder:text-base placeholder:font-sans bg-background/50 border-primary/20 focus-visible:ring-primary" 
                            maxLength={8}
                            required 
                        />
                    </div>
                    <Button className="w-full text-lg h-12 font-bold shadow-lg shadow-primary/20" size="lg">
                        Join Game
                    </Button>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <p className="text-center text-sm text-muted-foreground">
                        Ask your host for the game code.
                    </p>
                </CardFooter>
            </Card>
        </motion.div>
    </div>
  )
}
