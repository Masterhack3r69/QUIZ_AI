'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Icon, type IconName } from '@/components/ui';
import { ThemeToggle } from '@/components/theme-toggle';
import { MobileNav } from './mobile-nav';

export default function DashboardNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems: Array<{ href: string; label: string; icon: IconName }> = [
    { href: '/dashboard', label: 'Dashboard Home', icon: 'home' },
    { href: '/dashboard/create', label: 'Create Quiz', icon: 'plus' },
    { href: '/dashboard/templates', label: 'Templates', icon: 'document' },
    { href: '/dashboard/settings', label: 'Settings', icon: 'settings' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Navigation - Only visible on small screens */}
      <div className="md:hidden">
        <MobileNav />
      </div>

      {/* Desktop Navigation - Hidden on small screens */}
      <nav className="hidden md:block bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800" role="navigation" aria-label="Dashboard navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link 
                href="/dashboard" 
                className="flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
                aria-label="AI Quiz Generator - Dashboard Home"
              >
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  AI Quiz Generator
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="flex items-center space-x-1" role="menubar">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  role="menuitem"
                >
                  <Icon name={item.icon} className="mr-2" />
                  <span className="hidden lg:inline">{item.label}</span>
                  <span className="lg:hidden">{item.label.split(' ')[0]}</span>
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden lg:block text-sm text-gray-700 dark:text-gray-300" aria-label={`Logged in as ${user?.name}`}>
                <span className="font-medium">{user?.name}</span>
              </div>
              <ThemeToggle />
              <button
                onClick={logout}
                className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation min-h-[44px]"
                aria-label="Logout from dashboard"
              >
                <Icon name="logout" className="inline mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
