"use client"

import { motion } from "framer-motion"
import { FileInput, Brain, CheckCheck, Sparkles } from "lucide-react"

const steps = [
  {
    title: "Upload",
    description: "Provide your source material (File, URL, Text).",
    icon: FileInput,
  },
  {
    title: "Extraction Agent",
    description: "AI analyzes and extracts key concepts.",
    icon: Brain,
  },
  {
    title: "Generation Agent",
    description: "Creates questions with educational distractors.",
    icon: Sparkles,
  },
  {
    title: "Validation Agent",
    description: "Reviews and refines for quality assurance.",
    icon: CheckCheck,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="container py-8 md:py-12 lg:py-24">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
        <h2 className="font-heading text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
          How It Works
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Our multi-agent pipeline ensures high-quality results every time.
        </p>
      </div>
      <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-4 relative">
        {/* Connecting Line (Desktop) */}
        <div className="absolute top-8 left-0 hidden w-full h-0.5 bg-gradient-to-r from-transparent via-border to-transparent md:block -z-10" />
        
        {steps.map((step, index) => (
          <div key={index} className="relative flex flex-col items-center text-center group">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border bg-background shadow-sm transition-all group-hover:border-primary group-hover:shadow-md"
            >
              <step.icon className="h-8 w-8 text-primary" />
            </motion.div>
            <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
