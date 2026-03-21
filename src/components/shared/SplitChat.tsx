"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Image as ImageIcon, Copy, Check, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { Dropdown } from "@/components/ui/dropdown"
import { FreeTierModal } from "@/components/shared/FreeTierModal"
import { useSession } from "next-auth/react"

const GUEST_LIMIT = 2
const DEREK_KEY = "emp_guest_derek_uses"
const CLAUDE_KEY = "emp_guest_claude_uses"

const ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "video/mp4",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "text/plain",
]
const ALLOWED_EXT = ".pdf,.docx,.mp4,.jpg,.png,.jpeg,.txt"

// ── Thinking indicator ──────────────────────────────────────────────────────
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
            <span style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease", fontFamily: "monospace" }}>
                {words[idx]}
            </span>
            <span className="flex gap-1">
                {[0, 1, 2].map(i => (
                    <span key={i} style={{
                        width: 5, height: 5, borderRadius: "50%",
                        backgroundColor: "currentColor", display: "inline-block",
                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                ))}
            </span>
            <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-5px);opacity:1} }`}</style>
        </div>
    )
}

// ── Copy button ─────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = React.useState(false)
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {}
    }
    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors mt-1 ml-1 select-none"
            title="Copy response"
        >
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
        </button>
    )
}

// ── File helpers ────────────────────────────────────────────────────────────
async function readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve((reader.result as string).split(",")[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

async function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsText(file)
    })
}

async function buildFilePayload(file: File): Promise<{ type: "text"; text: string } | { type: "image"; mediaType: string; base64: string } | { type: "document"; mediaType: string; base64: string; name: string }> {
    const isText = file.type === "text/plain" || file.name.endsWith(".txt")
    const isImage = file.type.startsWith("image/")
    if (isText) {
        const text = await readFileAsText(file)
        return { type: "text", text: `[Attached file: ${file.name}]\n${text}` }
    }
    if (isImage) {
        const base64 = await readFileAsBase64(file)
        return { type: "image", mediaType: file.type, base64 }
    }
    // pdf, docx, mp4 → send as base64 document
    const base64 = await readFileAsBase64(file)
    return { type: "document", mediaType: file.type, base64, name: file.name }
}

// ── Types ───────────────────────────────────────────────────────────────────
interface Message { role: "user" | "ai"; content: string }
interface SplitChatProps { guestMode?: boolean }

// ── File badge ──────────────────────────────────────────────────────────────
function FileBadge({ file, onRemove }: { file: File; onRemove: () => void }) {
    return (
        <div className="flex items-center gap-1 bg-accent/10 border border-accent/20 rounded px-2 py-0.5 text-xs text-accent max-w-[180px]">
            <Paperclip size={11} className="shrink-0" />
            <span className="truncate">{file.name}</span>
            <button onClick={onRemove} className="ml-1 text-text-secondary hover:text-red-400">✕</button>
        </div>
    )
}

// ── Main Component ───────────────────────────────────────────────────────────
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
    const [derekUses, setDerekUses] = React.useState(0)
    const [claudeUses, setClaudeUses] = React.useState(0)
    const [showLimitModal, setShowLimitModal] = React.useState(false)

    // File state
    const [derekFile, setDerekFile] = React.useState<File | null>(null)
    const [claudeFile, setClaudeFile] = React.useState<File | null>(null)
    const derekFileRef = React.useRef<HTMLInputElement>(null)
    const claudeFileRef = React.useRef<HTMLInputElement>(null)

    // Scroll refs
    const derekScrollRef = React.useRef<HTMLDivElement>(null)
    const claudeScrollRef = React.useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom on new messages
    React.useEffect(() => {
        if (derekScrollRef.current) derekScrollRef.current.scrollTop = derekScrollRef.current.scrollHeight
    }, [derekMessages])
    React.useEffect(() => {
        if (claudeScrollRef.current) claudeScrollRef.current.scrollTop = claudeScrollRef.current.scrollHeight
    }, [claudeMessages])

    React.useEffect(() => {
        if (guestMode) {
            setDerekUses(parseInt(localStorage.getItem(DEREK_KEY) ?? "0", 10))
            setClaudeUses(parseInt(localStorage.getItem(CLAUDE_KEY) ?? "0", 10))
        }
    }, [guestMode])

    const canSendDerek = !guestMode || status === "authenticated" || derekUses < GUEST_LIMIT
    const canSendClaude = !guestMode || status === "authenticated" || claudeUses < GUEST_LIMIT

    const bumpDerekUse = () => { const n = derekUses + 1; setDerekUses(n); localStorage.setItem(DEREK_KEY, String(n)) }
    const bumpClaudeUse = () => { const n = claudeUses + 1; setClaudeUses(n); localStorage.setItem(CLAUDE_KEY, String(n)) }

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
        if (pd) { setDerekInput(pd); currentUrl.searchParams.delete('prefillDerek'); shouldClean = true }
        if (pc) { setClaudeInput(pc); currentUrl.searchParams.delete('prefillClaude'); shouldClean = true }
        
        const verified = searchParams.get('verified')
        if (verified === 'true') {
            alert("Verification successful!");
            currentUrl.searchParams.delete('verified');
            shouldClean = true;
        }

        if (shouldClean) router.replace(currentUrl.pathname + currentUrl.search, { scroll: false })
    }, [chatId, searchParams, router])

    const saveChat = async (dM: Message[], cM: Message[]) => {
        const clean = (msgs: Message[]) => msgs.filter(m => m.content.trim().length > 0)
        try {
            const res = await fetch("/api/chats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: chatId, derekMessages: clean(dM), claudeMessages: clean(cM) })
            })
            const data = await res.json()
            if (data._id && !chatId) router.replace(`/dashboard?id=${data._id}`)
        } catch (e) { console.error("Failed to save chat", e) }
    }

    const sendToClaude = async (message: string, history: Message[], file?: File | null) => {
        const newContext = [...history, { role: "user" as const, content: message }]
        setClaudeMessages(newContext)
        setIsClaudeStreaming(true)
        let streamingMsgs = [...newContext, { role: "ai" as const, content: "" }]

        try {
            setClaudeMessages(streamingMsgs)

            // Build body with optional file
            let body: Record<string, unknown> = { message, model: selectedModel, history }
            if (file) {
                const payload = await buildFilePayload(file)
                body = { ...body, file: payload }
            }

            const res = await fetch("/api/chat/claude", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })

            if (!res.ok) throw new Error("Failed to fetch")
            const reader = res.body?.getReader()
            const decoder = new TextDecoder()
            let done = false
            while (!done && reader) {
                const { value, done: doneReading } = await reader.read()
                done = doneReading
                streamingMsgs = [...streamingMsgs]
                streamingMsgs[streamingMsgs.length - 1].content += decoder.decode(value)
                setClaudeMessages(streamingMsgs)
            }
            await saveChat(derekMessages, streamingMsgs)
        } catch (e) {
            console.error(e)
            if (streamingMsgs[streamingMsgs.length - 1]?.role === "ai" && streamingMsgs[streamingMsgs.length - 1].content === "")
                setClaudeMessages(streamingMsgs.slice(0, -1))
        } finally {
            setIsClaudeStreaming(false)
        }
    }

    const handleSendDerek = async () => {
        if (!derekInput.trim() || isDerekStreaming) return
        if (!canSendDerek) { setShowLimitModal(true); return }

        const userMsg = derekInput
        const newContext = [...derekMessages, { role: "user" as const, content: userMsg }]
        setDerekMessages(newContext)
        setDerekInput("")
        setIsDerekStreaming(true)
        const fileToSend = derekFile
        setDerekFile(null)

        let streamingMsgs = [...newContext, { role: "ai" as const, content: "" }]

        try {
            setDerekMessages(streamingMsgs)

            let body: Record<string, unknown> = { message: userMsg, history: derekMessages }
            if (fileToSend) {
                const payload = await buildFilePayload(fileToSend)
                body = { ...body, file: payload }
            }

            const res = await fetch("/api/chat/derek", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })

            if (!res.ok) throw new Error("Failed to fetch")
            const text = await res.text()
            streamingMsgs[streamingMsgs.length - 1].content = text
            setDerekMessages(streamingMsgs)
            bumpDerekUse()
        } catch (e) {
            console.error(e)
            if (streamingMsgs[streamingMsgs.length - 1]?.role === "ai" && streamingMsgs[streamingMsgs.length - 1].content === "")
                setDerekMessages(streamingMsgs.slice(0, -1))
        } finally {
            setIsDerekStreaming(false)
        }
    }

    const handleSendClaude = async () => {
        if (!claudeInput.trim() || isClaudeStreaming) return
        if (!canSendClaude) { setShowLimitModal(true); return }
        const fileToSend = claudeFile
        setClaudeFile(null)
        bumpClaudeUse()
        await sendToClaude(claudeInput, claudeMessages, fileToSend)
        setClaudeInput("")
    }

    // ── Render helpers ─────────────────────────────────────────────────────
    const renderMessages = (
        messages: Message[],
        isStreaming: boolean,
        avatarLetter: string,
        thinkingWords: string[],
        scrollRef: React.RefObject<HTMLDivElement>
    ) => (
        <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar"
            style={{ WebkitOverflowScrolling: "touch" }}
        >
            {messages.map((msg, idx) => (
                <div key={idx} className={cn("flex flex-col w-full", msg.role === "user" ? "items-end" : "items-start")}>
                    <div className="flex items-start gap-3 max-w-[85%]">
                        {msg.role === "ai" && (
                            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold shrink-0 mt-1">{avatarLetter}</div>
                        )}
                        <div className={cn(
                            "p-3 text-text-primary text-sm whitespace-pre-wrap font-chat",
                            msg.role === "user" ? "bg-bg-hover rounded-[12px_12px_2px_12px]" : "bg-bg-panel rounded-[12px_12px_12px_2px]",
                            isStreaming && idx === messages.length - 1 && msg.role === "ai" && msg.content !== "" ? "streaming-cursor" : ""
                        )}>
                            {isStreaming && idx === messages.length - 1 && msg.role === "ai" && msg.content === ""
                                ? <ThinkingIndicator words={thinkingWords} />
                                : msg.content
                            }
                        </div>
                    </div>
                    {/* Copy button below AI responses */}
                    {msg.role === "ai" && msg.content && !(isStreaming && idx === messages.length - 1) && (
                        <div className="ml-11">
                            <CopyButton text={msg.content} />
                        </div>
                    )}
                </div>
            ))}
            {messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-text-secondary text-sm">
                    {avatarLetter === "D" ? "Type an idea and Derek will engineer a perfect prompt." : "Paste Derek's output here to generate your response."}
                </div>
            )}
        </div>
    )

    return (
        <div className="flex flex-col md:flex-row w-full h-[600px] md:h-full border border-border rounded-xl overflow-hidden bg-bg-base">
            <FreeTierModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />

            {/* LEFT PANEL - DEREK */}
            <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-border bg-bg-base relative min-w-0 overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-bg-base flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary">Derek</h3>
                        <p className="text-xs text-text-secondary">Your Prompt Engineer</p>
                    </div>
                    {guestMode && status !== "authenticated" && (
                        <span className={cn("text-xs font-medium px-2 py-1 rounded-full",
                            derekUses >= GUEST_LIMIT
                                ? "bg-danger/10 text-danger border border-danger/30"
                                : "bg-accent/10 text-accent border border-accent/30"
                        )}>
                            {Math.max(0, GUEST_LIMIT - derekUses)} free left
                        </span>
                    )}
                </div>

                {renderMessages(derekMessages, isDerekStreaming, "D",
                    ["Structuring...", "Crafting prompt...", "Engineering...", "Refining...", "Almost ready..."],
                    derekScrollRef
                )}

                <div className="p-4 border-t border-border bg-bg-base shrink-0">
                    {derekFile && (
                        <div className="mb-2">
                            <FileBadge file={derekFile} onRemove={() => setDerekFile(null)} />
                        </div>
                    )}
                    <div className="relative flex items-center">
                        {/* Hidden file input */}
                        <input
                            ref={derekFileRef}
                            type="file"
                            accept={ALLOWED_EXT}
                            className="hidden"
                            onChange={e => setDerekFile(e.target.files?.[0] ?? null)}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-1 text-text-secondary hover:text-accent"
                            onClick={() => derekFileRef.current?.click()}
                            title="Attach file"
                        >
                            <Paperclip size={18} />
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
            <div className="flex-1 flex flex-col bg-bg-base relative min-w-0 overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-bg-base flex items-center justify-between shrink-0">
                    <h3 className="text-lg font-semibold text-text-primary">Claude</h3>
                    <div className="flex items-center gap-2">
                        {guestMode && status !== "authenticated" && (
                            <span className={cn("text-xs font-medium px-2 py-1 rounded-full",
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

                {renderMessages(claudeMessages, isClaudeStreaming, "C",
                    ["Thinking...", "Generating...", "Processing...", "Composing...", "Almost there..."],
                    claudeScrollRef
                )}

                <div className="p-4 border-t border-border bg-bg-base shrink-0">
                    {claudeFile && (
                        <div className="mb-2">
                            <FileBadge file={claudeFile} onRemove={() => setClaudeFile(null)} />
                        </div>
                    )}
                    <div className="relative flex items-center">
                        {/* Hidden file input */}
                        <input
                            ref={claudeFileRef}
                            type="file"
                            accept={ALLOWED_EXT}
                            className="hidden"
                            onChange={e => setClaudeFile(e.target.files?.[0] ?? null)}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-1 text-text-secondary hover:text-accent"
                            onClick={() => claudeFileRef.current?.click()}
                            title="Attach file"
                        >
                            <Paperclip size={18} />
                        </Button>
                        <Input
                            className="pl-10 pr-12 w-full"
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
