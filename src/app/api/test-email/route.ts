import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const apiKey = process.env.RESEND_API_KEY;
        const fromEmail = "onboarding@resend.dev";
        const testToEmail = "aryan.thakkar24@sakec.ac.in"; // Hardcoding to the exact Resend test account
        
        if (!apiKey) {
            return NextResponse.json({ error: "RESEND_API_KEY is not set in Render Environment Variables!" }, { status: 500 });
        }

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "EaseMyPrompt <" + fromEmail + ">",
                to: testToEmail,
                subject: "[EASEMYPROMPT] Render Resend Test",
                text: "This is a test to verify if Render can securely connect to Resend API.",
            })
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({
                success: false,
                error: "Resend API rejected the request",
                details: data
            }, { status: res.status });
        }

        return NextResponse.json({
            success: true,
            message: "Email dispatched successfully via Resend API!",
            resendResponse: data
        });

    } catch (error: any) {
        return NextResponse.json({
            error: "Failed to send email. Exception caught.",
            message: error.message,
            stack: error.stack,
        }, { status: 500 });
    }
}
