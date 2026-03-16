"use client"

import * as React from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, LayoutGrid, Settings, HelpCircle, LogOut, X } from "lucide-react"

interface SidebarProps {
    onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentChatId = searchParams.get('id')

    const [chats, setChats] = React.useState<any[]>([])

    React.useEffect(() => {
        if (session?.user) {
            fetch("/api/chats")
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setChats(data)
                })
                .catch(err => console.error(err))
        }
    }, [session, currentChatId])

    const name = session?.user?.name || "User"
    const email = session?.user?.email || "No email"
    const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()

    // Group chats by date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayChats = chats.filter(c => new Date(c.updatedAt) >= today)
    const olderChats = chats.filter(c => new Date(c.updatedAt) < today)

    return (
        <aside className="w-[280px] shrink-0 border-r border-border bg-bg-base flex flex-col h-full sticky top-0">
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/" className="flex items-center gap-1 font-bold text-xl px-2">
                        <span className="text-text-primary">EaseMyPrompt</span>
                        <span className="text-accent">.ai</span>
                    </Link>
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="md:hidden"
                        >
                            <X size={20} />
                        </Button>
                    )}
                </div>
                <Button 
                    onClick={() => {
                        router.push('/dashboard')
                        onClose?.()
                    }}
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar">
                {todayChats.length > 0 && (
                    <div>
                        <h4 className="text-[0.7rem] uppercase tracking-wider text-text-secondary font-semibold mb-3 px-2">Today</h4>
                        <div className="space-y-1">
                            {todayChats.map(chat => (
                                <button 
                                    key={chat._id}
                                    onClick={() => {
                                        router.push(`/dashboard?id=${chat._id}`)
                                        onClose?.()
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm truncate transition-colors rounded-btn ${currentChatId === chat._id ? 'bg-bg-hover text-text-primary' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}`}
                                >
                                    {chat.title}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {olderChats.length > 0 && (
                    <div>
                        <h4 className="text-[0.7rem] uppercase tracking-wider text-text-secondary font-semibold mb-3 px-2">Previous 7 Days</h4>
                        <div className="space-y-1">
                            {olderChats.map(chat => (
                                <button 
                                    key={chat._id}
                                    onClick={() => {
                                        router.push(`/dashboard?id=${chat._id}`)
                                        onClose?.()
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm truncate transition-colors rounded-btn ${currentChatId === chat._id ? 'bg-bg-hover text-text-primary' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}`}
                                >
                                    {chat.title}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="pt-2 border-t border-border mt-4">
                    <Link href="/prompt-bank" onClick={() => onClose?.()}>
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-btn transition-colors">
                            <LayoutGrid size={16} />
                            Prompt Bank
                        </button>
                    </Link>
                </div>
            </div>

            <div className="p-4 border-t border-border mt-auto">
                <div className="flex items-center gap-3 px-2 mb-4">
                    <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{name}</p>
                        <p className="text-xs text-text-secondary truncate">{email}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between px-2 mb-4">
                    <div className="flex items-center gap-4 text-text-secondary">
                        <button aria-label="Settings" className="hover:text-text-primary transition-colors"><Settings size={16} /></button>
                        <button aria-label="Help" className="hover:text-text-primary transition-colors"><HelpCircle size={16} /></button>
                        <button aria-label="Logout" onClick={() => signOut({ callbackUrl: '/' })} className="hover:text-text-primary transition-colors"><LogOut size={16} /></button>
                    </div>
                    <Badge variant="secondary" className="bg-bg-hover">Free Plan</Badge>
                </div>
            </div>
        </aside>
    )
}
