import { BrainCircuit } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold">Quiz AI</span>
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              Transforming education with intelligent, agentic AI assessment tools. Create quizzes in seconds.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">Product</h3>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Pricing</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Integration</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Changelog</a>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">Company</h3>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">About</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Blog</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Careers</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">Legal</h3>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Cookie Policy</a>
          </div>
        </div>
        
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2024 Quiz AI. All rights reserved.
          </p>
          <div className="flex gap-4">
            {/* Social icons would go here */}
          </div>
        </div>
      </div>
    </footer>
  )
}
