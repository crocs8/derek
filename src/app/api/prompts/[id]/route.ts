import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Prompt } from "@/lib/models/Prompt";
import mongoose from "mongoose";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectToDatabase();
        if (!mongoose.Types.ObjectId.isValid(params.id)) {
            return NextResponse.json({ error: "Invalid Prompt ID" }, { status: 400 });
        }
        
        const prompt = await Prompt.findById(params.id).lean();
        if (!prompt) {
            return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
        }

        return NextResponse.json(prompt);
    } catch (error) {
        console.error("Fetch Single Prompt Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
