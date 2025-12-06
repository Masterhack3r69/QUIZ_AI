"use client"



import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-6 md:pt-10 lg:pt-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 grid items-center gap-12 pb-8 md:py-20 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-start gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent font-semibold">
                Powered by Multi-Agent AI
              </span>
            </span>
          </motion.div>
          <motion.h1
            className="text-4xl font-extrabold leading-tight tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Transform Content into <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Quizzes in Seconds
            </span>
          </motion.h1>
          <motion.p
            className="max-w-[600px] text-lg text-muted-foreground sm:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Upload files, paste URLs, or use YouTube videos. Our intelligent agents extract concepts, generate questions, and validate quality automatically.
          </motion.p>
          <motion.div
            className="flex flex-col gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <a href="/register">
              <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30">
                Start Creating <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href="/join">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base backdrop-blur-sm bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/50">
                Join a Quiz
              </Button>
            </a>
          </motion.div>
        </div>
        
        {/* Hero Image / Visual */}
        <motion.div
          className="relative mx-auto aspect-square w-full max-w-[500px] lg:mx-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 blur-3xl" />
          <div className="relative h-full w-full rounded-2xl border bg-background/50 p-4 shadow-2xl backdrop-blur-xl">
             {/* Abstract UI Representation */}
             <div className="flex h-full flex-col gap-4 rounded-lg bg-background/50 p-4">
                <div className="flex items-center gap-2 border-b pb-4">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-4 w-1/2 rounded bg-muted" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="h-24 rounded-lg bg-primary/10 p-4">
                     <div className="mb-2 h-8 w-8 rounded bg-primary/20" />
                     <div className="h-3 w-2/3 rounded bg-primary/20" />
                  </div>
                  <div className="h-24 rounded-lg bg-purple-500/10 p-4">
                     <div className="mb-2 h-8 w-8 rounded bg-purple-500/20" />
                     <div className="h-3 w-2/3 rounded bg-purple-500/20" />
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between rounded-lg border bg-background p-3 shadow-sm">
                   <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="text-sm font-medium">Quiz Generated!</div>
                   </div>
                   <Button size="sm" variant="ghost">View</Button>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
