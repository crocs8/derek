import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Chat } from "@/lib/models/Chat";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !(session.user as any).id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        
        // Fetch chats sorted by newest first, only select needed fields for sidebar
        const chats = await Chat.find({ userId: (session.user as any).id })
            .select("_id title updatedAt")
            .sort({ updatedAt: -1 })
            .lean();

        return NextResponse.json(chats);
    } catch (error) {
        console.error("Fetch Chats Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

function sanitizeMessages(messages: any[]) {
    if (!Array.isArray(messages)) return [];
    return messages
        .filter(
            (m) =>
                m &&
                (m.role === "user" || m.role === "ai") &&
                typeof m.content === "string" &&
                m.content.trim().length > 0
        )
        .map((m) => ({
            role: m.role,
            content: m.content.trim(),
            // Preserve timestamp if provided (e.g., when rehydrating from client)
            ...(m.timestamp ? { timestamp: new Date(m.timestamp) } : {}),
        }));
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !(session.user as any).id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, derekMessages, claudeMessages } = body;
        
        await connectToDatabase();

        const cleanDerekMessages = sanitizeMessages(derekMessages);
        const cleanClaudeMessages = sanitizeMessages(claudeMessages);

        if (id) {
            // Update existing chat
            const updatedChat = await Chat.findOneAndUpdate(
                { _id: id, userId: (session.user as any).id },
                { 
                    $set: { 
                        derekMessages: cleanDerekMessages,
                        claudeMessages: cleanClaudeMessages,
                    } 
                },
                { new: true }
            );
            
            if (!updatedChat) {
                return NextResponse.json({ error: "Chat not found" }, { status: 404 });
            }
            return NextResponse.json(updatedChat);
        } else {
            // Create new chat
            // Generate a title from the first true user message
            let title = "New Chat";
            const firstMsg = [...cleanDerekMessages, ...cleanClaudeMessages].find(
                (m) => m.role === "user"
            );
            if (firstMsg && firstMsg.content) {
                title = firstMsg.content.substring(0, 40) + (firstMsg.content.length > 40 ? "..." : "");
            }

            const newChat = new Chat({
                userId: (session.user as any).id,
                title,
                derekMessages: cleanDerekMessages,
                claudeMessages: cleanClaudeMessages,
            });
            await newChat.save();
            return NextResponse.json(newChat);
        }
    } catch (error) {
        console.error("Save Chat Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
