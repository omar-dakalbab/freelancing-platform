import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { JobDetailView } from "@/features/jobs/job-detail-view";
import { formatCurrency } from "@/lib/utils";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tryletswork.com";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    select: {
      title: true,
      description: true,
      category: true,
      budgetMin: true,
      budgetMax: true,
      skills: { select: { name: true } },
      clientProfile: { select: { companyName: true } },
    },
  });
  if (!job) return { title: "Job Not Found" };

  const budget = job.budgetMin && job.budgetMax
    ? `${formatCurrency(job.budgetMin)} – ${formatCurrency(job.budgetMax)}`
    : job.budgetMin
    ? `From ${formatCurrency(job.budgetMin)}`
    : job.budgetMax
    ? `Up to ${formatCurrency(job.budgetMax)}`
    : "";

  const desc = `${job.description.slice(0, 150).trim()}${job.description.length > 150 ? "..." : ""}`;
  const company = job.clientProfile?.companyName || "";

  return {
    title: job.title,
    description: `${company ? `${company} — ` : ""}${desc}${budget ? ` | Budget: ${budget}` : ""}`,
    keywords: [job.category, ...job.skills.map((s) => s.name), "freelance job", "remote work"],
    openGraph: {
      title: `${job.title} — Freelance Job on LetsWork`,
      description: desc,
      url: `${SITE_URL}/jobs/${id}`,
      type: "website",
    },
    alternates: { canonical: `${SITE_URL}/jobs/${id}` },
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      clientProfile: {
        include: {
          user: { select: { id: true, email: true, avatar: true, createdAt: true } },
        },
      },
      skills: true,
      _count: { select: { applications: true } },
    },
  });

  if (!job) notFound();

  // Check if current freelancer has applied
  let hasApplied = false;
  let applicationId: string | null = null;
  if (session?.user?.role === "FREELANCER") {
    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (profile) {
      const existing = await prisma.jobApplication.findUnique({
        where: {
          jobId_freelancerProfileId: {
            jobId: id,
            freelancerProfileId: profile.id,
          },
        },
      });
      hasApplied = !!existing;
      applicationId = existing?.id || null;
    }
  }

  // Check if the current user is the job owner
  const isOwner = session?.user?.id === job.clientProfile.user.id;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.createdAt.toISOString(),
    hiringOrganization: {
      "@type": "Organization",
      name: job.clientProfile.companyName || "LetsWork Client",
    },
    employmentType: "CONTRACTOR",
    ...(job.budgetMin || job.budgetMax
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "USD",
            value: {
              "@type": "QuantitativeValue",
              ...(job.budgetMin ? { minValue: job.budgetMin } : {}),
              ...(job.budgetMax ? { maxValue: job.budgetMax } : {}),
              unitText: "PROJECT",
            },
          },
        }
      : {}),
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: {
      "@type": "Country",
      name: "Worldwide",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JobDetailView
        job={JSON.parse(JSON.stringify(job))}
        session={session}
        hasApplied={hasApplied}
        applicationId={applicationId}
        isOwner={isOwner}
      />
    </>
  );
}
