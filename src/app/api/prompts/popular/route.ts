import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Prompt } from "@/lib/models/Prompt";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectToDatabase();
        
        // Fetch top 10 prompts sorted by popularScore descending
        const prompts = await Prompt.find({}).sort({ popularScore: -1 }).limit(10).lean();
        
        return NextResponse.json(prompts);
    } catch (error) {
        console.error("Fetch Popular Prompts Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
