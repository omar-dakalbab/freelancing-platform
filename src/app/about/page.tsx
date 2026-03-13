import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, Users, Globe, Shield, Zap, Target, Heart, Award, MapPin, Github, Linkedin, Mail, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { MagneticButton } from "@/components/ui/magnetic-button";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about LetsWork — our mission to connect businesses with top freelance talent worldwide.",
};

const values = [
  {
    icon: Target,
    title: "Quality First",
    description: "We believe in connecting businesses with truly skilled professionals. Every interaction on our platform is designed to surface the best talent.",
  },
  {
    icon: Shield,
    title: "Trust & Transparency",
    description: "From secure escrow payments to verified reviews, we build trust into every step of the hiring and working process.",
  },
  {
    icon: Globe,
    title: "Global Access",
    description: "Talent has no borders. We empower businesses to hire from anywhere and freelancers to work from everywhere.",
  },
  {
    icon: Heart,
    title: "Community Driven",
    description: "We're building more than a marketplace. We're creating a community where professionals grow, collaborate, and thrive.",
  },
];

const stats = [
  { value: "50K+", label: "Freelancers worldwide" },
  { value: "10K+", label: "Projects completed" },
  { value: "120+", label: "Countries represented" },
  { value: "95%", label: "Client satisfaction rate" },
];

const founder = {
  name: "Omar Dakelbab",
  role: "Founder & Full-Stack Engineer",
  initials: "OD",
  bio: "Senior Full-Stack & Mobile Engineer with 4+ years of experience building and scaling production web and mobile applications. Specialized in React, Next.js, React Native, and Node.js.",
  location: "Dubai, UAE",
  links: {
    github: "https://github.com/omar-dakalbab",
    linkedin: "https://linkedin.com/in/omardakelbab",
    upwork: "https://www.upwork.com/freelancers/omardakelbab",
    email: "omardakelbab.dev@gmail.com",
  },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 py-20 sm:py-28">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-accent-600/10 blur-3xl" />
          <div className="animate-float absolute top-20 left-[15%] h-2 w-2 rounded-full bg-accent-400/30" />
          <div className="animate-float-delay absolute bottom-20 right-[25%] h-1.5 w-1.5 rounded-full bg-white/20" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Connecting talent with{" "}
            <span className="bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent">
              opportunity
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-white/60 leading-relaxed sm:text-lg">
            LetsWork was built to make hiring and working freelance simple, secure, and rewarding for everyone involved.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <ScrollReveal direction="left">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-wider text-accent-600 mb-3">
                Our Mission
              </p>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                The future of work is freelance
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We started LetsWork because we saw a gap in the market. Businesses struggled to find
                reliable freelance talent, and skilled professionals had trouble finding quality projects
                that matched their expertise.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Our platform bridges that gap with smart matching, secure payments, and tools
                that make collaboration seamless — whether you&apos;re across the hall or across the globe.
              </p>
            </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-gray-100 bg-cream p-6 text-center">
                  <p className="text-3xl font-bold text-brand-800"><AnimatedCounter value={stat.value} /></p>
                  <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-24 bg-cream">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-accent-600 mb-3">
              Our Values
            </p>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              What drives us
            </h2>
          </div>
          </ScrollReveal>
          <div className="grid gap-6 sm:grid-cols-2">
            {values.map((value, i) => (
              <ScrollReveal key={value.title} delay={i * 100}>
              <div
                className="group flex gap-4 rounded-xl border border-gray-100 bg-white p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <value.icon className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-gray-900">{value.title}</h3>
                  <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{value.description}</p>
                </div>
              </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-accent-600 mb-3">
              Meet the Founder
            </p>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Built by a developer, for developers
            </h2>
          </div>
          </ScrollReveal>
          <ScrollReveal>
          <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-cream to-white p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 text-2xl font-bold text-white shadow-lg shadow-brand-900/20 transition-transform duration-300 hover:scale-105">
                {founder.initials}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-xl font-bold text-gray-900">{founder.name}</h3>
                <p className="text-sm font-medium text-brand-700 mt-0.5">{founder.role}</p>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">{founder.location}</span>
                </div>
                <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                  {founder.bio}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-5">
                  <a
                    href={founder.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-all hover:bg-gray-900 hover:text-white"
                    aria-label="GitHub"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                  <a
                    href={founder.links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-all hover:bg-[#0A66C2] hover:text-white"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a
                    href={founder.links.upwork}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-all hover:bg-emerald-600 hover:text-white"
                    aria-label="Upwork"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a
                    href={`mailto:${founder.links.email}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-all hover:bg-brand-800 hover:text-white"
                    aria-label="Email"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800">
        <ScrollReveal>
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to join our community?
          </h2>
          <p className="mt-4 text-white/60">
            Whether you&apos;re hiring or looking for your next project, LetsWork has you covered.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <MagneticButton>
            <Link href="/register">
              <Button size="lg" className="group bg-white text-brand-900 hover:bg-white/90">
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            </MagneticButton>
            <MagneticButton>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="group bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white/30">
                Contact Us
              </Button>
            </Link>
            </MagneticButton>
          </div>
        </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
