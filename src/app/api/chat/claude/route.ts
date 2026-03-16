import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: Request) {
    try {
        const { message, model, history } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const selectedModel = model || 'claude-sonnet-4-6';

        // Build multi-turn conversation history
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
            model: selectedModel,
            max_tokens: 2048,
            messages,
        });

        // Stream only raw text deltas — not SSE metadata
        const readable = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of stream) {
                        if (
                            chunk.type === 'content_block_delta' &&
                            chunk.delta.type === 'text_delta'
                        ) {
                            controller.enqueue(encoder.encode(chunk.delta.text));
                        }
                    }
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error: unknown) {
        console.error("Claude API Error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
