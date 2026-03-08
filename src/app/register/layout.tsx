import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your free LetsWork account. Join as a freelancer to find work, or as a client to hire vetted talent for your projects.",
  openGraph: {
    title: "Join LetsWork — Create Your Free Account",
    description: "Sign up as a freelancer or client. Start finding work or hiring top talent today.",
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
