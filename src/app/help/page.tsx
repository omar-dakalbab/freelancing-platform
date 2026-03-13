import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen, FileText, MessageSquare, Users,
  Shield, HelpCircle, ChevronRight, Mail, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Find answers to common questions about using LetsWork. Browse guides for clients, freelancers, payments, and more.",
};

const categories = [
  {
    title: "Getting Started",
    icon: BookOpen,
    description: "Learn the basics of LetsWork",
    articles: [
      { q: "How do I create an account?", a: "Visit the registration page and choose your role — Client or Freelancer. Fill in your email and password, verify your email, and you're all set." },
      { q: "Can I switch between Client and Freelancer?", a: "Roles are set at registration and cannot be changed. If you need both, you can create a separate account with a different email." },
      { q: "How do I complete my profile?", a: "Go to Dashboard → Profile. Add your bio, skills, hourly rate (freelancers), or company details (clients). A complete profile increases your visibility." },
    ],
  },
  {
    title: "For Clients",
    icon: Users,
    description: "Hiring and managing freelancers",
    articles: [
      { q: "How do I post a job?", a: "Go to Dashboard → Post a Job. Add a title, description, required skills, budget range, and experience level. Click Publish to make it live." },
      { q: "How do I hire a freelancer?", a: "Review applications on your job page, shortlist candidates, chat with them via Messages, then change their status to Hired to create a contract." },
      { q: "How do I arrange compensation?", a: "Connect directly with freelancers via email or WhatsApp to discuss project details and compensation. LetsWork does not process payments." },
    ],
  },
  {
    title: "For Freelancers",
    icon: FileText,
    description: "Finding work and getting paid",
    articles: [
      { q: "How do I find jobs?", a: "Browse the Jobs page and filter by skills, budget, or category. Click any job to view details and apply with a cover letter and proposed rate." },
      { q: "How do contracts work?", a: "When hired, a contract is created. Accept it to begin work and use it to track your deliverables and project status." },
      { q: "How do I arrange payment?", a: "Connect directly with your client via email or WhatsApp to discuss and arrange compensation. LetsWork does not process payments." },
    ],
  },
  {
    title: "Contact & Communication",
    icon: MessageSquare,
    description: "Connecting directly with clients and freelancers",
    articles: [
      { q: "How do I contact a freelancer outside the platform?", a: "Once connected through a job application, you can exchange contact details and reach each other via email or WhatsApp to discuss project specifics and compensation." },
      { q: "Does LetsWork charge any fees?", a: "LetsWork is free to use. The platform does not process payments or charge service fees. All compensation is arranged directly between clients and freelancers." },
      { q: "How do clients and freelancers agree on compensation?", a: "Connect directly with freelancers via email or WhatsApp to discuss project details and compensation. LetsWork facilitates the introduction and contract tracking." },
    ],
  },
  {
    title: "Messages & Communication",
    icon: MessageSquare,
    description: "Chatting with clients and freelancers",
    articles: [
      { q: "How do I message someone?", a: "Conversations are created automatically when a client shortlists an applicant. Go to Dashboard → Messages to view and respond to conversations." },
      { q: "Can I message anyone on the platform?", a: "Messaging is tied to job applications. You can only message people you have an active application relationship with." },
      { q: "Are messages delivered in real time?", a: "Messages are refreshed every few seconds so you'll see new messages quickly. Use Enter to send and Shift+Enter for a new line." },
    ],
  },
  {
    title: "Account & Security",
    icon: Shield,
    description: "Managing your account safely",
    articles: [
      { q: "How do I reset my password?", a: "Click 'Forgot Password' on the login page. Enter your email and we'll send a reset link that expires in 1 hour." },
      { q: "Why is my account suspended?", a: "Accounts may be suspended for violating our Terms of Service. Contact support if you believe this was done in error." },
      { q: "How do I delete my account?", a: "Contact our support team at omardakelbab.dev@gmail.com to request account deletion. Active contracts must be completed or cancelled first." },
    ],
  },
];

export default function HelpCenterPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 py-16 sm:py-24">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-accent-600/10 blur-3xl" />
          <div className="animate-float absolute top-20 left-[15%] h-24 w-24 rounded-full bg-accent-500/10 blur-2xl" />
          <div className="animate-float-delay absolute bottom-10 right-[20%] h-32 w-32 rounded-full bg-brand-400/10 blur-2xl" />
          <div className="animate-float absolute top-1/2 right-[10%] h-16 w-16 rounded-full bg-accent-400/15 blur-xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <HelpCircle className="mx-auto h-10 w-10 text-accent-400 mb-4" />
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Help Center
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/60 leading-relaxed">
            Find answers to your questions and learn how to get the most out of LetsWork.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {categories.map((category, index) => (
              <ScrollReveal key={category.title} delay={index * 0.1 * 1000}>
                <div>
                  <div className="flex items-center gap-3 mb-6 group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                      <category.icon className="h-5 w-5 text-brand-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-1">
                    {category.articles.map((article) => (
                      <details
                        key={article.q}
                        className="group rounded-xl border border-gray-100 bg-white transition-all hover:border-accent-200 hover:shadow-md"
                      >
                        <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
                          {article.q}
                          <ChevronRight className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-90 shrink-0 ml-4" />
                        </summary>
                        <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">
                          {article.a}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <ScrollReveal>
        <section className="py-16 sm:py-20 bg-cream">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
            <Mail className="animate-float mx-auto h-8 w-8 text-brand-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Still need help?</h2>
            <p className="mt-3 text-gray-500">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help.
            </p>
            <Link href="/contact" className="mt-6 inline-block">
              <Button size="lg">
                Contact Support
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
