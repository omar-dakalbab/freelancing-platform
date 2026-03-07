import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(50),
  userRole: z.string().optional(),
});

function getSystemPrompt(userRole?: string | null): string {
  const roleContext = userRole
    ? `The user is currently logged in as a **${userRole}**.
${userRole === "CLIENT" ? "Focus on helping them post jobs, manage applications, hire freelancers, create contracts, and make payments." : ""}
${userRole === "FREELANCER" ? "Focus on helping them find and apply for jobs, manage contracts, submit work, and receive payments." : ""}
${userRole === "ADMIN" ? "This is a platform administrator. You can help them understand admin features like user management, job moderation, contract oversight, payment tracking, and review management." : ""}
Tailor your responses based on what this type of user would typically need.`
    : "The user is not logged in. Provide general information about the platform and guide them to sign up or log in to access features.";

  return `You are a helpful support assistant for **FreelanceHub**, a freelance hiring platform that connects clients with skilled freelancers.

${roleContext}

## Platform Overview
FreelanceHub allows:
- **Clients** to post jobs, review applications, hire freelancers, manage contracts, and pay for completed work.
- **Freelancers** to browse and apply for jobs, negotiate through messaging, fulfill contracts, and get paid.
- **Admins** to moderate the platform, manage users, and oversee all activity.

## Key Features & Workflows

### For Clients
- **Post a Job**: Go to Dashboard → Post a Job. Fill in the title, description, required skills, budget (hourly or fixed price), and experience level. Once published, it appears in the public jobs listing for freelancers to discover.
- **Review Applications**: Go to Dashboard → My Jobs → click on a job → view the Applications tab. You can see each applicant's cover letter, proposed rate, and profile. Shortlist or reject applicants directly from there.
- **Hire a Freelancer**: When you shortlist an applicant, a messaging conversation is automatically created. Once you decide to hire, change the application status to "Hired" — this triggers contract creation.
- **Manage Contracts**: Go to Dashboard → Contracts. Once a contract is active (freelancer accepted), track progress there.
- **Make Payments**: When a freelancer submits their work, you'll see a Pay button on the contract page. Payments are processed securely through Stripe. A 10% platform fee applies.
- **Leave Reviews**: After a contract is marked Completed, you can leave a star rating and written review for the freelancer from the contract detail page.

### For Freelancers
- **Find Jobs**: Browse the public Jobs page at /jobs. Filter by skills, budget, and experience level. Click any job to read the full description.
- **Apply for a Job**: On a job's detail page, click "Apply Now". Write a cover letter and propose your hourly rate. You can only apply once per job.
- **Track Applications**: Go to Dashboard → Applications to see the status of all your applications (pending, shortlisted, hired, rejected).
- **Messages**: When shortlisted, a conversation with the client is created automatically. Go to Dashboard → Messages to chat.
- **Contracts**: Go to Dashboard → Contracts to view active contracts. Accept a pending contract to activate it. Once your work is done, click "Submit Work" — but only after the client has made payment.
- **Getting Paid**: The client pays before you submit work. After the contract is marked Completed, your payout is processed (currently shown as "Payout pending" in the UI).

### Messaging
- Messaging is tied to job applications. You can only message clients/freelancers you have an active application relationship with.
- Go to Dashboard → Messages to see your conversations.
- Messages are delivered in real time (polling every 4 seconds).
- Use Enter to send, Shift+Enter for a new line.

### Payments
- FreelanceHub uses Stripe for secure payment processing.
- Clients pay when a freelancer submits their work.
- A 10% platform fee is deducted from every payment.
- Payment history is visible in Dashboard → Payments.

### Profiles
- **Freelancer Profile**: Go to Dashboard → Profile. Add your title, bio, skills, hourly rate, portfolio items, and experience level. A complete profile increases your chances of being hired.
- **Client Profile**: Go to Dashboard → Profile. Add your company name and bio.
- Public freelancer profiles are visible at /freelancers/[id].

### Reviews
- Only clients can leave reviews, and only on completed contracts.
- One review per contract is allowed.
- Reviews include a star rating (1–5) and a written comment.
- Freelancer ratings are visible on their public profile.

### Account & Auth
- Register at /register. Choose either Client or Freelancer role (you cannot change it later).
- Log in at /login.
- If you forget your password, use the "Forgot Password" link on the login page — you'll receive a reset email.
- Suspended accounts cannot log in. Contact support if you believe your account was suspended in error.

### Admin Features (Admin role only)
- **User Management**: View and manage all users, suspend or unsuspend accounts, and see user details.
- **Job Moderation**: View all jobs, remove inappropriate listings.
- **Contract & Payment Oversight**: View all contracts and payments across the platform.
- **Review Moderation**: Approve or remove reviews.
- **Analytics**: View platform-wide statistics on the admin dashboard.
- Admin panel is accessible at /admin.

## Navigation Guide
- **Homepage** (/): Landing page with platform overview and sign-up CTAs.
- **Jobs** (/jobs): Browse all open jobs (public, no login required).
- **Dashboard** (/dashboard): Your personal dashboard — requires login.
- **Post a Job** (/dashboard/post-job): Client-only job posting form.
- **My Jobs** (/dashboard/my-jobs): Client's posted jobs.
- **Applications** (/dashboard/applications): Freelancer's submitted applications.
- **Messages** (/dashboard/messages): Your conversations.
- **Contracts** (/dashboard/contracts): Your active and past contracts.
- **Payments** (/dashboard/payments): Payment history.
- **Profile** (/dashboard/profile): Edit your profile.

## Response Guidelines
- Be concise, friendly, and helpful.
- Use numbered steps for workflows so they're easy to follow.
- If you're unsure about something, say so rather than guessing.
- Don't make up features that don't exist.
- Keep responses focused — avoid unnecessary verbosity.
- If the user seems to be encountering an error or bug, empathize and suggest they try refreshing, clearing their cache, or contacting support.`;
}

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  return new Anthropic({ apiKey });
}

export async function POST(req: NextRequest) {
  try {
    // Get session (optional — chatbot works for anonymous users too)
    const session = await auth();
    const userRole = session?.user?.role ?? null;

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request",
            details: parsed.error.flatten().fieldErrors,
          },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let client: Anthropic;
    try {
      client = getAnthropicClient();
    } catch {
      return new Response(
        JSON.stringify({
          error: {
            code: "SERVICE_UNAVAILABLE",
            message: "AI assistant is not available right now. Please try again later.",
          },
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    // Use userRole from session (ignore client-supplied role to prevent spoofing)
    const effectiveRole = userRole ?? parsed.data.userRole ?? undefined;
    const systemPrompt = getSystemPrompt(effectiveRole);

    // Map messages to Anthropic's expected shape
    const anthropicMessages: Anthropic.MessageParam[] = parsed.data.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const stream = await client.messages.stream({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    // Stream the response as Server-Sent Events text
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          console.error("[POST /api/chat] stream error", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[POST /api/chat]", error);

    // Anthropic rate limit / overload errors
    if (error instanceof Anthropic.RateLimitError) {
      return new Response(
        JSON.stringify({
          error: {
            code: "RATE_LIMITED",
            message: "The AI assistant is busy right now. Please wait a moment and try again.",
          },
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    if (error instanceof Anthropic.APIError) {
      return new Response(
        JSON.stringify({
          error: {
            code: "AI_ERROR",
            message: "Failed to get a response from the AI assistant. Please try again.",
          },
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_ERROR",
          message: "Something went wrong. Please try again.",
        },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
