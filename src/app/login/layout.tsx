import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description:
    "Log in to your LetsWork account. Access your dashboard, manage projects, and connect with top freelancers or clients.",
  openGraph: {
    title: "Log In to LetsWork",
    description: "Access your LetsWork dashboard to manage projects, contracts, and payments.",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
