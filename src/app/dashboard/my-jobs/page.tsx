import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MyJobsView } from "@/features/jobs/my-jobs-view";

export const metadata = { title: "My Jobs" };

export default async function MyJobsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "CLIENT") redirect("/dashboard");

  const clientProfile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!clientProfile) redirect("/dashboard");

  const jobs = await prisma.job.findMany({
    where: { clientProfileId: clientProfile.id },
    orderBy: { createdAt: "desc" },
    include: {
      skills: true,
      _count: { select: { applications: true } },
    },
  });

  // Serialize to plain objects to avoid Prisma object serialization issues
  const serializedJobs = JSON.parse(JSON.stringify(jobs));

  return <MyJobsView jobs={serializedJobs} />;
}
