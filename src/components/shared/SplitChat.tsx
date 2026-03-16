"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { Dropdown } from "@/components/ui/dropdown"
import { FreeTierModal } from "@/components/shared/FreeTierModal"
import { useSession } from "next-auth/react"

const GUEST_LIMIT = 2
const DEREK_KEY = "emp_guest_derek_uses"
const CLAUDE_KEY = "emp_guest_claude_uses"

// Animated thinking indicator that cycles through contextual words
function ThinkingIndicator({ words }: { words: string[] }) {
    const [idx, setIdx] = React.useState(0)
    const [visible, setVisible] = React.useState(true)

    React.useEffect(() => {
        const fade = setInterval(() => {
            setVisible(false)
            setTimeout(() => {
                setIdx(i => (i + 1) % words.length)
                setVisible(true)
            }, 300)
        }, 1400)
        return () => clearInterval(fade)
    }, [words.length])

    return (
        <div className="flex items-center gap-2 text-sm text-text-secondary italic">
            <span
                style={{
                    opacity: visible ? 1 : 0,
                    transition: "opacity 0.3s ease",
                    fontFamily: "monospace",
                }}
            >
                {words[idx]}
            </span>
            <span className="flex gap-1">
                {[0, 1, 2].map(i => (
                    <span
                        key={i}
                        style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            backgroundColor: "currentColor",
                            display: "inline-block",
                            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }}
                    />
                ))}
            </span>
            <style>{`
                @keyframes bounce {
                    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
                    40% { transform: translateY(-5px); opacity: 1; }
                }
            `}</style>
        </div>
    )
}

interface Message {
    role: "user" | "ai"
    content: string
}

interface SplitChatProps {
    /** When true, enforces guest usage limits (landing page). Logged-in dashboard should not pass this. */
    guestMode?: boolean
}

export function SplitChat({ guestMode = false }: SplitChatProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const chatId = searchParams.get('id')
    const { data: session, status } = useSession()

    const [derekMessages, setDerekMessages] = React.useState<Message[]>([])
    const [claudeMessages, setClaudeMessages] = React.useState<Message[]>([])

    const [derekInput, setDerekInput] = React.useState("")
    const [claudeInput, setClaudeInput] = React.useState("")

    const [selectedModel, setSelectedModel] = React.useState("claude-sonnet-4-6")

    const [isDerekStreaming, setIsDerekStreaming] = React.useState(false)
    const [isClaudeStreaming, setIsClaudeStreaming] = React.useState(false)

    // Guest usage counters (only active on landing page for unauthenticated users)
    const [derekUses, setDerekUses] = React.useState(0)
    const [claudeUses, setClaudeUses] = React.useState(0)
    const [showLimitModal, setShowLimitModal] = React.useState(false)

    // Hydrate counters from localStorage on mount
    React.useEffect(() => {
        if (guestMode) {
            setDerekUses(parseInt(localStorage.getItem(DEREK_KEY) ?? "0", 10))
            setClaudeUses(parseInt(localStorage.getItem(CLAUDE_KEY) ?? "0", 10))
        }
    }, [guestMode])

    // Returns true if the user is allowed to send (logged in OR within guest limit)
    const canSendDerek = !guestMode || status === "authenticated" || derekUses < GUEST_LIMIT
    const canSendClaude = !guestMode || status === "authenticated" || claudeUses < GUEST_LIMIT

    const bumpDerekUse = () => {
        const next = derekUses + 1
        setDerekUses(next)
        localStorage.setItem(DEREK_KEY, String(next))
    }
    const bumpClaudeUse = () => {
        const next = claudeUses + 1
        setClaudeUses(next)
        localStorage.setItem(CLAUDE_KEY, String(next))
    }

    React.useEffect(() => {
        if (chatId) {
            fetch(`/api/chats/${chatId}`)
                .then(res => res.json())
                .then(data => {
                    if (data && !data.error) {
                        setDerekMessages(data.derekMessages || [])
                        setClaudeMessages(data.claudeMessages || [])
                    }
                })
                .catch(err => console.error(err))
        } else {
            setDerekMessages([])
            setClaudeMessages([])
        }

        const pd = searchParams.get('prefillDerek')
        const pc = searchParams.get('prefillClaude')
        
        let shouldClean = false
        const currentUrl = new URL(window.location.href)

        if (pd) {
            setDerekInput(pd)
            currentUrl.searchParams.delete('prefillDerek')
            shouldClean = true
        }
        if (pc) {
            setClaudeInput(pc)
            currentUrl.searchParams.delete('prefillClaude')
            shouldClean = true
        }
        
        if (shouldClean) {
            router.replace(currentUrl.pathname + currentUrl.search, { scroll: false })
        }
    }, [chatId, searchParams, router])

    const saveChat = async (dM: Message[], cM: Message[]) => {
        const clean = (msgs: Message[]) =>
            msgs.filter((m) => m.content.trim().length > 0);

        try {
            const res = await fetch("/api/chats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: chatId,
                    derekMessages: clean(dM),
                    claudeMessages: clean(cM),
                })
            })
            const data = await res.json()
            if (data._id && !chatId) {
                router.replace(`/dashboard?id=${data._id}`)
            }
        } catch (e) {
            console.error("Failed to save chat", e)
        }
    }



    const sendToClaude = async (message: string, history: Message[]) => {
        const newClaudeContext = [...history, { role: "user" as const, content: message }]
        setClaudeMessages(newClaudeContext)
        setIsClaudeStreaming(true)

        let streamingMsgs = [...newClaudeContext, { role: "ai" as const, content: "" }]

        try {
            setClaudeMessages(streamingMsgs)

            const res = await fetch("/api/chat/claude", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: message,
                    model: selectedModel,
                    history: history,
                })
            })

            if (!res.ok) throw new Error("Failed to fetch")
            const reader = res.body?.getReader()
            const decoder = new TextDecoder()

            let done = false;
            while (!done && reader) {
                const { value, done: doneReading } = await reader.read()
                done = doneReading
                const chunkValue = decoder.decode(value)
                streamingMsgs = [...streamingMsgs]
                streamingMsgs[streamingMsgs.length - 1].content += chunkValue
                setClaudeMessages(streamingMsgs)
            }
            
            await saveChat(derekMessages, streamingMsgs)
        } catch (e) {
            console.error(e)
            if (streamingMsgs.length > 0 && streamingMsgs[streamingMsgs.length - 1].role === "ai" && streamingMsgs[streamingMsgs.length - 1].content === "") {
                setClaudeMessages(streamingMsgs.slice(0, -1))
            }
        } finally {
            setIsClaudeStreaming(false)
        }
    }

    const handleSendDerek = async () => {
        if (!derekInput.trim() || isDerekStreaming) return
        if (!canSendDerek) { setShowLimitModal(true); return }

        const userMsg = derekInput
        const newDerekContext = [...derekMessages, { role: "user" as const, content: userMsg }]
        setDerekMessages(newDerekContext)
        setDerekInput("")
        setIsDerekStreaming(true)

        let streamingMsgs = [...newDerekContext, { role: "ai" as const, content: "" }]

        try {
            setDerekMessages(streamingMsgs)

            const res = await fetch("/api/chat/derek", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg,
                    history: derekMessages,
                })
            })

            if (!res.ok) throw new Error("Failed to fetch")
            const text = await res.text(); // Extract plain text response

            streamingMsgs[streamingMsgs.length - 1].content = text;
            setDerekMessages(streamingMsgs);
            bumpDerekUse()
        } catch (e) {
            console.error(e)
            if (streamingMsgs.length > 0 && streamingMsgs[streamingMsgs.length - 1].role === "ai" && streamingMsgs[streamingMsgs.length - 1].content === "") {
                setDerekMessages(streamingMsgs.slice(0, -1))
            }
        } finally {
            setIsDerekStreaming(false)
        }
    }

    const handleSendClaude = async () => {
        if (!claudeInput.trim() || isClaudeStreaming) return
        if (!canSendClaude) { setShowLimitModal(true); return }

        bumpClaudeUse()
        await sendToClaude(claudeInput, claudeMessages)
        setClaudeInput("")
    }

    return (
        <div className="flex flex-col md:flex-row w-full h-full border border-border rounded-xl overflow-hidden bg-bg-base">

            <FreeTierModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />

            {/* LEFT PANEL - DEREK */}
            <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-border bg-bg-base relative min-w-0">
                <div className="px-5 py-4 border-b border-border bg-bg-base flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary">Derek</h3>
                        <p className="text-xs text-text-secondary">Your Prompt Engineer</p>
                    </div>
                    {guestMode && status !== "authenticated" && (
                        <span className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full",
                            derekUses >= GUEST_LIMIT
                                ? "bg-danger/10 text-danger border border-danger/30"
                                : "bg-accent/10 text-accent border border-accent/30"
                        )}>
                            {Math.max(0, GUEST_LIMIT - derekUses)} free left
                        </span>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar">
                    {derekMessages.map((msg, idx) => (
                        <div key={idx} className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
                            <div className="flex items-start gap-3 max-w-[85%]">
                                {msg.role === "ai" && (
                                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold shrink-0 mt-1">D</div>
                                )}

                                <div className={cn(
                                    "p-3 text-text-primary text-sm whitespace-pre-wrap font-mono",
                                    msg.role === "user" ? "bg-bg-hover rounded-[12px_12px_2px_12px]" : "bg-bg-panel rounded-[12px_12px_12px_2px]",
                                    isDerekStreaming && idx === derekMessages.length - 1 && msg.role === "ai" && msg.content !== "" ? "streaming-cursor" : ""
                                )}>
                                    {isDerekStreaming && idx === derekMessages.length - 1 && msg.role === "ai" && msg.content === ""
                                        ? <ThinkingIndicator words={["Structuring...", "Crafting prompt...", "Engineering...", "Refining...", "Almost ready..."]} />
                                        : msg.content
                                    }
                                </div>
                            </div>
                        </div>
                    ))}
                    {derekMessages.length === 0 && (
                        <div className="h-full flex items-center justify-center text-text-secondary text-sm">
                            Type an idea and Derek will engineer a perfect prompt.
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border bg-bg-base">
                    <div className="relative flex items-center">
                        <Button variant="ghost" size="icon" className="absolute left-1 text-text-secondary">
                            <ImageIcon size={18} />
                        </Button>
                        <Input
                            className="pl-10 pr-12 w-full"
                            placeholder="Message Derek..."
                            value={derekInput}
                            onChange={(e) => setDerekInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSendDerek() }}
                        />
                        <Button
                            size="icon"
                            className="absolute right-1 w-8 h-8 rounded bg-accent text-white hover:bg-accent-hover flex items-center justify-center"
                            onClick={handleSendDerek}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                        </Button>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL - CLAUDE */}
            <div className="flex-1 flex flex-col bg-bg-base relative min-w-0">
                <div className="px-5 py-4 border-b border-border bg-bg-base flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-text-primary">Claude</h3>
                    <div className="flex items-center gap-2">
                        {guestMode && status !== "authenticated" && (
                            <span className={cn(
                                "text-xs font-medium px-2 py-1 rounded-full",
                                claudeUses >= GUEST_LIMIT
                                    ? "bg-danger/10 text-danger border border-danger/30"
                                    : "bg-accent/10 text-accent border border-accent/30"
                            )}>
                                {Math.max(0, GUEST_LIMIT - claudeUses)} free left
                            </span>
                        )}
                        <Dropdown
                            value={selectedModel}
                            onChange={setSelectedModel}
                            options={[
                                { label: "Claude Sonnet 4.6", value: "claude-sonnet-4-6" },
                                { label: "Claude 3 Haiku", value: "claude-3-haiku-20240307" },
                                { label: "Claude 3 Opus", value: "claude-3-opus-20240229" },
                            ]}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar">
                    {claudeMessages.map((msg, idx) => (
                        <div key={idx} className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
                            <div className="flex items-start gap-3 max-w-[85%]">
                                {msg.role === "ai" && (
                                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold shrink-0 mt-1">C</div>
                                )}
                                <div className={cn(
                                    "p-3 text-text-primary text-sm whitespace-pre-wrap font-mono",
                                    msg.role === "user" ? "bg-bg-hover rounded-[12px_12px_2px_12px]" : "bg-bg-panel rounded-[12px_12px_12px_2px]",
                                    isClaudeStreaming && idx === claudeMessages.length - 1 && msg.role === "ai" && msg.content !== "" ? "streaming-cursor" : ""
                                )}>
                                    {isClaudeStreaming && idx === claudeMessages.length - 1 && msg.role === "ai" && msg.content === ""
                                        ? <ThinkingIndicator words={["Thinking...", "Generating...", "Processing...", "Composing...", "Almost there..."]} />
                                        : msg.content
                                    }
                                </div>
                            </div>
                        </div>
                    ))}
                    {claudeMessages.length === 0 && (
                        <div className="h-full flex items-center justify-center text-text-secondary text-sm">
                            Paste Derek&apos;s output here to generate your response.
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border bg-bg-base">
                    <div className="relative flex items-center">
                        <Input
                            className="pr-12 w-full"
                            placeholder="Message Claude..."
                            value={claudeInput}
                            onChange={(e) => setClaudeInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSendClaude() }}
                        />
                        <Button
                            size="icon"
                            className="absolute right-1 w-8 h-8 rounded bg-accent text-white hover:bg-accent-hover flex items-center justify-center"
                            onClick={handleSendClaude}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
