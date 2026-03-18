import { NextRequest, NextResponse } from "next/server";
import { Contact } from "@/lib/models/Contact";
import dbConnect from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    const contact = await Contact.create({ name, email, message });
    return NextResponse.json({ success: true, contact });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save message." }, { status: 500 });
  }
}
