import PublicLayout from '@/components/layout/PublicLayout';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RetroGrid } from '@/components/ui/retro-grid';
import { 
  BookOpen, 
  Users, 
  UploadCloud, 
  Sparkles, 
  PlayCircle, 
  CheckCircle2, 
  ArrowRight, 
  GraduationCap,
  Presentation
} from 'lucide-react';

export default function Home() {
  return (
    <PublicLayout>
      <main id="main-content" className="flex-1 overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden" aria-labelledby="hero-heading">
          <div className="absolute inset-0 z-0">
            <RetroGrid className="opacity-50 dark:opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/60 to-background" />
            {/* Decorative Blobs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft hidden md:block" />
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft hidden md:block" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-1000 shadow-sm backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">The Future of Assessment</span>
            </div>
            
            <h1 id="hero-heading" className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-primary to-gray-900 dark:from-white dark:via-primary dark:to-white animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 drop-shadow-sm">
              Transform Learning <br className="hidden sm:block" />
              <span className="text-primary">in Seconds</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Turn any document into an interactive quiz instantly. 
              Empower teachers, engage students, and master any subject with the power of AI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto px-8 py-7 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1 rounded-xl font-bold"
              >
                <Link href="/login" aria-label="Teacher login">
                  <Presentation className="mr-2 h-6 w-6" />
                  Create a Quiz
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 py-7 text-lg border-2 hover:bg-secondary/10 hover:text-secondary hover:border-secondary/50 transition-all hover:-translate-y-1 rounded-xl font-bold bg-background/50 backdrop-blur-sm"
              >
                <Link href="/join" aria-label="Student join">
                  <GraduationCap className="mr-2 h-6 w-6" />
                  Join a Session
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* User Pathways Section */}
        <section className="py-24 bg-muted/30 relative" aria-labelledby="pathways-heading">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 id="pathways-heading" className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
                Tailored for Every Role
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Whether you're orchestrating the class or mastering the material, we've built the perfect tools for you.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Teacher Path */}
              <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm hover:shadow-primary/10 transition-all duration-500 group ring-1 ring-gray-200 dark:ring-gray-800">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 transform group-hover:scale-110">
                  <BookOpen size={300} />
                </div>
                <CardHeader className="relative z-10 pb-2">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-500">
                    <Presentation className="w-7 h-7" />
                  </div>
                  <CardTitle className="text-3xl mb-2">For Teachers</CardTitle>
                  <CardDescription className="text-lg">
                    Streamline your assessment workflow and get detailed insights.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ul className="space-y-4 mb-8">
                    {[
                      'Upload PDF, PPT, or Word docs',
                      'AI auto-generates questions',
                      'Customizable timer & settings',
                      'Real-time performance analytics'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-muted-foreground font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full h-12 text-lg font-medium rounded-xl" variant="default">
                    <Link href="/login">
                      Teacher Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Student Path */}
              <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm hover:shadow-secondary/10 transition-all duration-500 group ring-1 ring-gray-200 dark:ring-gray-800">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 transform group-hover:scale-110">
                  <Users size={300} />
                </div>
                <CardHeader className="relative z-10 pb-2">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 text-secondary group-hover:scale-110 transition-transform duration-500">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <CardTitle className="text-3xl mb-2">For Students</CardTitle>
                  <CardDescription className="text-lg">
                    Engage with course material and track your progress.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ul className="space-y-4 mb-8">
                    {[
                      'Simple code-based entry',
                      'Interactive quiz interface',
                      'Instant feedback on answers',
                      'Track learning progress'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-muted-foreground font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full h-12 text-lg font-medium rounded-xl" variant="outline">
                    <Link href="/join">
                      Join Quiz <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 relative overflow-hidden" aria-labelledby="how-it-works-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <h2 id="how-it-works-heading" className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
                From File to Quiz in Seconds
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our AI handles the heavy lifting so you can focus on what matters most: teaching.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-muted via-primary/30 to-muted -z-10" />

              {[
                {
                  icon: UploadCloud,
                  title: '1. Upload Material',
                  desc: 'Drag and drop your course files. We support PDF, PPTX, and DOCX.',
                  color: 'text-blue-500',
                  bg: 'bg-blue-500/10'
                },
                {
                  icon: Sparkles,
                  title: '2. AI Generation',
                  desc: 'Our AI analyzes the content and creates relevant, challenging questions instantly.',
                  color: 'text-purple-500',
                  bg: 'bg-purple-500/10'
                },
                {
                  icon: PlayCircle,
                  title: '3. Start Session',
                  desc: 'Share the unique code with students and watch the results roll in live.',
                  color: 'text-green-500',
                  bg: 'bg-green-500/10'
                }
              ].map((step, i) => (
                <div key={i} className="relative flex flex-col items-center text-center group">
                  <div className={`w-24 h-24 rounded-3xl ${step.bg} border-4 border-background shadow-lg flex items-center justify-center mb-8 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <step.icon className={`w-10 h-10 ${step.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed px-4">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary z-0">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-indigo-600" />
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
              Ready to Transform Your Classroom?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto font-medium">
              Join thousands of educators who are saving time and improving student engagement with AI-powered assessments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="text-lg px-10 py-7 bg-white text-primary hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-2xl rounded-xl font-bold border-0"
              >
                <Link href="/login">Get Started for Free</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
