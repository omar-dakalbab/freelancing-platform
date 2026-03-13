import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FreelancerBadge } from "@/components/ui/freelancer-badge";
import { getFreelancerBadge } from "@/lib/freelancer-badges";
import {
  Briefcase,
  ExternalLink,
  Star,
  Calendar,
  DollarSign,
  Award,
  CheckCircle2,
  ArrowLeft,
  MessageCircle,
  FileText,
  TrendingUp,
  Clock,
  Globe,
  Mail,
  Phone,
} from "lucide-react";
import type { Metadata } from "next";

type PageProps = { params: Promise<{ id: string }> };

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tryletswork.com";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await prisma.freelancerProfile.findUnique({
    where: { userId: id },
    include: {
      user: { select: { email: true } },
      skills: { select: { name: true }, take: 10 },
    },
  });
  if (!profile) return { title: "Freelancer Not Found" };

  const name = profile.title || profile.user.email.split("@")[0];
  const desc = profile.bio?.slice(0, 155).trim() || `Hire ${name} on LetsWork`;
  const rate = profile.hourlyRate ? ` | ${formatCurrency(Number(profile.hourlyRate))}/hr` : "";

  return {
    title: `${name} — Freelancer Profile`,
    description: `${desc}${rate}`,
    keywords: [...profile.skills.map((s) => s.name), "freelancer", "hire freelancer"],
    openGraph: {
      title: `${name} — Freelancer on LetsWork`,
      description: desc,
      url: `${SITE_URL}/freelancers/${id}`,
      type: "profile",
    },
    alternates: { canonical: `${SITE_URL}/freelancers/${id}` },
  };
}

export default async function FreelancerPublicProfilePage({ params }: PageProps) {
  const { id } = await params;

  const [profile, session] = await Promise.all([
    prisma.freelancerProfile.findUnique({
      where: { userId: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            avatar: true,
            createdAt: true,
            suspended: true,
          },
        },
        skills: true,
        portfolioItems: { orderBy: { createdAt: "desc" } },
        contracts: {
          where: { status: "COMPLETED" },
          select: { id: true },
        },
      },
    }),
    auth(),
  ]);

  if (!profile || profile.user.suspended) notFound();

  // Get total earnings from completed contracts
  const earningsResult = await prisma.contract.aggregate({
    where: {
      freelancerProfileId: profile.id,
      status: "COMPLETED",
    },
    _sum: { amount: true },
  });
  const totalEarnings = earningsResult._sum.amount ?? 0;

  const reviews = await prisma.review.findMany({
    where: { revieweeId: id },
    include: {
      reviewer: {
        select: {
          id: true,
          email: true,
          avatar: true,
          clientProfile: { select: { companyName: true } },
        },
      },
      contract: {
        select: { job: { select: { id: true, title: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const completedContracts = profile.contracts.length;

  const badge = getFreelancerBadge({
    completedContracts,
    totalEarnings,
    avgRating: averageRating,
    reviewCount: reviews.length,
    profileComplete: !!(profile.title && profile.bio && profile.hourlyRate),
    skillsCount: profile.skills.length,
  });

  const displayName = profile.title || profile.user.email.split("@")[0];
  const isOwnProfile = session?.user?.id === id;

  // Calculate rating distribution
  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length > 0 ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: displayName,
    url: `${SITE_URL}/freelancers/${id}`,
    jobTitle: profile.title || "Freelancer",
    description: profile.bio || undefined,
    knowsAbout: profile.skills.map((s) => s.name),
    ...(averageRating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: averageRating.toFixed(1),
            reviewCount: reviews.length,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero banner */}
      <div className="relative bg-gradient-to-br from-brand-800 via-brand-900 to-purple-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2Mmg=')] opacity-30" />
        <div className="mx-auto max-w-6xl px-4 pt-8 pb-24 sm:px-6 lg:px-8">
          <Link
            href="/freelancers"
            className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Freelancers
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        {/* Profile header card */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-lg p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="shrink-0">
              <Avatar
                src={profile.user.avatar}
                alt={displayName}
                email={profile.user.email}
                size="xl"
                className="ring-4 ring-white shadow-xl h-24 w-24 text-2xl"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{displayName}</h1>
                    {badge && <FreelancerBadge tier={badge.tier!} size="md" />}
                  </div>
                  <p className="text-gray-500 mt-1">{profile.user.email}</p>

                  {/* Rating + member since */}
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    {reviews.length > 0 && (
                      <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-bold">{averageRating.toFixed(1)}</span>
                        <span className="text-amber-600 text-sm">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      Joined {formatDate(profile.user.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {isOwnProfile ? (
                    <Link href="/dashboard/profile">
                      <Button variant="outline">Edit Profile</Button>
                    </Link>
                  ) : session?.user?.role === "CLIENT" ? (
                    <Link href="/jobs">
                      <Button className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Hire Me
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-green-50 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-xl font-bold text-gray-900">
                {profile.hourlyRate ? formatCurrency(Number(profile.hourlyRate)) : "N/A"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Hourly Rate</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-blue-50 mb-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xl font-bold text-gray-900">{completedContracts}</p>
              <p className="text-xs text-gray-500 mt-0.5">Jobs Completed</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-amber-50 mb-2">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-xl font-bold text-gray-900">
                {reviews.length > 0 ? averageRating.toFixed(1) : "N/A"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Avg Rating</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-purple-50 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-xl font-bold text-gray-900">{profile.skills.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Skills</p>
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid gap-8 lg:grid-cols-3 pb-16">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            {profile.bio && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand-700" />
                  About
                </h2>
                <div className="rounded-2xl bg-white border border-gray-200 p-6">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                </div>
              </section>
            )}

            {/* Skills */}
            {profile.skills.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-brand-700" />
                  Skills & Expertise
                </h2>
                <div className="rounded-2xl bg-white border border-gray-200 p-6">
                  <div className="flex flex-wrap gap-2.5">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-4 py-2 text-sm font-medium text-brand-800 hover:bg-brand-100 transition-colors"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Portfolio */}
            {profile.portfolioItems.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-brand-700" />
                  Portfolio
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {profile.portfolioItems.map((item) => (
                    <div
                      key={item.id}
                      className="group rounded-2xl bg-white border border-gray-200 p-5 hover:border-brand-300 hover:shadow-md transition-all duration-200"
                    >
                      {item.imageUrl && (
                        <div className="mb-4 rounded-xl overflow-hidden bg-gray-100 aspect-video">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <h3 className="font-semibold text-gray-900 group-hover:text-brand-800 transition-colors">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-900 transition-colors"
                        >
                          <Globe className="h-3.5 w-3.5" />
                          View Project
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Star className="h-5 w-5 text-brand-700" />
                  Client Reviews
                </h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                    <span>({reviews.length})</span>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="rounded-2xl bg-white border border-gray-200 py-16 text-center">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-gray-100 mb-4">
                    <Star className="h-6 w-6 text-gray-300" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900">No reviews yet</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Reviews will appear here after completing contracts
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const reviewerName =
                      review.reviewer.clientProfile?.companyName ||
                      review.reviewer.email.split("@")[0];
                    return (
                      <div
                        key={review.id}
                        className="rounded-2xl bg-white border border-gray-200 p-5 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar
                            src={review.reviewer.avatar}
                            alt={reviewerName}
                            email={review.reviewer.email}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-gray-900">{reviewerName}</p>
                                {review.contract?.job && (
                                  <Link
                                    href={`/jobs/${review.contract.job.id}`}
                                    className="text-xs text-brand-600 hover:underline flex items-center gap-1 mt-0.5"
                                  >
                                    <Briefcase className="h-3 w-3" />
                                    {review.contract.job.title}
                                  </Link>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <StarRating value={review.rating} readonly size="sm" />
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatDate(review.createdAt)}
                                </p>
                              </div>
                            </div>
                            {review.comment && (
                              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                                &ldquo;{review.comment}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Badge card */}
            {badge && (
              <FreelancerBadge tier={badge.tier!} size="lg" showDescription />
            )}

            {/* Availability */}
            <div className="rounded-2xl bg-white border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                </span>
                <span className="text-sm font-medium text-green-700">Available for work</span>
              </div>
              {profile.hourlyRate && (
                <div className="mb-4">
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(Number(profile.hourlyRate))}
                    <span className="text-base font-normal text-gray-400">/hr</span>
                  </p>
                </div>
              )}
              {session?.user?.role === "CLIENT" && !isOwnProfile && (
                <Link href="/jobs" className="block">
                  <Button className="w-full gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Contact Freelancer
                  </Button>
                </Link>
              )}
            </div>

            {/* Rating breakdown */}
            {reviews.length > 0 && (
              <div className="rounded-2xl bg-white border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Rating Breakdown</h3>
                <div className="flex items-center gap-3 mb-5">
                  <p className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
                  <div>
                    <StarRating value={Math.round(averageRating)} readonly size="sm" />
                    <p className="text-xs text-gray-500 mt-1">
                      Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {ratingDist.map(({ star, count, pct }) => (
                    <div key={star} className="flex items-center gap-2.5">
                      <span className="text-sm text-gray-600 w-3 text-right font-medium">{star}</span>
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-5 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact info */}
            {(profile.user.email || profile.whatsappNumber || profile.phoneNumber) && (
              <div className="rounded-2xl bg-white border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                    <a
                      href={`mailto:${profile.user.email}`}
                      className="text-sm text-brand-700 hover:underline break-all"
                    >
                      {profile.user.email}
                    </a>
                  </div>
                  {profile.whatsappNumber && (
                    <div className="flex items-center gap-2.5">
                      <MessageCircle className="h-4 w-4 text-green-500 shrink-0" />
                      <a
                        href={`https://wa.me/${profile.whatsappNumber.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand-700 hover:underline"
                      >
                        {profile.whatsappNumber}
                      </a>
                    </div>
                  )}
                  {profile.phoneNumber && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                      <a
                        href={`tel:${profile.phoneNumber}`}
                        className="text-sm text-brand-700 hover:underline"
                      >
                        {profile.phoneNumber}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick stats */}
            <div className="rounded-2xl bg-white border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Completed Jobs
                  </span>
                  <span className="text-sm font-bold text-gray-900">{completedContracts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="h-4 w-4 text-amber-500" />
                    Total Reviews
                  </span>
                  <span className="text-sm font-bold text-gray-900">{reviews.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="h-4 w-4 text-purple-500" />
                    Skills
                  </span>
                  <span className="text-sm font-bold text-gray-900">{profile.skills.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Member Since
                  </span>
                  <span className="text-sm font-bold text-gray-900">{formatDate(profile.user.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Skills sidebar */}
            {profile.skills.length > 0 && (
              <div className="rounded-2xl bg-white border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill.id} variant="secondary" className="text-xs">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
