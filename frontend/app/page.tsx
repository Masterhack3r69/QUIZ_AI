import PublicLayout from '@/components/layout/PublicLayout';
import Link from 'next/link';

export default function Home() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
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
                className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                👨‍🏫 Teacher Login
              </Link>
              <Link
                href="/join"
                className="w-full sm:w-auto bg-blue-500 text-white hover:bg-blue-400 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl border-2 border-white"
              >
                🎓 Student Join Quiz
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create engaging quizzes in minutes with our AI-powered platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* For Teachers */}
          <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4 text-center">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
              For Teachers
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Upload PDF, Word, or PowerPoint files
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                AI generates relevant questions
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Configure quiz settings and timers
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                View detailed analytics
              </li>
            </ul>
          </div>

          {/* For Students */}
          <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4 text-center">✏️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
              For Students
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Enter quiz code to access
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Randomized questions for fairness
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Countdown timer with auto-submit
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Immediate score feedback
              </li>
            </ul>
          </div>

          {/* Key Benefits */}
          <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4 text-center">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
              Key Benefits
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Save preparation time
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Promote academic integrity
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Automated grading
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Export results to PDF/Excel
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of teachers using AI to create better assessments
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              Get Started as Teacher
            </Link>
            <Link
              href="/join"
              className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-md hover:shadow-lg border-2 border-blue-600"
            >
              Join a Quiz
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
