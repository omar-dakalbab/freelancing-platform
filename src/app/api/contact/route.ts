import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendContactEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(1, "Message is required").max(5000),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 3 contact submissions per 15 minutes per IP
    const ip = getClientIp(req.headers);
    const rl = checkRateLimit(`contact:${ip}`, { limit: 3, windowSec: 900 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: { message: "Too many submissions. Please try again later." } },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: parsed.error.issues[0]?.message || "Invalid input" } },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;

    await sendContactEmail({ name, email, subject, message });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: { message: "Failed to send message. Please try again." } },
      { status: 500 }
    );
  }
}
