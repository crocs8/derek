import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const DEREK_SYSTEM_PROMPT = `You are Derek, a professional prompt engineer and AI communication strategist working for EaseMyPrompt.ai.

Your job is to take any layman, vague, or poorly worded input from a user and transform it into a clear, structured, highly effective AI prompt that will get the best possible results from any LLM.

Your personality: Professional but warm and friendly. Knowledgeable but never condescending. You make users feel like they have a skilled expert helping them communicate with AI effectively.

How you respond:
1. Briefly acknowledge what the user wants (1 sentence max)
2. Output a clearly labeled **STRUCTURED PROMPT:** section
3. The structured prompt must include: Role/Context, Task, Format/Output, Tone, Constraints
4. After the prompt, add a short **PRO TIP:** on how to get even better results.

Always be concise. Get to the structured output quickly.

You are NOT a general-purpose AI. If asked anything unrelated to prompt engineering, politely redirect:
"I'm Derek, your prompt engineer! Ask me to structure any idea you have into a powerful AI prompt."`;

export async function POST(req: Request) {
    try {
        if (!process.env.ANTHROPIC_API_KEY) {
            return new Response(
                "Derek is unavailable because the Anthropic API key is missing or invalid.\n\nSet ANTHROPIC_API_KEY in your .env and restart the dev server.",
                {
                    status: 200,
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
                }
            );
        }

        const { message, history } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Build conversation history for multi-turn context
        const messages: Anthropic.MessageParam[] = [];

        if (Array.isArray(history)) {
            for (const msg of history) {
                if (msg.content && (msg.role === 'user' || msg.role === 'ai')) {
                    messages.push({
                        role: msg.role === 'user' ? 'user' : 'assistant',
                        content: msg.content,
                    });
                }
            }
        }

        messages.push({ role: 'user', content: message });

        const stream = await anthropic.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 1500,
            system: DEREK_SYSTEM_PROMPT,
            messages,
        });

        // Read the full response and return it as plain text (no streaming)
        const finalMessage = await stream.finalMessage();
        // content is an array of blocks e.g. [{ type: "text", text: "..." }]
        const textBlock = (finalMessage.content ?? []).find((b) => b.type === "text") as Anthropic.TextBlock | undefined;
        const text = textBlock?.text ?? "";

        return new Response(text, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error: unknown) {
        console.error("Derek API Error:", error);

        const message = error instanceof Error ? error.message : "Unknown error";
        if (message.toLowerCase().includes("invalid x-api-key") || (error as any)?.status === 401) {
            return new Response(
                "Derek is unavailable because the Anthropic API key is invalid.\n\nSet ANTHROPIC_API_KEY in your .env and restart the dev server.",
                {
                    status: 200,
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
                }
            );
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
