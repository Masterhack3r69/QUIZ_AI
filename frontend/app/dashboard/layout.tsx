"use client"

import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar - Hidden on mobile, visible on lg and up */}
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile Navigation - Visible on mobile, hidden on lg and up */}
          <div className="lg:hidden">
            <MobileNav />
          </div>

          {/* Main Content */}
          <main
            id="main-content"
            className="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8"
          >
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
