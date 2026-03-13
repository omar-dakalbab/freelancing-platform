/**
 * Email service using Brevo (formerly Sendinblue) transactional email API.
 *
 * All send functions should be awaited inside a try/catch so they complete
 * before the serverless function exits. Email failures are logged but should
 * not break the caller's main flow.
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
    email: process.env.BREVO_SENDER_EMAIL ?? "no-reply@tryletswork.com",
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

async function sendEmail(opts: SendEmailOptions): Promise<void> {
  const sender = getSender();
  console.log("[Brevo] Sending email", {
    to: opts.to.email,
    subject: opts.subject,
    sender: sender.email,
    hasApiKey: !!process.env.BREVO_API_KEY,
    apiKeyPrefix: process.env.BREVO_API_KEY?.slice(0, 8) ?? "NOT_SET",
  });

  try {
    const client = getBrevoClient();
    const response = await client.transactionalEmails.sendTransacEmail({
      sender,
      to: [{ email: opts.to.email, name: opts.to.name }],
      subject: opts.subject,
      htmlContent: opts.htmlContent,
      textContent: opts.textContent,
    });
    console.log("[Brevo] Email sent successfully", {
      to: opts.to.email,
      subject: opts.subject,
      response: JSON.stringify(response),
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errBody =
      error && typeof error === "object" && "body" in error
        ? JSON.stringify((error as Record<string, unknown>).body)
        : undefined;
    console.error("[Brevo] Failed to send email", {
      to: opts.to.email,
      subject: opts.subject,
      error: errMsg,
      responseBody: errBody,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Brand constants
// ---------------------------------------------------------------------------

const BRAND = {
  dark: "#0f172a",
  primary: "#2563eb",
  primaryDark: "#1d4ed8",
  green: "#059669",
  greenLight: "#ecfdf5",
  greenBorder: "#a7f3d0",
  amber: "#d97706",
  amberLight: "#fffbeb",
  amberBorder: "#fde68a",
  red: "#dc2626",
  redLight: "#fef2f2",
  redBorder: "#fecaca",
  blue: "#2563eb",
  blueLight: "#eff6ff",
  blueBorder: "#bfdbfe",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray700: "#374151",
  gray900: "#111827",
  bg: "#f1f5f9",
  white: "#ffffff",
  radius: "12px",
  radiusSm: "8px",
};

// ---------------------------------------------------------------------------
// HTML layout helper — wraps content in a branded shell
// ---------------------------------------------------------------------------

function emailLayout(bodyContent: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LetsWork</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>` : ""}
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${BRAND.bg};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:0 0 32px 0;">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="background-color:${BRAND.dark};padding:10px 20px;border-radius:10px;">
                    <span style="color:${BRAND.white};font-size:20px;font-weight:700;letter-spacing:-0.5px;text-decoration:none;">LetsWork</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background-color:${BRAND.white};padding:40px 40px 32px;border-radius:${BRAND.radius};box-shadow:0 1px 3px rgba(0,0,0,0.08);">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:32px 20px 0;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <a href="${getAppUrl()}" style="color:${BRAND.gray500};font-size:12px;text-decoration:none;margin:0 8px;">Website</a>
                    <span style="color:${BRAND.gray400};">&middot;</span>
                    <a href="${getAppUrl()}/help" style="color:${BRAND.gray500};font-size:12px;text-decoration:none;margin:0 8px;">Help Center</a>
                    <span style="color:${BRAND.gray400};">&middot;</span>
                    <a href="${getAppUrl()}/terms" style="color:${BRAND.gray500};font-size:12px;text-decoration:none;margin:0 8px;">Terms</a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin:0;color:${BRAND.gray400};font-size:12px;line-height:1.5;">
                      &copy; ${new Date().getFullYear()} LetsWork. All rights reserved.
                    </p>
                    <p style="margin:6px 0 0;color:${BRAND.gray400};font-size:11px;line-height:1.5;">
                      You received this email because of activity on your LetsWork account.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Reusable HTML components
// ---------------------------------------------------------------------------

function primaryButton(label: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:24px;margin-bottom:8px;">
  <tr>
    <td style="background-color:${BRAND.dark};border-radius:${BRAND.radiusSm};text-align:center;">
      <a href="${url}" style="display:inline-block;padding:14px 28px;color:${BRAND.white};text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.2px;">${label}</a>
    </td>
  </tr>
</table>`;
}

function secondaryButton(label: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:16px;">
  <tr>
    <td style="border:1px solid ${BRAND.gray200};border-radius:${BRAND.radiusSm};text-align:center;">
      <a href="${url}" style="display:inline-block;padding:12px 24px;color:${BRAND.gray700};text-decoration:none;font-size:13px;font-weight:600;">${label}</a>
    </td>
  </tr>
</table>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 6px;font-size:24px;font-weight:700;color:${BRAND.gray900};line-height:1.3;">${text}</h1>`;
}

function subheading(text: string): string {
  return `<p style="margin:0 0 24px;color:${BRAND.gray500};font-size:15px;line-height:1.5;">${text}</p>`;
}

function p(text: string): string {
  return `<p style="margin:16px 0;color:${BRAND.gray700};font-size:15px;line-height:1.7;">${text}</p>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid ${BRAND.gray100};margin:28px 0;" />`;
}

function infoCard(bgColor: string, borderColor: string, content: string): string {
  return `<div style="margin:20px 0;padding:20px;background-color:${bgColor};border:1px solid ${borderColor};border-radius:${BRAND.radiusSm};">
  ${content}
</div>`;
}

function keyValue(label: string, value: string): string {
  return `<tr>
  <td style="padding:10px 16px;color:${BRAND.gray500};font-size:13px;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;width:140px;vertical-align:top;">${label}</td>
  <td style="padding:10px 16px;color:${BRAND.gray900};font-size:15px;font-weight:500;">${value}</td>
</tr>`;
}

function dataTable(rows: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0;background-color:${BRAND.gray50};border-radius:${BRAND.radiusSm};border:1px solid ${BRAND.gray100};">
  ${rows}
</table>`;
}

function badge(text: string, bgColor: string, textColor: string = BRAND.white): string {
  return `<span style="display:inline-block;padding:4px 12px;background-color:${bgColor};color:${textColor};border-radius:20px;font-size:12px;font-weight:600;letter-spacing:0.3px;text-transform:uppercase;">${text}</span>`;
}

function muted(text: string): string {
  return `<p style="margin:16px 0 0;color:${BRAND.gray400};font-size:13px;line-height:1.6;">${text}</p>`;
}

function formatUSD(amount: number): string {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  const supportEmail = process.env.BREVO_SENDER_EMAIL ?? "no-reply@tryletswork.com";

  const html = emailLayout(`
    ${heading("New contact form message")}
    ${subheading(`From ${opts.name}`)}
    ${dataTable(`
      ${keyValue("From", `${opts.name} &lt;${opts.email}&gt;`)}
      ${keyValue("Subject", opts.subject)}
    `)}
    ${infoCard(BRAND.gray50, BRAND.gray200, `
      <p style="margin:0;color:${BRAND.gray700};font-size:14px;line-height:1.7;white-space:pre-wrap;">${opts.message}</p>
    `)}
    ${p(`Reply directly to <a href="mailto:${opts.email}" style="color:${BRAND.primary};text-decoration:none;font-weight:500;">${opts.email}</a> to respond.`)}
  `, `New message from ${opts.name}: ${opts.subject}`);

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
    <div style="text-align:center;">
      <div style="display:inline-block;width:64px;height:64px;line-height:64px;text-align:center;background-color:${BRAND.blueLight};border-radius:50%;margin-bottom:24px;">
        <span style="font-size:28px;">&#9993;</span>
      </div>
      ${heading("Verify your email address")}
      ${subheading("One quick step to get started")}
    </div>
    ${p("Thanks for signing up for LetsWork! Please verify your email to activate your account.")}
    ${p("Click the button below to verify. This link expires in <strong>24 hours</strong>.")}
    <div style="text-align:center;">
      ${primaryButton("Verify My Email", verifyUrl)}
    </div>
    ${divider()}
    ${muted("If you didn't create a LetsWork account, you can safely ignore this email.")}
    ${muted(`Or copy this URL into your browser: <a href="${verifyUrl}" style="color:${BRAND.primary};word-break:break-all;text-decoration:none;">${verifyUrl}</a>`)}
  `, "Please verify your email address to get started on LetsWork.");

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

  const tips = role === "CLIENT"
    ? [
        ["&#128221;", "Post your first job", "Describe what you need and set a budget to attract top talent."],
        ["&#128269;", "Review proposals", "Browse freelancer applications and shortlist the best fits."],
        ["&#129309;", "Hire with confidence", "Create contracts with secure milestone payments."],
      ]
    : [
        ["&#128100;", "Complete your profile", "Add your skills, bio, and portfolio to stand out."],
        ["&#128270;", "Browse open jobs", "Find projects that match your expertise."],
        ["&#128172;", "Submit proposals", "Write compelling proposals with competitive bids."],
      ];

  const tipsHtml = tips.map(([icon, title, desc]) => `
    <tr>
      <td style="padding:12px 0;vertical-align:top;width:40px;">
        <span style="font-size:20px;">${icon}</span>
      </td>
      <td style="padding:12px 0;padding-left:12px;">
        <p style="margin:0;font-size:14px;font-weight:600;color:${BRAND.gray900};">${title}</p>
        <p style="margin:4px 0 0;font-size:13px;color:${BRAND.gray500};line-height:1.5;">${desc}</p>
      </td>
    </tr>
  `).join("");

  const html = emailLayout(`
    <div style="text-align:center;">
      <div style="display:inline-block;width:64px;height:64px;line-height:64px;text-align:center;background-color:${BRAND.greenLight};border-radius:50%;margin-bottom:24px;">
        <span style="font-size:28px;">&#127881;</span>
      </div>
      ${heading("Welcome to LetsWork!")}
      ${subheading(`You're all set as a ${roleLabel}`)}
    </div>
    ${p(`Your account is ready. Here's how to get started:`)}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0;">
      ${tipsHtml}
    </table>
    <div style="text-align:center;">
      ${primaryButton("Go to Dashboard", `${appUrl}${dashboardPath}`)}
    </div>
    ${divider()}
    ${muted("Have questions? Just reply to this email — we're happy to help.")}
  `, `Welcome to LetsWork! Your ${roleLabel} account is ready.`);

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
    <div style="text-align:center;">
      <div style="display:inline-block;width:64px;height:64px;line-height:64px;text-align:center;background-color:${BRAND.amberLight};border-radius:50%;margin-bottom:24px;">
        <span style="font-size:28px;">&#128274;</span>
      </div>
      ${heading("Reset your password")}
      ${subheading("We received a request to reset your password")}
    </div>
    ${p("Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.")}
    <div style="text-align:center;">
      ${primaryButton("Reset Password", resetUrl)}
    </div>
    ${divider()}
    ${muted("If you didn't request a password reset, you can safely ignore this email — your password will not change.")}
    ${muted(`Or copy this URL into your browser: <a href="${resetUrl}" style="color:${BRAND.primary};word-break:break-all;text-decoration:none;">${resetUrl}</a>`)}
  `, "Reset your LetsWork password. This link expires in 1 hour.");

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
    ${badge("New Application", BRAND.primary)}
    <div style="margin-top:16px;">
      ${heading("New application received")}
      ${subheading(`For: ${opts.jobTitle}`)}
    </div>
    ${dataTable(`
      ${keyValue("Applicant", opts.freelancerEmail)}
      ${keyValue("Proposed Bid", `<span style="font-size:18px;font-weight:700;color:${BRAND.gray900};">${formatUSD(opts.bidAmount)}</span>`)}
    `)}
    ${p("Review the application and respond to the freelancer from your dashboard.")}
    ${primaryButton("View Application", jobUrl)}
  `, `New application for "${opts.jobTitle}" — ${formatUSD(opts.bidAmount)}`);

  const text = [
    "New application received",
    "",
    `A freelancer has applied to your job: ${opts.jobTitle}`,
    `Applicant: ${opts.freelancerEmail}`,
    `Proposed bid: ${formatUSD(opts.bidAmount)}`,
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

const STATUS_STYLES: Record<
  "SHORTLISTED" | "REJECTED" | "HIRED",
  { headline: string; body: string; badgeColor: string; icon: string; iconBg: string }
> = {
  SHORTLISTED: {
    headline: "You've been shortlisted!",
    body: "Great news — the client has shortlisted your application. They may reach out to discuss next steps.",
    badgeColor: BRAND.primary,
    icon: "&#11088;",
    iconBg: BRAND.blueLight,
  },
  REJECTED: {
    headline: "Application update",
    body: "Thank you for your interest. Unfortunately, the client has decided to move forward with another candidate for this position.",
    badgeColor: BRAND.gray500,
    icon: "&#128172;",
    iconBg: BRAND.gray100,
  },
  HIRED: {
    headline: "Congratulations — you're hired!",
    body: "Excellent news! The client has selected you for this job. A contract will be created shortly with the full details.",
    badgeColor: BRAND.green,
    icon: "&#127881;",
    iconBg: BRAND.greenLight,
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
  const style = STATUS_STYLES[opts.status];

  const html = emailLayout(`
    <div style="text-align:center;">
      <div style="display:inline-block;width:64px;height:64px;line-height:64px;text-align:center;background-color:${style.iconBg};border-radius:50%;margin-bottom:24px;">
        <span style="font-size:28px;">${style.icon}</span>
      </div>
      <div style="margin-bottom:16px;">${badge(opts.status, style.badgeColor)}</div>
      ${heading(style.headline)}
      ${subheading(opts.jobTitle)}
    </div>
    ${p(style.body)}
    <div style="text-align:center;">
      ${primaryButton("View My Applications", dashboardUrl)}
    </div>
  `, `${style.headline} — ${opts.jobTitle}`);

  const text = [
    style.headline,
    "",
    `Regarding your application for: ${opts.jobTitle}`,
    style.body,
    "",
    `View your applications: ${dashboardUrl}`,
  ].join("\n");

  await sendEmail({
    to: { email: opts.toEmail, name: opts.freelancerName },
    subject: style.headline,
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

  const descRow = opts.description
    ? keyValue("Description", opts.description)
    : "";

  const html = emailLayout(`
    ${badge("New Contract", BRAND.primary)}
    <div style="margin-top:16px;">
      ${heading("A new contract is ready")}
      ${subheading(opts.jobTitle)}
    </div>
    ${dataTable(`
      ${keyValue("Job", opts.jobTitle)}
      ${keyValue("Amount", `<span style="font-size:20px;font-weight:700;color:${BRAND.gray900};">${formatUSD(opts.amount)}</span>`)}
      ${descRow}
    `)}
    ${p("Please review the contract details and accept it to begin work.")}
    ${primaryButton("Review Contract", contractUrl)}
  `, `New contract for "${opts.jobTitle}" — ${formatUSD(opts.amount)}`);

  const text = [
    "A new contract has been created for you",
    "",
    `Job: ${opts.jobTitle}`,
    `Amount: ${formatUSD(opts.amount)}`,
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
// Contract confirmed — notify freelancer
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

  const html = emailLayout(`
    <div style="text-align:center;">
      <div style="display:inline-block;width:64px;height:64px;line-height:64px;text-align:center;background-color:${BRAND.greenLight};border-radius:50%;margin-bottom:24px;">
        <span style="font-size:28px;">&#128176;</span>
      </div>
      ${heading("Contract confirmed!")}
      ${subheading(opts.jobTitle)}
    </div>
    ${p("Your contract has been confirmed. You can now begin working on this project.")}
    ${p("Reach out to the client directly via the contact details on the contract to discuss next steps, timeline, and any outstanding details.")}
    <div style="text-align:center;">
      ${primaryButton("View Contract", contractUrl)}
    </div>
  `, `Contract confirmed for "${opts.jobTitle}"`);

  const text = [
    "Contract confirmed",
    "",
    `Your contract for "${opts.jobTitle}" has been confirmed.`,
    "You can now begin working on this project.",
    "Reach out to the client directly to discuss next steps and timeline.",
    "",
    `View your contract: ${contractUrl}`,
  ].join("\n");

  await sendEmail({
    to: { email: opts.toEmail, name: opts.freelancerName },
    subject: `Contract confirmed for "${opts.jobTitle}"`,
    htmlContent: html,
    textContent: text,
  });
}

// ---------------------------------------------------------------------------
// Review received — notify freelancer
// ---------------------------------------------------------------------------

function renderStars(rating: number): string {
  return Array.from({ length: 5 }, (_, i) =>
    i < rating
      ? `<span style="color:#f59e0b;font-size:22px;">&#9733;</span>`
      : `<span style="color:${BRAND.gray200};font-size:22px;">&#9733;</span>`
  ).join("");
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
    ? `${opts.reviewerCompany}`
    : opts.reviewerEmail.split("@")[0];

  const html = emailLayout(`
    <div style="text-align:center;">
      <div style="display:inline-block;width:64px;height:64px;line-height:64px;text-align:center;background-color:${BRAND.amberLight};border-radius:50%;margin-bottom:24px;">
        <span style="font-size:28px;">&#11088;</span>
      </div>
      ${heading("You received a new review!")}
      ${subheading(`From ${reviewerDisplay} for ${opts.jobTitle}`)}
    </div>
    <div style="margin:24px 0;padding:24px;background-color:${BRAND.gray50};border:1px solid ${BRAND.gray100};border-radius:${BRAND.radiusSm};text-align:center;">
      <div style="margin-bottom:12px;">${renderStars(opts.rating)}</div>
      <p style="margin:0;color:${BRAND.gray900};font-size:16px;font-weight:600;">${opts.rating} out of 5</p>
      ${opts.comment ? `
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid ${BRAND.gray200};text-align:left;">
          <p style="margin:0;color:${BRAND.gray700};font-size:15px;font-style:italic;line-height:1.7;">&ldquo;${opts.comment}&rdquo;</p>
        </div>
      ` : ""}
    </div>
    ${p("Reviews help build your reputation on LetsWork. Keep up the great work!")}
    <div style="text-align:center;">
      ${primaryButton("View Your Profile", profileUrl)}
    </div>
  `, `${reviewerDisplay} gave you a ${opts.rating}-star review for ${opts.jobTitle}`);

  const stars = "\u2605".repeat(opts.rating) + "\u2606".repeat(5 - opts.rating);

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
