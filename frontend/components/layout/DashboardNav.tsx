'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard Home', icon: '🏠', iconLabel: 'Home' },
    { href: '/dashboard/create', label: 'Create Quiz', icon: '➕', iconLabel: 'Plus' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️', iconLabel: 'Settings' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white border-b border-gray-200" role="navigation" aria-label="Dashboard navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link 
              href="/dashboard" 
              className="flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
              aria-label="AI Quiz Generator - Dashboard Home"
            >
              <span className="text-2xl font-bold text-blue-600">
                AI Quiz Generator
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1" role="menubar">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-current={isActive(item.href) ? 'page' : undefined}
                role="menuitem"
              >
                <span className="mr-2" role="img" aria-label={item.iconLabel}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-sm text-gray-700" aria-label={`Logged in as ${user?.name}`}>
              <span className="font-medium">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Logout from dashboard"
            >
              <span role="img" aria-label="Door">🚪</span> Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3 space-y-1" role="menu">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-current={isActive(item.href) ? 'page' : undefined}
              role="menuitem"
            >
              <span className="mr-2" role="img" aria-label={item.iconLabel}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
