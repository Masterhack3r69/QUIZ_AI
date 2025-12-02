"use client"

import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { 
  Zap, 
  Search, 
  Bell, 
} from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export function Navbar() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-white/70 dark:bg-black/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">QuizAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full px-4">
                Overview
              </Button>
            </Link>
            <Link href="/quizzes">
              <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full px-4">
                Library
              </Button>
            </Link>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full px-4">
              Reports
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full px-4">
              Community
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="h-5 w-5 text-muted-foreground" />
          </Button>
          <ModeToggle />
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            {/* <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-black" /> */}
          </Button>
          
          {/* User Profile Dropdown Trigger */}
          <div className="flex items-center gap-2 pl-2 border-l ml-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={logout} title="Click to logout">
             <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 ring-2 ring-white dark:ring-black flex items-center justify-center text-white font-bold text-xs shadow-sm">
               {user.name.charAt(0).toUpperCase()}
             </div>
             <div className="hidden md:block">
               <p className="text-sm font-medium leading-none">{user.name}</p>
               <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
             </div>
          </div>
        </div>
      </div>
    </header>
  )
}
