import Link from "next/link";
import {
  ArrowRight, Users, Shield, Star, CheckCircle,
  Code, Palette, PenTool, BarChart3, Megaphone, Smartphone, Video, Calculator,
  Search, Zap, Globe, Quote, Sparkles, TrendingUp, Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AnimatedCounter,
  ScrollReveal,
  RotatingText,
  LogoMarquee,
  MagneticButton,
} from "@/components/homepage/homepage-client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const features = [
  {
    icon: Users,
    title: "Vetted talent",
    description: "Thousands of pre-screened freelancers across every discipline, ready to start today.",
    gradient: "from-blue-500/10 to-indigo-500/10",
    iconColor: "text-blue-600",
  },
  {
    icon: Shield,
    title: "Secure payments",
    description: "Escrow-protected milestones. You only pay for work you approve.",
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-600",
  },
  {
    icon: Zap,
    title: "Fast matching",
    description: "Get proposals within hours. Our platform connects you with the right talent instantly.",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-600",
  },
  {
    icon: Globe,
    title: "Global reach",
    description: "Hire from anywhere in the world. No geographic barriers, no timezone limitations.",
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-600",
  },
];

const categories = [
  { name: "Web Development", icon: Code, count: "2,400+" },
  { name: "Mobile Development", icon: Smartphone, count: "1,200+" },
  { name: "Design & Creative", icon: Palette, count: "3,100+" },
  { name: "Writing & Translation", icon: PenTool, count: "1,800+" },
  { name: "Data Science & Analytics", icon: BarChart3, count: "900+" },
  { name: "Marketing & SEO", icon: Megaphone, count: "1,500+" },
  { name: "Video & Animation", icon: Video, count: "800+" },
  { name: "Business & Finance", icon: Calculator, count: "600+" },
];

const stats = [
  { value: "50K+", label: "Freelancers", icon: Users },
  { value: "10K+", label: "Projects completed", icon: TrendingUp },
  { value: "95%", label: "Client satisfaction", icon: Star },
  { value: "48h", label: "Avg. first response", icon: Zap },
];

const testimonials = [
  {
    quote: "LetsWork helped us scale our engineering team in weeks, not months. The quality of talent is unmatched.",
    author: "Sarah Chen",
    role: "CTO, TechFlow",
    rating: 5,
  },
  {
    quote: "I went from struggling to find clients to having a consistent pipeline of high-quality projects. Game changer.",
    author: "Marcus Johnson",
    role: "Full-Stack Developer",
    rating: 5,
  },
  {
    quote: "The escrow system gives us peace of mind. We've completed over 50 projects without a single payment issue.",
    author: "Elena Rodriguez",
    role: "Product Manager, Bloom Studio",
    rating: 5,
  },
];

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LetsWork",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://tryletswork.com",
    description:
      "Connect with vetted freelancers or find your next great project. Secure payments, fast matching, and milestone-based contracts.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || "https://tryletswork.com"}/jobs?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 pb-20 pt-16 sm:pb-28 sm:pt-20 lg:pb-36 lg:pt-28">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="hero-glow absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-accent-600/15 blur-3xl" />
          <div className="hero-glow-delay absolute -bottom-20 right-0 h-[400px] w-[400px] rounded-full bg-brand-500/10 blur-3xl" />
          {/* Floating orbs */}
          <div className="animate-float absolute top-20 left-[15%] h-2 w-2 rounded-full bg-accent-400/30" />
          <div className="animate-float-delay absolute top-40 right-[20%] h-1.5 w-1.5 rounded-full bg-white/20" />
          <div className="animate-float absolute bottom-32 left-[30%] h-1 w-1 rounded-full bg-accent-300/40" />
          <div className="animate-float-delay absolute top-28 right-[35%] h-2.5 w-2.5 rounded-full bg-white/10" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-60" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge with shimmer */}
            <div className="homepage-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm relative overflow-hidden">
              <div className="animate-shimmer absolute inset-0 rounded-full" />
              <Sparkles className="h-3.5 w-3.5 text-accent-400 relative z-10" aria-hidden="true" />
              <span className="text-[13px] font-medium text-white/80 relative z-10">
                Trusted by 10,000+ businesses worldwide
              </span>
            </div>

            <h1 className="homepage-fade-in homepage-fade-in-delay-1 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.1]">
              Find the right freelancer{" "}
              <span className="bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent animate-gradient">
                for
              </span>{" "}
              <RotatingText
                words={["any project", "your startup", "your brand", "your app", "your vision"]}
                interval={3000}
                className="bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent animate-gradient"
              />
            </h1>
            <p className="homepage-fade-in homepage-fade-in-delay-2 mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
              Post your project, review proposals from top professionals, and get
              work done on time, on budget.
            </p>

            {/* Search bar */}
            <div className="homepage-fade-in homepage-fade-in-delay-3 mx-auto mt-10 max-w-xl">
              <form action="/jobs" method="GET" className="flex gap-2">
                <div className="relative flex-1 group">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-accent-400" aria-hidden="true" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Search for any skill or project..."
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/10 pl-10 pr-4 text-sm text-white placeholder:text-white/40 backdrop-blur-sm focus:ring-2 focus:ring-accent-400/50 focus:border-accent-400/50 focus:bg-white/15 focus:outline-none transition-all"
                    aria-label="Search for jobs by skill or project type"
                  />
                </div>
                <Button type="submit" size="lg" variant="primary" className="shrink-0 rounded-xl h-12">
                  Search
                </Button>
              </form>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-white/30">Popular:</span>
                {["React", "Design", "Python", "WordPress", "Video Editing"].map((tag) => (
                  <Link
                    key={tag}
                    href={`/jobs?search=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-medium text-white/60 transition-all hover:bg-white/10 hover:text-white/90 hover:border-white/20 hover:scale-105"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* CTAs with magnetic effect */}
            <div className="homepage-fade-in homepage-fade-in-delay-3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto sm:max-w-none">
              <MagneticButton>
                <Link href="/register?role=CLIENT" className="w-full sm:w-auto">
                  <Button size="xl" className="w-full sm:w-auto bg-white text-brand-900 hover:bg-white/90 active:bg-white/80 shadow-lg shadow-black/10 group">
                    Hire a freelancer
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Button>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link href="/register?role=FREELANCER" className="w-full sm:w-auto">
                  <Button size="xl" variant="outline" className="w-full sm:w-auto bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white/30">
                    Find work
                  </Button>
                </Link>
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden="true" />
      </section>

      {/* Stats — floating card overlapping hero */}
      <section className="relative z-10 -mt-10 pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xl shadow-gray-200/50 sm:p-8">
              <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-4 group">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 transition-all duration-300 group-hover:bg-brand-100 group-hover:scale-110">
                      <stat.icon className="h-5 w-5 text-brand-600" aria-hidden="true" />
                    </div>
                    <div>
                      <dt className="text-2xl font-bold text-gray-900">
                        <AnimatedCounter value={stat.value} />
                      </dt>
                      <dd className="text-[13px] text-gray-500">{stat.label}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Trusted by marquee */}
      <section className="py-10 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-medium uppercase tracking-wider text-gray-400 mb-6">
            Trusted by teams at
          </p>
          <LogoMarquee />
        </div>
      </section>

      {/* Features — bento grid */}
      <section className="relative py-16 sm:py-24 bg-white pattern-dots">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto max-w-xl text-center mb-14">
              <p className="text-[13px] font-semibold uppercase tracking-wider text-accent-600 mb-3">
                Why LetsWork
              </p>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Everything you need to get work done
              </h2>
              <p className="mt-4 text-base text-gray-500 leading-relaxed">
                Whether you&apos;re hiring or looking for your next project, we&apos;ve got you covered.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 100}>
                <div className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white p-6 sm:p-7 transition-all duration-300 hover:shadow-lg hover:shadow-gray-100 hover:-translate-y-1 hover:border-gray-200 h-full">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <feature.icon className={`h-5 w-5 ${feature.iconColor}`} aria-hidden="true" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-gray-500 flex-1">{feature.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative py-16 sm:py-24 bg-cream pattern-cross">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto max-w-xl text-center mb-14">
              <p className="text-[13px] font-semibold uppercase tracking-wider text-accent-600 mb-3">
                Explore
              </p>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Browse by category
              </h2>
              <p className="mt-4 text-base text-gray-500">Find specialized talent in every field</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, i) => (
              <ScrollReveal key={category.name} delay={i * 60}>
                <Link
                  href={`/jobs?category=${encodeURIComponent(category.name)}`}
                  className="group flex items-center gap-4 rounded-xl bg-white p-5 border border-gray-100 transition-all duration-300 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-100/50 hover:-translate-y-0.5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-50 transition-all duration-300 group-hover:bg-brand-50 group-hover:scale-110 group-hover:rotate-6">
                    <category.icon className="h-5 w-5 text-gray-400 transition-colors group-hover:text-brand-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {category.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{category.count} freelancers</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 transition-all duration-300 group-hover:text-brand-500 group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-16 sm:py-24 bg-white pattern-grid">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto max-w-xl text-center mb-14">
              <p className="text-[13px] font-semibold uppercase tracking-wider text-accent-600 mb-3">
                How it works
              </p>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Get started in minutes
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* For Clients */}
            <ScrollReveal direction="left">
              <div className="relative rounded-2xl border border-gray-100 bg-gradient-to-br from-brand-50/50 to-white p-7 sm:p-9 overflow-hidden h-full">
                <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl from-brand-100/50 to-transparent rounded-bl-full" aria-hidden="true" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-3 py-1 mb-5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white">For Clients</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-7">Hire with confidence</h3>
                  <div className="space-y-5">
                    {[
                      { step: "Post your job", detail: "Describe your project, set a budget, and choose required skills" },
                      { step: "Review proposals", detail: "Compare bids, portfolios, and reviews from qualified freelancers" },
                      { step: "Hire & collaborate", detail: "Choose the best match and manage work through our platform" },
                      { step: "Pay securely", detail: "Release milestone payments only when you're satisfied" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4 group/step">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-800 text-xs font-bold text-white mt-0.5 shadow-sm transition-transform duration-300 group-hover/step:scale-110">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.step}</p>
                          <p className="mt-1 text-[13px] text-gray-500 leading-relaxed">{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/register?role=CLIENT" className="mt-8 block">
                    <Button className="w-full group" size="lg">
                      Post a Job
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
              </div>
            </ScrollReveal>

            {/* For Freelancers */}
            <ScrollReveal direction="right">
              <div className="relative rounded-2xl border border-gray-100 bg-gradient-to-br from-emerald-50/50 to-white p-7 sm:p-9 overflow-hidden h-full">
                <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl from-emerald-100/50 to-transparent rounded-bl-full" aria-hidden="true" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 mb-5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white">For Freelancers</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-7">Land your dream projects</h3>
                  <div className="space-y-5">
                    {[
                      { step: "Create your profile", detail: "Showcase your skills, experience, and portfolio pieces" },
                      { step: "Find matching jobs", detail: "Browse jobs filtered by your expertise and rate preferences" },
                      { step: "Submit proposals", detail: "Write compelling pitches and set your own rates" },
                      { step: "Build your reputation", detail: "Deliver great work, earn reviews, and grow your business" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4 group/step">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 mt-0.5 shadow-sm transition-transform duration-300 group-hover/step:scale-110">
                          <CheckCircle className="h-4 w-4 text-white" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.step}</p>
                          <p className="mt-1 text-[13px] text-gray-500 leading-relaxed">{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/register?role=FREELANCER" className="mt-8 block">
                    <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 group" size="lg">
                      Find Work
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-16 sm:py-24 bg-cream pattern-diagonal">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto max-w-xl text-center mb-14">
              <p className="text-[13px] font-semibold uppercase tracking-wider text-accent-600 mb-3">
                Testimonials
              </p>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Loved by thousands
              </h2>
              <p className="mt-4 text-base text-gray-500">
                See what our community has to say
              </p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <ScrollReveal key={i} delay={i * 150}>
                <div className="group relative flex flex-col rounded-2xl bg-white p-7 border border-gray-100 transition-all duration-300 hover:shadow-lg hover:shadow-gray-100 hover:-translate-y-1 overflow-hidden h-full">
                  {/* Gradient accent line at top */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-800 via-accent-500 to-brand-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <Quote className="h-8 w-8 text-brand-100 mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:text-brand-200" aria-hidden="true" />
                  <div className="flex gap-0.5 mb-4" aria-label={`${testimonial.rating} out of 5 stars`}>
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="flex-1 text-[15px] text-gray-600 leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-700 to-brand-900 text-sm font-semibold text-white ring-2 ring-white shadow-md transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
                      {testimonial.author.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{testimonial.author}</p>
                      <p className="text-xs text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 py-20 sm:py-28">
        <div className="absolute inset-0 pattern-dots-light" aria-hidden="true" />
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="hero-glow absolute -top-20 -right-20 h-[400px] w-[400px] rounded-full bg-accent-600/10 blur-3xl" />
          <div className="hero-glow-delay absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-brand-500/10 blur-3xl" />
          <div className="animate-float absolute top-16 left-[20%] h-1.5 w-1.5 rounded-full bg-accent-400/25" />
          <div className="animate-float-delay absolute bottom-16 right-[25%] h-2 w-2 rounded-full bg-white/15" />
        </div>
        <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-white/60 leading-relaxed">
              Join thousands of businesses and freelancers building the future of work.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto sm:max-w-none">
              <MagneticButton>
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="xl" className="w-full sm:w-auto bg-white text-brand-900 hover:bg-white/90 active:bg-white/80 shadow-lg shadow-black/10 group">
                    Create free account
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Button>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link href="/jobs" className="w-full sm:w-auto">
                  <Button size="xl" variant="outline" className="w-full sm:w-auto bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white/30">
                    Browse Jobs
                  </Button>
                </Link>
              </MagneticButton>
            </div>
            <p className="mt-5 text-sm text-white/40">
              Free to sign up. No credit card required.
            </p>
          </ScrollReveal>
        </div>
      </section>
    </div>
    </>
  );
}
