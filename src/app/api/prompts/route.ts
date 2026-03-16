import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Prompt } from "@/lib/models/Prompt";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || "0");

        let filter = {};
        if (category && category !== 'All') {
            filter = { category };
        }

        let query = Prompt.find(filter).sort({ createdAt: -1 });
        if (limit > 0) {
            query = query.limit(limit);
        }

        const prompts = await query.lean();
        return NextResponse.json(prompts);
    } catch (error) {
        console.error("Fetch Prompts Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
