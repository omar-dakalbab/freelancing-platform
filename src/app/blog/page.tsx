"use client";

import Link from "next/link";
import { ArrowRight, Clock, User } from "lucide-react";
import { blogPosts, getCategoryColor } from "@/lib/blog-data";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const featuredPost = blogPosts.find((p) => p.featured) ?? blogPosts[0];
const recentPosts = blogPosts.filter((p) => p.slug !== featuredPost.slug);

export default function BlogPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 py-16 sm:py-20">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-accent-600/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Blog
          </h1>
          <p className="mt-4 text-white/60">
            Tips, insights, and news on freelancing, hiring, and the future of work.
          </p>
        </div>
      </section>

      {/* Featured post */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="block rounded-2xl border border-gray-100 bg-gradient-to-br from-brand-50/50 to-white p-8 sm:p-10 transition-all hover:shadow-lg hover:border-gray-200 group"
            >
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getCategoryColor(featuredPost.category)}`}>
                {featuredPost.category}
              </span>
              <h2 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl group-hover:text-brand-700 transition-colors">
                {featuredPost.title}
              </h2>
              <p className="mt-3 text-gray-600 leading-relaxed max-w-2xl">
                {featuredPost.excerpt}
              </p>
              <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {featuredPost.author}
                </div>
                <span>&middot;</span>
                <span>{featuredPost.date}</span>
                <span>&middot;</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {featuredPost.readTime}
                </div>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 group-hover:gap-2.5 transition-all">
                Read article <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-12 sm:py-16 bg-cream">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Recent Articles</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post, i) => (
              <ScrollReveal key={post.slug} delay={i * 100}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-xl border border-gray-100 bg-white p-6 transition-all hover:shadow-lg hover:border-gray-200 hover:-translate-y-0.5"
                >
                  <span className={`inline-block w-fit rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                  <h3 className="mt-3 text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-[13px] text-gray-500 leading-relaxed flex-1 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-50">
                    <span>{post.author}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 sm:py-20 bg-white">
        <ScrollReveal>
          <div className="mx-auto max-w-xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">Stay in the loop</h2>
            <p className="mt-3 text-gray-500 text-sm">
              Get the latest articles and platform updates delivered to your inbox.
            </p>
            <form className="mt-6 flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-accent-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent-100 transition-colors"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-brand-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-900 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
