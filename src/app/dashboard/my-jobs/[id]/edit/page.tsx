import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobForm } from "@/features/jobs/job-form";

type PageProps = { params: Promise<{ id: string }> };

export const metadata = { title: "Edit Job" };

export default async function EditJobPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "CLIENT") redirect("/dashboard");

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      skills: true,
      clientProfile: true,
    },
  });

  if (!job) notFound();
  if (job.clientProfile.userId !== session.user.id) redirect("/dashboard/my-jobs");

  // Serialize to plain objects to avoid Prisma object serialization issues
  const serializedJob = JSON.parse(JSON.stringify(job));

  return <JobForm mode="edit" job={serializedJob} />;
}
