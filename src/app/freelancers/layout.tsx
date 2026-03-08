import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Freelancers — Hire Vetted Talent",
  description:
    "Browse top-rated freelancers across web development, design, writing, marketing, and more. View profiles, ratings, and portfolios to find the perfect match for your project.",
  openGraph: {
    title: "Find Top Freelancers on LetsWork",
    description: "Hire vetted freelancers with verified ratings, portfolios, and proven track records.",
  },
};

export default function FreelancersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
