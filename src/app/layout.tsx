import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ChatWidget } from "@/components/chat-widget";
import { PostHogProvider } from "@/components/posthog-provider";
import { GoogleAnalytics, GoogleTagManager, GoogleTagManagerNoscript } from "@/components/analytics";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { auth } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tryletswork.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LetsWork — Hire Top Freelancers & Find Freelance Work",
    template: "%s | LetsWork",
  },
  description:
    "Connect with vetted freelancers or find your next great project. LetsWork is the premier platform for quality freelance work — secure payments, fast matching, and milestone-based contracts.",
  keywords: [
    "freelance",
    "freelancers",
    "hire freelancers",
    "freelance jobs",
    "remote work",
    "freelance platform",
    "web development",
    "graphic design",
    "freelance marketplace",
    "top freelancers",
  ],
  authors: [{ name: "LetsWork" }],
  creator: "LetsWork",
  publisher: "LetsWork",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "LetsWork",
    title: "LetsWork — Hire Top Freelancers & Find Freelance Work",
    description:
      "Connect with vetted freelancers or find your next great project. Secure payments, fast matching, and milestone-based contracts.",
    url: SITE_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LetsWork — The Premier Freelance Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LetsWork — Hire Top Freelancers & Find Freelance Work",
    description:
      "Connect with vetted freelancers or find your next great project. Secure payments, fast matching, and milestone-based contracts.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <GoogleAnalytics />
        <GoogleTagManager />
      </head>
      <body className="flex min-h-screen flex-col bg-cream font-sans antialiased">
        <GoogleTagManagerNoscript />
        <PostHogProvider session={session}>
          <a href="#main-content" className="skip-to-main">
            Skip to main content
          </a>
          <Navbar session={session} />
          <main className="flex-1" id="main-content">{children}</main>
          <Footer />
          <ToastProvider />
          <ChatWidget userRole={session?.user?.role ?? null} />
        </PostHogProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
