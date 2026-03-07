import Link from "next/link";
import {
  ArrowRight, Briefcase, Users, Shield, Star, TrendingUp, CheckCircle,
  Code, Palette, PenTool, BarChart3, Megaphone, Smartphone, Video, Calculator,
  Search, Zap, Clock, Globe,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const features = [
  {
    icon: Users,
    title: "Top Talent",
    description: "Access thousands of vetted freelancers across every discipline, ready to start today.",
    color: "bg-brand-50 text-brand-800",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Escrow-protected milestones ensure you only pay for work you approve.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Zap,
    title: "Fast Matching",
    description: "Get proposals within hours, not days. Our platform connects you with the right talent instantly.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Hire from anywhere in the world. Break through geographic barriers to find the perfect fit.",
    color: "bg-purple-50 text-purple-600",
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
  { value: "50K+", label: "Freelancers", detail: "across 120 countries" },
  { value: "10K+", label: "Projects Posted", detail: "and counting" },
  { value: "95%", label: "Client Satisfaction", detail: "5-star reviews" },
  { value: "48h", label: "Avg. First Response", detail: "fast turnaround" },
];

const testimonials = [
  {
    quote: "FreelanceHub helped us scale our engineering team in weeks, not months. The quality of talent is unmatched.",
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

const trustedBy = [
  "Acme Corp", "Globex", "Soylent Corp", "Initech", "Massive Dynamic", "Stark Industries",
];

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream pb-20 pt-12 sm:pb-28 sm:pt-16 lg:pb-36 lg:pt-20">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-accent-400/15 blur-3xl" />
          <div className="absolute bottom-0 -left-20 h-[500px] w-[500px] rounded-full bg-accent-600/10 blur-3xl" />
          <div className="absolute top-20 left-1/3 h-[300px] w-[300px] rounded-full bg-accent-200/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="homepage-fade-in mb-6 inline-flex items-center gap-2 rounded-full bg-accent-100 px-4 py-2 text-sm font-medium text-accent-700 ring-1 ring-accent-200">
              <Star className="h-4 w-4 text-amber-500" aria-hidden="true" />
              Trusted by 10,000+ businesses worldwide
            </div>
            <h1 className="homepage-fade-in homepage-fade-in-delay-1 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Find the perfect{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-700 via-accent-600 to-accent-500">
                freelancer
              </span>
              <br className="hidden sm:block" />
              {" "}for any project
            </h1>
            <p className="homepage-fade-in homepage-fade-in-delay-2 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-500 sm:text-xl">
              Post your project, review proposals from top professionals, and get
              exceptional work done — on time, on budget.
            </p>

            {/* Search bar */}
            <div className="homepage-fade-in homepage-fade-in-delay-3 mx-auto mt-10 max-w-2xl">
              <form action="/jobs" method="GET" className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Search for any skill or project..."
                    className="h-14 w-full rounded-xl border border-gray-200 bg-white pl-12 pr-4 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-accent-600 focus:border-accent-600 focus:outline-none sm:text-base"
                    aria-label="Search for jobs by skill or project type"
                  />
                </div>
                <Button type="submit" size="xl" className="shrink-0 shadow-sm">
                  Search
                </Button>
              </form>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="text-sm text-gray-400">Popular:</span>
                {["React", "Design", "Python", "WordPress", "Video Editing"].map((tag) => (
                  <Link
                    key={tag}
                    href={`/jobs?search=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200 transition-colors hover:bg-accent-50 hover:text-accent-700 hover:ring-accent-300"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="homepage-fade-in homepage-fade-in-delay-3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto sm:max-w-none">
              <Link href="/register?role=CLIENT" className="w-full sm:w-auto">
                <Button size="xl" className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow">
                  Hire a Freelancer
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/register?role=FREELANCER" className="w-full sm:w-auto">
                <Button size="xl" variant="outline" className="w-full sm:w-auto">
                  Find Work
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by logos */}
      <section className="relative bg-white py-10 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {trustedBy.map((company) => (
              <span
                key={company}
                className="text-lg font-bold text-gray-300 transition-colors hover:text-gray-400 select-none"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="relative rounded-2xl bg-cream p-6 text-center ring-1 ring-gray-100"
              >
                <dt className="text-4xl font-extrabold text-accent-600 sm:text-5xl">
                  {stat.value}
                </dt>
                <dd className="mt-2 text-sm font-semibold text-gray-900">{stat.label}</dd>
                <dd className="mt-0.5 text-xs text-gray-500">{stat.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-24 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="default" className="mb-4">Why FreelanceHub</Badge>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need to get work done
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Whether you&apos;re hiring or looking for your next project, we&apos;ve got you covered.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative flex flex-col rounded-2xl bg-white p-8 ring-1 ring-gray-200 transition-all hover:shadow-lg hover:ring-accent-300 hover:-translate-y-1"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.color} mb-5`}>
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500 flex-1">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="default" className="mb-4">Categories</Badge>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Browse by category
            </h2>
            <p className="mt-4 text-lg text-gray-500">Find specialized talent in every field</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/jobs?category=${encodeURIComponent(category.name)}`}
                className="group flex items-center gap-4 rounded-2xl bg-cream p-5 ring-1 ring-gray-100 transition-all hover:bg-accent-50 hover:ring-accent-300 hover:shadow-md"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-gray-200 transition-colors group-hover:bg-accent-100 group-hover:ring-accent-300">
                  <category.icon className="h-5 w-5 text-gray-600 group-hover:text-accent-700" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-accent-700 truncate">
                    {category.name}
                  </p>
                  <p className="text-xs text-gray-500">{category.count} freelancers</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 transition-all group-hover:text-accent-600 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-24 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="default" className="mb-4">How it works</Badge>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Get started in minutes
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* For Clients */}
            <div className="relative rounded-2xl bg-white p-8 sm:p-10 ring-1 ring-gray-200 shadow-sm overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-bl-[80px] bg-accent-50" aria-hidden="true" />
              <div className="relative">
                <Badge variant="default" className="mb-4">For Clients</Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Hire with confidence</h3>
                <div className="space-y-6">
                  {[
                    { step: "Post your job", detail: "Describe your project, set a budget, and choose required skills" },
                    { step: "Review proposals", detail: "Compare bids, portfolios, and reviews from qualified freelancers" },
                    { step: "Hire & collaborate", detail: "Choose the best match and manage work through our platform" },
                    { step: "Pay securely", detail: "Release milestone payments only when you're satisfied with the work" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-800 text-sm font-bold text-white shadow-sm">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{item.step}</p>
                        <p className="mt-0.5 text-sm text-gray-500">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/register?role=CLIENT" className="mt-8 block">
                  <Button className="w-full" size="lg">
                    Post a Job
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* For Freelancers */}
            <div className="relative rounded-2xl bg-white p-8 sm:p-10 ring-1 ring-gray-200 shadow-sm overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-bl-[80px] bg-green-50" aria-hidden="true" />
              <div className="relative">
                <Badge variant="success" className="mb-4">For Freelancers</Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Land your dream projects</h3>
                <div className="space-y-6">
                  {[
                    { step: "Create your profile", detail: "Showcase your skills, experience, and portfolio pieces" },
                    { step: "Find matching jobs", detail: "Browse jobs filtered by your expertise and rate preferences" },
                    { step: "Submit proposals", detail: "Write compelling pitches and set your own rates" },
                    { step: "Build your reputation", detail: "Deliver great work, earn reviews, and grow your business" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white shadow-sm">
                        <CheckCircle className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{item.step}</p>
                        <p className="mt-0.5 text-sm text-gray-500">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/register?role=FREELANCER" className="mt-8 block">
                  <Button variant="outline" className="w-full" size="lg">
                    Find Work
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="default" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Loved by thousands
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              See what our community has to say about FreelanceHub
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="relative flex flex-col rounded-2xl bg-cream p-8 ring-1 ring-gray-100"
              >
                <Quote className="h-8 w-8 text-accent-300 mb-4" aria-hidden="true" />
                <div className="flex gap-0.5 mb-4" aria-label={`${testimonial.rating} out of 5 stars`}>
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="flex-1 text-gray-700 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3 border-t border-gray-200 pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-800 text-sm font-bold text-white" aria-hidden="true">
                    {testimonial.author.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden py-24 sm:py-32 bg-cream">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-accent-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white p-10 sm:p-16 ring-1 ring-gray-200 shadow-sm">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500">
              Join thousands of businesses and freelancers building the future of work on FreelanceHub.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto sm:max-w-none">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="xl" className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow">
                  Create Free Account
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/jobs" className="w-full sm:w-auto">
                <Button size="xl" variant="outline" className="w-full sm:w-auto">
                  Browse Jobs
                </Button>
              </Link>
            </div>
            <p className="mt-5 text-sm text-gray-400">
              Free to sign up. No credit card required.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
