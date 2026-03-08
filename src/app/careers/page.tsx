import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, MapPin, Clock, Briefcase, Globe, Heart, Zap, Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the LetsWork team. Explore open positions and help us shape the future of freelance work.",
};

const perks = [
  { icon: Globe, title: "Fully Remote", description: "Work from anywhere in the world. We're a remote-first team across 12+ countries." },
  { icon: Clock, title: "Flexible Hours", description: "We care about results, not when you clock in. Set a schedule that works for you." },
  { icon: Heart, title: "Health & Wellness", description: "Comprehensive health insurance, mental health support, and wellness stipend." },
  { icon: Zap, title: "Growth Budget", description: "$2,000 annual learning budget for courses, conferences, and books." },
  { icon: Coffee, title: "Home Office Setup", description: "$1,500 stipend to create your ideal workspace at home." },
  { icon: Briefcase, title: "Equity Options", description: "All full-time team members receive stock options — we grow together." },
];

const openings = [
  {
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Build and scale the core platform using Next.js, TypeScript, and PostgreSQL. You'll own features end-to-end.",
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    description: "Design intuitive experiences for clients and freelancers. From user research to high-fidelity prototypes.",
  },
  {
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Manage our cloud infrastructure, CI/CD pipelines, and ensure 99.9% uptime for the platform.",
  },
  {
    title: "Customer Success Manager",
    department: "Operations",
    location: "Remote",
    type: "Full-time",
    description: "Help our enterprise clients get the most out of LetsWork. Be the voice of the customer internally.",
  },
  {
    title: "Content Marketing Lead",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    description: "Own our content strategy — blog, email, social, and SEO. Tell the LetsWork story to the world.",
  },
  {
    title: "Data Analyst",
    department: "Product",
    location: "Remote",
    type: "Contract",
    description: "Turn platform data into actionable insights. Help us understand user behavior and optimize the marketplace.",
  },
];

function getDeptColor(dept: string) {
  switch (dept) {
    case "Engineering": return "bg-blue-50 text-blue-700";
    case "Design": return "bg-violet-50 text-violet-700";
    case "Operations": return "bg-emerald-50 text-emerald-700";
    case "Marketing": return "bg-rose-50 text-rose-700";
    case "Product": return "bg-amber-50 text-amber-700";
    default: return "bg-gray-50 text-gray-700";
  }
}

export default function CareersPage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Build the future of work{" "}
            <span className="bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent">
              with us
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-white/60 leading-relaxed">
            We&apos;re a small, ambitious team on a mission to make freelancing better for everyone.
            Come help us get there.
          </p>
          <div className="mt-8">
            <a href="#openings">
              <Button size="lg" className="bg-white text-brand-900 hover:bg-white/90">
                View Open Positions
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-[13px] font-semibold uppercase tracking-wider text-accent-600 mb-3">
                Why LetsWork
              </p>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Perks & Benefits
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {perks.map((perk, index) => (
              <ScrollReveal key={perk.title} delay={index * 0.08}>
                <div className="group flex gap-4 rounded-xl border border-gray-100 bg-white p-5 transition-all hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                    <perk.icon className="h-5 w-5 text-brand-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{perk.title}</h3>
                    <p className="mt-1 text-[13px] text-gray-500 leading-relaxed">{perk.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Open positions */}
      <section id="openings" className="py-16 sm:py-24 bg-cream scroll-mt-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-[13px] font-semibold uppercase tracking-wider text-accent-600 mb-3">
                Open Positions
              </p>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Join our team
              </h2>
              <p className="mt-3 text-gray-500">
                {openings.length} open roles — all remote-friendly
              </p>
            </div>
          </ScrollReveal>
          <div className="space-y-3">
            {openings.map((job, index) => (
              <ScrollReveal key={job.title} delay={index * 0.08}>
                <div
                  className="group rounded-xl border border-gray-100 bg-white p-6 transition-all hover:shadow-lg hover:border-gray-200 hover:-translate-y-0.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getDeptColor(job.department)}`}>
                          {job.department}
                        </span>
                        <span className="text-xs text-gray-400">{job.type}</span>
                      </div>
                      <h3 className="text-[15px] font-bold text-gray-900">{job.title}</h3>
                      <p className="mt-1.5 text-[13px] text-gray-500 leading-relaxed">{job.description}</p>
                      <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </div>
                      </div>
                    </div>
                    <a
                      href={`mailto:careers@tryletswork.com?subject=Application: ${job.title}`}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-brand-800 px-4 py-2 text-sm font-medium text-white hover:bg-brand-900 transition-colors self-start"
                    >
                      Apply
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 sm:py-20 bg-white">
        <ScrollReveal direction="scale">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">Don&apos;t see the right role?</h2>
            <p className="mt-3 text-gray-500 text-sm">
              We&apos;re always looking for talented people. Send us your resume and we&apos;ll keep you in mind.
            </p>
            <a
              href="mailto:careers@tryletswork.com?subject=General Application"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-900 transition-colors"
            >
              Send your resume
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
