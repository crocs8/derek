import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const serverUrl = process.env.EMAIL_SERVER;
        const fromEmail = process.env.EMAIL_FROM || "noreply@easemyprompt.ai";
        
        if (!serverUrl) {
            return NextResponse.json({ error: "EMAIL_SERVER is not set in process.env" }, { status: 500 });
        }

        // @ts-ignore
        const transport = nodemailer.createTransport(serverUrl);

        const result = await transport.sendMail({
            to: fromEmail, // Send to yourself
            from: fromEmail,
            subject: "[EASEMYPROMPT] Render SMTP Test",
            text: "This is a test to verify if Render can securely connect to Gmail SMTP.",
        });

        return NextResponse.json({
            success: true,
            message: "Email dispatched successfully!",
            accepted: result.accepted,
            rejected: result.rejected,
            pending: result.pending,
            response: result.response
        });

    } catch (error: any) {
        return NextResponse.json({
            error: "Failed to send email. Read detailed properties below.",
            message: error.message,
            code: error.code,
            command: error.command,
            stack: error.stack,
            fullErrorObj: typeof error === 'object' ? JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error))) : String(error)
        }, { status: 500 });
    }
}
