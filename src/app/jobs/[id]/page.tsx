import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { JobDetailView } from "@/features/jobs/job-detail-view";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id }, select: { title: true } });
  return { title: job?.title || "Job Detail" };
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

  return (
    <JobDetailView
      job={job}
      session={session}
      hasApplied={hasApplied}
      applicationId={applicationId}
      isOwner={isOwner}
    />
  );
}
