'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Icon } from '@/components/ui';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
            aria-label="AI Quiz Generator - Home"
          >
            <Icon name="graduation-cap" size="lg" className="text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              AI Quiz Generator
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Teacher login page"
            >
              Teacher Login
            </Link>
            <Link
              href="/join"
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Join quiz as student"
            >
              Join Quiz
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Close main menu" : "Open main menu"}
          >
            <span className="sr-only">{isMenuOpen ? "Close" : "Open"} main menu</span>
            <Icon name={isMenuOpen ? "close" : "menu"} size="lg" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3" role="menu">
            <Link
              href="/login"
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
              aria-label="Teacher login page"
            >
              Teacher Login
            </Link>
            <Link
              href="/join"
              className="bg-blue-600 text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
              aria-label="Join quiz as student"
            >
              Join Quiz
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
