"use client"

import React, { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, LayoutGrid, Settings, HelpCircle, LogOut, Menu, X } from "lucide-react"

import { Sidebar } from "@/components/layout/Sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = React.useState(false)

    return (
        <div className="flex h-screen bg-bg-base overflow-hidden">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50
                w-[280px] shrink-0 border-r border-border bg-bg-base
                flex flex-col h-full
                transform transition-transform duration-200 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:z-auto
            `}>
                <Suspense fallback={<div>Loading sidebar...</div>}>
                    <Sidebar onClose={() => setSidebarOpen(false)} />
                </Suspense>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Mobile header with hamburger */}
                <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-bg-base">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden"
                    >
                        <Menu size={20} />
                    </Button>
                    <Link href="/" className="flex items-center gap-1 font-bold text-xl">
                        <span className="text-text-primary">EaseMyPrompt</span>
                        <span className="text-accent">.ai</span>
                    </Link>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>

                {children}
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
        </div>
    )
}
