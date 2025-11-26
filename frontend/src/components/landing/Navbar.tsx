"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BrainCircuit } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export function Navbar() {
  return (
    <header className="sticky top-4 z-50 w-full px-4 md:px-8">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between rounded-2xl border border-border/40 bg-background/80 px-4 backdrop-blur-md shadow-sm supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <span className="hidden font-bold sm:inline-block text-lg tracking-tight">
              Quiz AI
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="#features"
              className="transition-colors hover:text-primary text-muted-foreground"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="transition-colors hover:text-primary text-muted-foreground"
            >
              How it Works
            </Link>
            <Link
              href="/join"
              className="transition-colors hover:text-primary text-muted-foreground"
            >
              Join Quiz
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="rounded-full px-6 shadow-lg shadow-primary/20">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
