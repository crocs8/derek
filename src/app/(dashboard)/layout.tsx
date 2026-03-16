import * as React from "react"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, LayoutGrid, Settings, HelpCircle, LogOut } from "lucide-react"

import { Sidebar } from "@/components/layout/Sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-bg-base overflow-hidden">
            <Suspense fallback={<div>Loading sidebar...</div>}>
                <Sidebar />
            </Suspense>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
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
