import PublicLayout from '@/components/layout/PublicLayout';
import Link from 'next/link';
import { Icon } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <PublicLayout>
      <main id="main-content">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white" aria-labelledby="hero-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
            <div className="text-center">
              <h1 id="hero-heading" className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                AI-Powered Quiz Generator
              </h1>
              <p className="text-xl sm:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                Upload learning materials and let AI create quiz questions automatically. 
                Save time, promote academic integrity, and get instant results.
              </p>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg shadow-lg hover:shadow-xl"
                >
                  <Link
                    href="/login"
                    aria-label="Teacher login - Sign in to create and manage quizzes"
                  >
                    <Icon name="teacher" size="lg" />
                    Teacher Login
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-blue-500 text-white hover:bg-blue-400 hover:text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl border-2 border-white"
                >
                  <Link
                    href="/join"
                    aria-label="Student join quiz - Enter quiz code to start"
                  >
                    <Icon name="graduation-cap" size="lg" />
                    Student Join Quiz
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20" aria-labelledby="features-heading">
          <div className="text-center mb-12">
            <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create engaging quizzes in minutes with our AI-powered platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* For Teachers */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Icon name="books" className="w-16 h-16 text-primary" />
                </div>
                <CardTitle className="text-xl">For Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                    Upload PDF, Word, or PowerPoint files
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                    AI generates relevant questions
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                    Configure quiz settings and timers
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                    View detailed analytics
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* For Students */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Icon name="pencil" className="w-16 h-16 text-primary" />
                </div>
                <CardTitle className="text-xl">For Students</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                    Enter quiz code to access
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                    Randomized questions for fairness
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                    Countdown timer with auto-submit
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                    Immediate score feedback
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Key Benefits */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Icon name="target" className="w-16 h-16 text-primary" />
                </div>
                <CardTitle className="text-xl">Key Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                    Save preparation time
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                    Promote academic integrity
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                    Automated grading
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                    Export results to PDF/Excel
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-muted py-16" aria-labelledby="cta-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="cta-heading" className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of teachers using AI to create better assessments
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto px-8 py-6 text-lg"
              >
                <Link
                  href="/login"
                  aria-label="Get started as teacher - Sign up or login"
                >
                  Get Started as Teacher
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 py-6 text-lg"
              >
                <Link
                  href="/join"
                  aria-label="Join a quiz - Enter quiz code"
                >
                  Join a Quiz
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
