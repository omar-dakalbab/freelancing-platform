import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the LetsWork team. We're here to help with questions about our platform, partnerships, or support.",
  openGraph: {
    title: "Contact LetsWork",
    description: "Have questions? Reach out to our team for help with the platform, partnerships, or support.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
