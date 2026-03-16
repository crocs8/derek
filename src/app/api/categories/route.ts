import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Category } from "@/lib/models/Category";

export async function GET() {
    try {
        await connectToDatabase();
        const categories = await Category.find({}).sort({ name: 1 }).lean();
        return NextResponse.json(categories);
    } catch (error) {
        console.error("Fetch Categories Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
