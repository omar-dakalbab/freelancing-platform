import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobApplicationsView } from "@/features/applications/job-applications-view";

type PageProps = { params: Promise<{ id: string }> };

export const metadata = { title: "Job Applications" };

export default async function JobApplicationsPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "CLIENT") redirect("/dashboard");

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      clientProfile: true,
      skills: true,
      _count: { select: { applications: true } },
      applications: {
        orderBy: { createdAt: "desc" },
        include: {
          freelancerProfile: {
            include: {
              user: { select: { id: true, email: true, avatar: true } },
              skills: true,
              portfolioItems: true,
            },
          },
          conversation: true,
        },
      },
    },
  });

  if (!job) notFound();
  if (job.clientProfile.userId !== session.user.id) redirect("/dashboard/my-jobs");

  // Serialize to plain objects to avoid Prisma object serialization issues
  const serializedJob = JSON.parse(JSON.stringify(job));

  return <JobApplicationsView job={serializedJob} />;
}
