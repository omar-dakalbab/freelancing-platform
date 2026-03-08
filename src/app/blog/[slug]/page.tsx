"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, User, ArrowRight } from "lucide-react";
import { getPostBySlug, blogPosts, getCategoryColor } from "@/lib/blog-data";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4">
        <h1 className="text-2xl font-bold text-gray-900">Post not found</h1>
        <p className="mt-2 text-sm text-gray-500">
          The article you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/blog"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>
      </div>
    );
  }

  // Get related posts (same category, excluding current)
  const relatedPosts = blogPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 2);

  // If not enough related by category, fill with other recent posts
  if (relatedPosts.length < 2) {
    const others = blogPosts
      .filter((p) => p.slug !== post.slug && !relatedPosts.includes(p))
      .slice(0, 2 - relatedPosts.length);
    relatedPosts.push(...others);
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to blog
            </Link>
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getCategoryColor(post.category)}`}>
              {post.category}
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.15]">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-white/50 leading-relaxed">
            {post.excerpt}
          </p>
          <div className="mt-8 flex items-center gap-4 text-sm text-white/40">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                {post.author.split(" ").map((n) => n[0]).join("")}
              </div>
              <span className="text-white/70 font-medium">{post.author}</span>
            </div>
            <span>&middot;</span>
            <span>{post.date}</span>
            <span>&middot;</span>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime}
            </div>
          </div>
        </div>
      </section>

      {/* Article content */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <article className="prose prose-gray max-w-none">
            {post.content.map((paragraph, i) => (
              <p
                key={i}
                className="text-[15px] leading-[1.8] text-gray-600 mb-6"
              >
                {paragraph}
              </p>
            ))}
          </article>
        </div>
      </section>

      {/* Author card */}
      <section className="bg-white pb-12 sm:pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-100 bg-cream p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-lg font-bold text-white">
                {post.author.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Written by {post.author}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Contributing writer at LetsWork
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 sm:py-16 bg-cream border-t border-gray-100">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Related Articles</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group flex flex-col rounded-xl border border-gray-100 bg-white p-6 transition-all hover:shadow-lg hover:border-gray-200 hover:-translate-y-0.5"
                >
                  <span className={`inline-block w-fit rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getCategoryColor(related.category)}`}>
                    {related.category}
                  </span>
                  <h3 className="mt-3 text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
                    {related.title}
                  </h3>
                  <p className="mt-2 text-[13px] text-gray-500 leading-relaxed flex-1 line-clamp-3">
                    {related.excerpt}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand-700 group-hover:gap-2 transition-all">
                    Read more <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
