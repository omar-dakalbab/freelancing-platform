import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield, Eye, AlertTriangle, UserCheck, Phone,
  MessageSquare, ArrowRight, CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "Trust & Safety",
  description: "Learn how LetsWork keeps the platform safe, secure, and fair for all users.",
};

const pillars = [
  {
    icon: Phone,
    title: "Direct Communication",
    description: "LetsWork facilitates direct connections between clients and freelancers. Once connected, you can take conversations off-platform via email or WhatsApp to discuss project details and compensation.",
    points: [
      "Connect via email or WhatsApp",
      "Agree on terms directly with your counterpart",
      "No platform fees or payment processing",
    ],
  },
  {
    icon: UserCheck,
    title: "Verified Profiles",
    description: "We encourage profile completion and verified reviews to help you make informed decisions about who you work with.",
    points: [
      "Email verification required",
      "Review system tied to completed contracts",
      "Profile completion scoring",
    ],
  },
  {
    icon: Eye,
    title: "Platform Moderation",
    description: "Our team actively monitors the platform to detect and remove bad actors, spam, and fraudulent activity.",
    points: [
      "Proactive content moderation",
      "Automated fraud detection",
      "24/7 monitoring for suspicious activity",
    ],
  },
  {
    icon: MessageSquare,
    title: "Safe Communication",
    description: "All messaging happens on-platform so conversations are documented. This protects both parties in case of disputes.",
    points: [
      "On-platform messaging only",
      "Conversation history preserved",
      "Report inappropriate messages",
    ],
  },
];

const reportReasons = [
  "Fraudulent job postings or fake profiles",
  "Harassment, threats, or abusive language",
  "Spam or misleading content",
  "Intellectual property violations",
  "Any behavior that violates our Terms of Service",
];

export default function TrustPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 py-20 sm:py-28">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-accent-600/10 blur-3xl" />
          <div className="absolute top-20 left-20 h-3 w-3 rounded-full bg-accent-400/30 animate-float" />
          <div className="absolute top-40 right-32 h-2 w-2 rounded-full bg-accent-300/20 animate-float-delay" />
          <div className="absolute bottom-20 left-1/3 h-2.5 w-2.5 rounded-full bg-accent-400/20 animate-float" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Shield className="mx-auto h-10 w-10 text-accent-400 mb-4" />
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Trust & Safety
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/60 leading-relaxed">
            Your safety is our top priority. Learn how we protect our community and keep LetsWork a trusted platform.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-[13px] font-semibold uppercase tracking-wider text-accent-600 mb-3">
                How We Protect You
              </p>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Built-in safety at every step
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid gap-8 lg:grid-cols-2">
            {pillars.map((pillar, index) => (
              <ScrollReveal key={pillar.title} delay={index * 0.1}>
                <div className="group rounded-xl border border-gray-100 bg-white p-7 transition-all hover:shadow-lg hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                      <pillar.icon className="h-5 w-5 text-brand-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{pillar.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{pillar.description}</p>
                  <ul className="space-y-2">
                    {pillar.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Reporting */}
      <section className="py-16 sm:py-24 bg-cream">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="scale">
            <div className="rounded-2xl border border-gray-100 bg-white p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                <h2 className="text-xl font-bold text-gray-900">Report an Issue</h2>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                If you encounter any of the following, please report it immediately. Our team reviews all reports within 24 hours.
              </p>
              <ul className="space-y-3 mb-8">
                {reportReasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-300 shrink-0" />
                    {reason}
                  </li>
                ))}
              </ul>
              <Link href="/contact">
                <Button size="lg">
                  Report an Issue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Tips */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">Stay Safe on LetsWork</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { tip: "Never share login credentials", detail: "LetsWork will never ask for your password via email or chat." },
                { tip: "Verify before you commit", detail: "Check reviews, portfolio, and profile completion before hiring or accepting a contract." },
                { tip: "Review profiles carefully", detail: "Take time to evaluate a freelancer's or client's track record and reviews." },
                { tip: "Document everything", detail: "Use on-platform messaging and direct communication to keep a clear record of project discussions." },
              ].map((item) => (
                <div key={item.tip} className="rounded-xl border border-gray-100 bg-cream p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-accent-200">
                  <p className="text-sm font-semibold text-gray-900">{item.tip}</p>
                  <p className="mt-1 text-[13px] text-gray-500 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
