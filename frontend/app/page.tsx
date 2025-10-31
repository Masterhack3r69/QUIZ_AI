import PublicLayout from '@/components/layout/PublicLayout';
import Link from 'next/link';

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
                <Link
                  href="/login"
                  className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                  aria-label="Teacher login - Sign in to create and manage quizzes"
                >
                  <span role="img" aria-label="Teacher">👨‍🏫</span> Teacher Login
                </Link>
                <Link
                  href="/join"
                  className="w-full sm:w-auto bg-blue-500 text-white hover:bg-blue-400 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl border-2 border-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                  aria-label="Student join quiz - Enter quiz code to start"
                >
                  <span role="img" aria-label="Student">🎓</span> Student Join Quiz
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20" aria-labelledby="features-heading">
          <div className="text-center mb-12">
            <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create engaging quizzes in minutes with our AI-powered platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* For Teachers */}
            <article className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4 text-center" role="img" aria-label="Books">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                For Teachers
              </h3>
              <ul className="space-y-2 text-gray-600">
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
            </article>

            {/* For Students */}
            <article className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4 text-center" role="img" aria-label="Pencil">✏️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                For Students
              </h3>
              <ul className="space-y-2 text-gray-600">
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
            </article>

            {/* Key Benefits */}
            <article className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4 text-center" role="img" aria-label="Target">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                Key Benefits
              </h3>
              <ul className="space-y-2 text-gray-600">
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
            </article>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gray-100 py-16" aria-labelledby="cta-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="cta-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of teachers using AI to create better assessments
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/login"
                className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Get started as teacher - Sign up or login"
              >
                Get Started as Teacher
              </Link>
              <Link
                href="/join"
                className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-md hover:shadow-lg border-2 border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Join a quiz - Enter quiz code"
              >
                Join a Quiz
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
