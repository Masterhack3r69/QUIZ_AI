"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Youtube, Globe, Brain, CheckCircle, BarChart } from "lucide-react"

const features = [
  {
    title: "Multiple Sources",
    description: "Upload PDFs, Word docs, or paste URLs from YouTube and the web.",
    icon: FileText,
  },
  {
    title: "Video Analysis",
    description: "AI watches videos and extracts key concepts from transcripts.",
    icon: Youtube,
  },
  {
    title: "Web Extraction",
    description: "Turn any article or educational webpage into a quiz instantly.",
    icon: Globe,
  },
  {
    title: "Multi-Agent AI",
    description: "Specialized agents for extraction, generation, and validation.",
    icon: Brain,
  },
  {
    title: "Quality Control",
    description: "Automated validation ensures questions are accurate and fair.",
    icon: CheckCircle,
  },
  {
    title: "Deep Analytics",
    description: "Track student performance and identify learning gaps.",
    icon: BarChart,
  },
]

export function Features() {
  return (
    <section id="features" className="container space-y-12 py-8 md:py-12 lg:py-24 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[100px]" />
      
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <h2 className="font-heading text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
          Powerful Features
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Everything you need to create engaging assessments from any content.
        </p>
      </div>
      <div className="mx-auto grid justify-center gap-6 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="group relative overflow-hidden border-muted/60 bg-background/50 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
