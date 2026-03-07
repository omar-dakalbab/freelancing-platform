import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApplyForm } from "@/features/applications/apply-form";

type PageProps = { params: Promise<{ id: string }> };

export const metadata = { title: "Submit Proposal" };

export default async function ApplyPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) redirect(`/login?callbackUrl=/jobs/${id}/apply`);
  if (session.user.role !== "FREELANCER") redirect(`/jobs/${id}`);

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      skills: true,
      clientProfile: {
        include: {
          user: { select: { id: true, email: true, avatar: true } },
        },
      },
      _count: { select: { applications: true } },
    },
  });

  if (!job) notFound();
  if (job.status !== "OPEN") redirect(`/jobs/${id}`);

  // Check if already applied
  const freelancerProfile = await prisma.freelancerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (freelancerProfile) {
    const existing = await prisma.jobApplication.findUnique({
      where: {
        jobId_freelancerProfileId: {
          jobId: id,
          freelancerProfileId: freelancerProfile.id,
        },
      },
    });
    if (existing) redirect(`/jobs/${id}`);
  }

  return <ApplyForm job={job} session={session} />;
}
