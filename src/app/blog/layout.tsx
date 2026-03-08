import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tips, insights, and trends for freelancers and clients. Learn about remote work, freelance careers, hiring strategies, and growing your business on LetsWork.",
  openGraph: {
    title: "LetsWork Blog — Freelance Tips & Industry Insights",
    description: "Expert advice on freelancing, hiring, remote work, and growing your career or business.",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
