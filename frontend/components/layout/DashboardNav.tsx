'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Icon, type IconName } from '@/components/ui';

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
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">
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
                className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
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
            <div className="hidden lg:block text-sm text-gray-700" aria-label={`Logged in as ${user?.name}`}>
              <span className="font-medium">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
              aria-label="Logout from dashboard"
            >
              <Icon name="logout" className="inline mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3 space-y-1" role="menu">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation ${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-current={isActive(item.href) ? 'page' : undefined}
              role="menuitem"
            >
              <Icon name={item.icon} className="mr-2" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
