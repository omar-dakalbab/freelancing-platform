/**
 * Email service using Brevo (formerly Sendinblue) transactional email API.
 *
 * All send functions are designed to be called fire-and-forget:
 *   sendWelcomeEmail(email, name).catch(console.error);
 *
 * Email failures are always logged but never thrown, so callers never break.
 */
import { BrevoClient } from "@getbrevo/brevo";

// ---------------------------------------------------------------------------
// Client factory — never instantiate at module level to avoid build-time failures
// ---------------------------------------------------------------------------

function getBrevoClient(): BrevoClient {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }
  return new BrevoClient({ apiKey });
}

function getSender() {
  return {
    email: process.env.BREVO_SENDER_EMAIL ?? "noreply@tryletswork.com",
    name: process.env.BREVO_SENDER_NAME ?? "LetsWork",
  };
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

// ---------------------------------------------------------------------------
// Core send helpers
// ---------------------------------------------------------------------------

interface SendEmailOptions {
  to: { email: string; name?: string };
  subject: string;
  htmlContent: string;
  textContent: string;
}

/**
 * Send a transactional email via Brevo. Returns void — errors are rethrown
 * so the caller can decide whether to log or ignore them.
 */
async function sendEmail(opts: SendEmailOptions): Promise<void> {
  const client = getBrevoClient();
  await client.transactionalEmails.sendTransacEmail({
    sender: getSender(),
    to: [{ email: opts.to.email, name: opts.to.name }],
    subject: opts.subject,
    htmlContent: opts.htmlContent,
    textContent: opts.textContent,
  });
}

// ---------------------------------------------------------------------------
// HTML layout helper — wraps content in a branded shell
// ---------------------------------------------------------------------------

function emailLayout(bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LetsWork</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background-color:#0f172a;padding:24px 32px;border-radius:8px 8px 0 0;">
              <span style="color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:-0.5px;">LetsWork</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:32px;border-radius:0 0 8px 8px;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 0 0;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                &copy; ${new Date().getFullYear()} LetsWork. All rights reserved.
              </p>
              <p style="margin:4px 0 0 0;color:#9ca3af;font-size:12px;">
                You are receiving this email because of activity on your LetsWork account.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function primaryButton(label: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;margin-top:16px;padding:12px 24px;background-color:#0f172a;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">${label}</a>`;
}

function h1(text: string): string {
  return `<h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#0f172a;">${text}</h1>`;
}

function p(text: string): string {
  return `<p style="margin:12px 0;color:#374151;font-size:15px;line-height:1.6;">${text}</p>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />`;
}

// ---------------------------------------------------------------------------
// Contact form — sends message to the support inbox
// ---------------------------------------------------------------------------

export async function sendContactEmail(opts: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const supportEmail = process.env.BREVO_SENDER_EMAIL ?? "noreply@tryletswork.com";

  const html = emailLayout(`
    ${h1("New contact form message")}
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:14px;width:100px;">From:</td>
        <td style="padding:8px 0;color:#111827;font-size:14px;">${opts.name} (${opts.email})</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Subject:</td>
        <td style="padding:8px 0;color:#111827;font-size:14px;">${opts.subject}</td>
      </tr>
    </table>
    ${divider()}
    <div style="margin:16px 0;padding:16px;background-color:#f9fafb;border-radius:6px;">
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;white-space:pre-wrap;">${opts.message}</p>
    </div>
    ${p(`Reply directly to <a href="mailto:${opts.email}" style="color:#0f172a;">${opts.email}</a> to respond.`)}
  `);

  const text = [
    "New contact form message",
    "",
    `From: ${opts.name} (${opts.email})`,
    `Subject: ${opts.subject}`,
    "",
    opts.message,
  ].join("\n");

  await sendEmail({
    to: { email: supportEmail, name: "LetsWork Support" },
    subject: `[Contact] ${opts.subject}`,
    htmlContent: html,
    textContent: text,
  });
}

// ---------------------------------------------------------------------------
// Email verification
// ---------------------------------------------------------------------------

export async function sendVerificationEmail(
  toEmail: string,
  verificationToken: string
): Promise<void> {
  const appUrl = getAppUrl();
  const verifyUrl = `${appUrl}/verify-email?token=${verificationToken}`;

  const html = emailLayout(`
    ${h1("Verify your email address")}
    ${p("Thanks for signing up for LetsWork! Please verify your email address to get started.")}
    ${p("Click the button below to verify. This link expires in <strong>24 hours</strong>.")}
    ${primaryButton("Verify my email", verifyUrl)}
    ${divider()}
    ${p("If you did not create a LetsWork account, you can safely ignore this email.")}
    ${p(`Or copy and paste this URL into your browser:<br /><a href="${verifyUrl}" style="color:#0f172a;word-break:break-all;">${verifyUrl}</a>`)}
  `);

  const text = [
    "Verify your email address",
    "",
    "Thanks for signing up for LetsWork! Please verify your email address to get started.",
    "Click the link below to verify. This link expires in 24 hours.",
    "",
    verifyUrl,
    "",
    "If you did not create a LetsWork account, you can safely ignore this email.",
  ].join("\n");

  await sendEmail({
    to: { email: toEmail },
    subject: "Verify your LetsWork email",
    htmlContent: html,
    textContent: text,
  });
}

// ---------------------------------------------------------------------------
// Welcome email
// ---------------------------------------------------------------------------

export async function sendWelcomeEmail(
  toEmail: string,
  role: "CLIENT" | "FREELANCER"
): Promise<void> {
  const appUrl = getAppUrl();
  const roleLabel = role === "CLIENT" ? "client" : "freelancer";
  const dashboardPath = role === "CLIENT" ? "/dashboard/client" : "/dashboard/freelancer";

  const html = emailLayout(`
    ${h1("Welcome to LetsWork!")}
    ${p(`Thanks for signing up as a <strong>${roleLabel}</strong>. Your account is ready to go.`)}
    ${role === "CLIENT"
      ? p("You can now post jobs, review proposals, and hire talented freelancers.")
      : p("You can now browse open jobs, submit proposals, and land your next project.")}
    ${p("Get started by completing your profile — it takes just a few minutes.")}
    ${primaryButton("Go to your dashboard", `${appUrl}${dashboardPath}`)}
    ${divider()}
    ${p("If you have any questions, just reply to this email and we'll be happy to help.")}
  `);

  const text = [
    "Welcome to LetsWork!",
    "",
    `Thanks for signing up as a ${roleLabel}.`,
    role === "CLIENT"
      ? "You can now post jobs, review proposals, and hire talented freelancers."
      : "You can now browse open jobs, submit proposals, and land your next project.",
    "",
    `Go to your dashboard: ${appUrl}${dashboardPath}`,
  ].join("\n");

  await sendEmail({
    to: { email: toEmail },
    subject: "Welcome to LetsWork",
    htmlContent: html,
    textContent: text,
  });
}

// ---------------------------------------------------------------------------
// Forgot password / reset password email
// ---------------------------------------------------------------------------

export async function sendPasswordResetEmail(
  toEmail: string,
  resetToken: string
): Promise<void> {
  const appUrl = getAppUrl();
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

  const html = emailLayout(`
    ${h1("Reset your password")}
    ${p("We received a request to reset the password for your LetsWork account.")}
    ${p("Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.")}
    ${primaryButton("Reset my password", resetUrl)}
    ${divider()}
    ${p("If you did not request a password reset, you can safely ignore this email — your password will not change.")}
    ${p(`Or copy and paste this URL into your browser:<br /><a href="${resetUrl}" style="color:#0f172a;word-break:break-all;">${resetUrl}</a>`)}
  `);

  const text = [
    "Reset your password",
    "",
    "We received a request to reset the password for your LetsWork account.",
    "Click the link below to choose a new password. This link expires in 1 hour.",
    "",
    resetUrl,
    "",
    "If you did not request a password reset, you can safely ignore this email.",
  ].join("\n");

  await sendEmail({
    to: { email: toEmail },
    subject: "Reset your LetsWork password",
    htmlContent: html,
    textContent: text,
  });
}

// ---------------------------------------------------------------------------
// Application received — notify client
// ---------------------------------------------------------------------------

export async function sendApplicationReceivedEmail(opts: {
  toEmail: string;
  clientName?: string;
  jobTitle: string;
  jobId: string;
  freelancerEmail: string;
  bidAmount: number;
}): Promise<void> {
  const appUrl = getAppUrl();
  const jobUrl = `${appUrl}/dashboard/client/jobs/${opts.jobId}`;

  const html = emailLayout(`
    ${h1("New application received")}
    ${p(`A freelancer has applied to your job <strong>${opts.jobTitle}</strong>.`)}
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:14px;width:140px;">Applicant:</td>
        <td style="padding:8px 0;color:#111827;font-size:14px;">${opts.freelancerEmail}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Proposed bid:</td>
        <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;">$${opts.bidAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    </table>
    ${p("Review the application and respond to the freelancer from your dashboard.")}
    ${primaryButton("View application", jobUrl)}
  `);

  const text = [
    "New application received",
    "",
    `A freelancer has applied to your job: ${opts.jobTitle}`,
    `Applicant: ${opts.freelancerEmail}`,
    `Proposed bid: $${opts.bidAmount.toFixed(2)}`,
    "",
    `View the application: ${jobUrl}`,
  ].join("\n");

  await sendEmail({
    to: { email: opts.toEmail, name: opts.clientName },
    subject: `New application for "${opts.jobTitle}"`,
    htmlContent: html,
    textContent: text,
  });
}

// ---------------------------------------------------------------------------
// Application status update — notify freelancer
// ---------------------------------------------------------------------------

const STATUS_COPY: Record<
  "SHORTLISTED" | "REJECTED" | "HIRED",
  { headline: string; body: string; badge: string }
> = {
  SHORTLISTED: {
    headline: "You've been shortlisted!",
    body: "Great news — the client has shortlisted your application. They may reach out to discuss next steps.",
    badge: "#1d4ed8",
  },
  REJECTED: {
    headline: "Application update",
    body: "Thank you for your interest. Unfortunately, the client has decided to move forward with another candidate for this position.",
    badge: "#6b7280",
  },
  HIRED: {
    headline: "Congratulations — you're hired!",
    body: "Excellent news! The client has selected you for this job. A contract will be created shortly with the full details.",
    badge: "#15803d",
  },
};

export async function sendApplicationStatusEmail(opts: {
  toEmail: string;
  freelancerName?: string;
  jobTitle: string;
  status: "SHORTLISTED" | "REJECTED" | "HIRED";
}): Promise<void> {
  const appUrl = getAppUrl();
  const dashboardUrl = `${appUrl}/dashboard/freelancer/applications`;
  const copy = STATUS_COPY[opts.status];

  const html = emailLayout(`
    <div style="display:inline-block;padding:4px 12px;background-color:${copy.badge};color:#ffffff;border-radius:4px;font-size:12px;font-weight:600;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.5px;">${opts.status}</div>
    ${h1(copy.headline)}
    ${p(`Regarding your application for: <strong>${opts.jobTitle}</strong>`)}
    ${p(copy.body)}
    ${primaryButton("View my applications", dashboardUrl)}
  `);

  const text = [
    copy.headline,
    "",
    `Regarding your application for: ${opts.jobTitle}`,
    copy.body,
    "",
    `View your applications: ${dashboardUrl}`,
  ].join("\n");

  await sendEmail({
    to: { email: opts.toEmail, name: opts.freelancerName },
    subject: copy.headline,
    htmlContent: html,
    textContent: text,
  });
}

// ---------------------------------------------------------------------------
// Contract created — notify freelancer
// ---------------------------------------------------------------------------

export async function sendContractCreatedEmail(opts: {
  toEmail: string;
  freelancerName?: string;
  jobTitle: string;
  contractId: string;
  amount: number;
  description?: string;
}): Promise<void> {
  const appUrl = getAppUrl();
  const contractUrl = `${appUrl}/dashboard/freelancer/contracts/${opts.contractId}`;

  const html = emailLayout(`
    ${h1("A new contract has been created for you")}
    ${p(`Your client has created a contract for the job <strong>${opts.jobTitle}</strong>.`)}
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:14px;width:140px;">Contract amount:</td>
        <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;">$${opts.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
      ${opts.description ? `
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:14px;vertical-align:top;">Description:</td>
        <td style="padding:8px 0;color:#111827;font-size:14px;">${opts.description}</td>
      </tr>` : ""}
    </table>
    ${p("Please review the contract details and accept it to begin work.")}
    ${primaryButton("Review contract", contractUrl)}
  `);

  const text = [
    "A new contract has been created for you",
    "",
    `Job: ${opts.jobTitle}`,
    `Amount: $${opts.amount.toFixed(2)}`,
    opts.description ? `Description: ${opts.description}` : "",
    "",
    `Review your contract: ${contractUrl}`,
  ].filter((line) => line !== undefined).join("\n");

  await sendEmail({
    to: { email: opts.toEmail, name: opts.freelancerName },
    subject: `New contract for "${opts.jobTitle}"`,
    htmlContent: html,
    textContent: text,
  });
}

// ---------------------------------------------------------------------------
// Payment received — notify freelancer
// ---------------------------------------------------------------------------

export async function sendPaymentReceivedEmail(opts: {
  toEmail: string;
  freelancerName?: string;
  jobTitle: string;
  contractId: string;
  amount: number;
  platformFee: number;
}): Promise<void> {
  const appUrl = getAppUrl();
  const contractUrl = `${appUrl}/dashboard/freelancer/contracts/${opts.contractId}`;
  const netAmount = opts.amount - opts.platformFee;

  const html = emailLayout(`
    ${h1("Payment received")}
    ${p(`Your client has funded the contract for <strong>${opts.jobTitle}</strong>.`)}
    <table style="width:100%;border-collapse:collapse;margin:16px 0;background-color:#f9fafb;border-radius:6px;">
      <tr>
        <td style="padding:12px 16px;color:#6b7280;font-size:14px;width:180px;">Contract amount:</td>
        <td style="padding:12px 16px;color:#111827;font-size:14px;">$${opts.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#6b7280;font-size:14px;">Platform fee (10%):</td>
        <td style="padding:12px 16px;color:#111827;font-size:14px;">−$${opts.platformFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
      <tr style="border-top:1px solid #e5e7eb;">
        <td style="padding:12px 16px;color:#111827;font-size:15px;font-weight:700;">You will receive:</td>
        <td style="padding:12px 16px;color:#15803d;font-size:15px;font-weight:700;">$${netAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    </table>
    ${p("The funds are held in escrow. Complete the work and submit it to release payment.")}
    ${primaryButton("View contract", contractUrl)}
  `);

  const text = [
    "Payment received",
    "",
    `Your client has funded the contract for: ${opts.jobTitle}`,
    `Contract amount: $${opts.amount.toFixed(2)}`,
    `Platform fee (10%): -$${opts.platformFee.toFixed(2)}`,
    `You will receive: $${netAmount.toFixed(2)}`,
    "",
    "The funds are held in escrow. Complete the work and submit it to release payment.",
    "",
    `View your contract: ${contractUrl}`,
  ].join("\n");

  await sendEmail({
    to: { email: opts.toEmail, name: opts.freelancerName },
    subject: `Payment received for "${opts.jobTitle}"`,
    htmlContent: html,
    textContent: text,
  });
}

// ---------------------------------------------------------------------------
// Review received — notify freelancer
// ---------------------------------------------------------------------------

function renderStars(rating: number): string {
  const filled = "★".repeat(rating);
  const empty = "☆".repeat(5 - rating);
  return `<span style="color:#f59e0b;font-size:20px;">${filled}</span><span style="color:#d1d5db;font-size:20px;">${empty}</span>`;
}

export async function sendReviewReceivedEmail(opts: {
  toEmail: string;
  freelancerName?: string;
  jobTitle: string;
  reviewerEmail: string;
  reviewerCompany?: string | null;
  rating: number;
  comment?: string | null;
}): Promise<void> {
  const appUrl = getAppUrl();
  const profileUrl = `${appUrl}/dashboard/freelancer/profile`;
  const reviewerDisplay = opts.reviewerCompany
    ? `${opts.reviewerCompany} (${opts.reviewerEmail})`
    : opts.reviewerEmail;

  const html = emailLayout(`
    ${h1("You received a new review")}
    ${p(`<strong>${reviewerDisplay}</strong> has left a review for your work on <strong>${opts.jobTitle}</strong>.`)}
    <div style="margin:20px 0;padding:20px;background-color:#f9fafb;border-radius:6px;border-left:4px solid #0f172a;">
      <div style="margin-bottom:8px;">${renderStars(opts.rating)}</div>
      ${opts.comment ? `<p style="margin:0;color:#374151;font-size:15px;font-style:italic;line-height:1.6;">&ldquo;${opts.comment}&rdquo;</p>` : ""}
    </div>
    ${p("Reviews help build your reputation on LetsWork. Keep up the great work!")}
    ${primaryButton("View your profile", profileUrl)}
  `);

  const stars = "★".repeat(opts.rating) + "☆".repeat(5 - opts.rating);

  const text = [
    "You received a new review",
    "",
    `${reviewerDisplay} has left a review for your work on: ${opts.jobTitle}`,
    `Rating: ${stars} (${opts.rating}/5)`,
    opts.comment ? `"${opts.comment}"` : "",
    "",
    `View your profile: ${profileUrl}`,
  ].filter(Boolean).join("\n");

  await sendEmail({
    to: { email: opts.toEmail, name: opts.freelancerName },
    subject: `You received a ${opts.rating}-star review`,
    htmlContent: html,
    textContent: text,
  });
}
