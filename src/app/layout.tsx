import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ChatWidget } from "@/components/chat-widget";
import { auth } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "FreelanceHub - Hire Top Freelancers",
    template: "%s | FreelanceHub",
  },
  description:
    "Connect with top freelancers or find your next great project. FreelanceHub is the premier platform for quality freelance work.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-cream font-sans antialiased">
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        <Navbar session={session} />
        <main className="flex-1" id="main-content">{children}</main>
        <Footer />
        <ToastProvider />
        <ChatWidget userRole={session?.user?.role ?? null} />
      </body>
    </html>
  );
}
