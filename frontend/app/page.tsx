import PublicLayout from '@/components/layout/PublicLayout';
import Link from 'next/link';
import { Icon } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RetroGrid } from '@/components/ui/retro-grid';

export default function Home() {
  return (
    <PublicLayout>
      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48" aria-labelledby="hero-heading">
          <div className="absolute inset-0 z-0">
            <RetroGrid className="opacity-50 dark:opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background" />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Icon name="sparkles" size="sm" />
              <span className="text-sm font-medium">AI-Powered Assessment Platform</span>
            </div>
            
            <h1 id="hero-heading" className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-secondary animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
              Transform Learning <br className="hidden sm:block" />
              <span className="text-foreground">with Intelligent Quizzes</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Instantly generate quizzes from your course materials. 
              Empower teachers, engage students, and master any subject with the power of AI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto px-8 py-7 text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1"
              >
                <Link href="/login" aria-label="Teacher login">
                  <Icon name="teacher" className="mr-2 h-6 w-6" />
                  Create a Quiz
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 py-7 text-lg border-2 hover:bg-secondary/10 hover:text-secondary hover:border-secondary/50 transition-all hover:-translate-y-1"
              >
                <Link href="/join" aria-label="Student join">
                  <Icon name="graduation-cap" className="mr-2 h-6 w-6" />
                  Join a Session
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* User Pathways Section */}
        <section className="py-24 bg-muted/30" aria-labelledby="pathways-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="pathways-heading" className="text-3xl sm:text-4xl font-bold mb-4">
                Tailored for Every Role
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Whether you're teaching the class or mastering the material, we have the tools you need.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Teacher Path */}
              <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Icon name="books" size="xl" className="w-64 h-64 text-primary" />
                </div>
                <CardHeader className="relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary">
                    <Icon name="teacher" size="lg" />
                  </div>
                  <CardTitle className="text-2xl mb-2">For Teachers</CardTitle>
                  <CardDescription className="text-base">
                    Streamline your assessment workflow and get detailed insights.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ul className="space-y-4">
                    {[
                      'Upload PDF, PPT, or Word docs',
                      'AI auto-generates questions',
                      'Customizable timer & settings',
                      'Real-time performance analytics'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                          <Icon name="check" className="w-3.5 h-3.5 text-green-600" />
                        </div>
                        <span className="text-muted-foreground font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Button asChild className="w-full" variant="secondary">
                      <Link href="/login">Teacher Dashboard</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Student Path */}
              <Card className="relative overflow-hidden border-2 hover:border-secondary/50 transition-colors group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Icon name="pencil" size="xl" className="w-64 h-64 text-secondary" />
                </div>
                <CardHeader className="relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-6 text-secondary">
                    <Icon name="graduation-cap" size="lg" />
                  </div>
                  <CardTitle className="text-2xl mb-2">For Students</CardTitle>
                  <CardDescription className="text-base">
                    Engage with course material and track your progress.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ul className="space-y-4">
                    {[
                      'Simple code-based entry',
                      'Interactive quiz interface',
                      'Instant feedback on answers',
                      'Track learning progress'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                          <Icon name="check" className="w-3.5 h-3.5 text-green-600" />
                        </div>
                        <span className="text-muted-foreground font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Button asChild className="w-full" variant="outline">
                      <Link href="/join">Join Quiz</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24" aria-labelledby="how-it-works-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="how-it-works-heading" className="text-3xl sm:text-4xl font-bold mb-4">
                From File to Quiz in Seconds
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our AI handles the heavy lifting so you can focus on teaching.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-muted via-primary/20 to-muted -z-10" />

              {[
                {
                  icon: 'upload-cloud',
                  title: '1. Upload Material',
                  desc: 'Drag and drop your course files. We support PDF, PPTX, and DOCX.'
                },
                {
                  icon: 'sparkles',
                  title: '2. AI Generation',
                  desc: 'Our AI analyzes the content and creates relevant questions instantly.'
                },
                {
                  icon: 'play-circle',
                  title: '3. Start Session',
                  desc: 'Share the code with students and watch the results roll in live.'
                }
              ].map((step, i) => (
                <div key={i} className="relative flex flex-col items-center text-center group">
                  <div className="w-24 h-24 rounded-2xl bg-background border-2 border-muted group-hover:border-primary/50 shadow-sm flex items-center justify-center mb-6 transition-all group-hover:-translate-y-1">
                    <Icon name={step.icon} size="xl" className="text-primary/80 group-hover:text-primary transition-colors" />
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
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Classroom?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              Join thousands of educators who are saving time and improving student engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all"
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
