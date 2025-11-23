"use client"

import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>My Quizzes</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                    <span className="sr-only">Notifications</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between px-4 py-2 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    <span className="text-xs text-muted-foreground">3 new</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
                      <div className="flex items-center gap-2 w-full">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="font-medium text-sm">New quiz submission</span>
                      </div>
                      <p className="text-xs text-muted-foreground">John Doe completed "Math Quiz 101"</p>
                      <span className="text-xs text-muted-foreground">2 minutes ago</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
                      <div className="flex items-center gap-2 w-full">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="font-medium text-sm">Quiz expired</span>
                      </div>
                      <p className="text-xs text-muted-foreground">"Science Quiz" has expired</p>
                      <span className="text-xs text-muted-foreground">1 hour ago</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
                      <div className="flex items-center gap-2 w-full">
                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                        <span className="font-medium text-sm">High performance</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Your quiz has 95% completion rate</p>
                      <span className="text-xs text-muted-foreground">3 hours ago</span>
                    </DropdownMenuItem>
                  </div>
                  <div className="border-t p-2">
                    <Button variant="ghost" className="w-full text-sm">
                      View all notifications
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
