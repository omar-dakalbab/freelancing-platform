import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FreelancerApplicationsView } from "@/features/applications/freelancer-applications-view";

export const metadata = { title: "My Applications" };

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "FREELANCER") redirect("/dashboard");

  const freelancerProfile = await prisma.freelancerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!freelancerProfile) redirect("/dashboard");

  const applications = await prisma.jobApplication.findMany({
    where: { freelancerProfileId: freelancerProfile.id },
    orderBy: { createdAt: "desc" },
    include: {
      job: {
        include: {
          clientProfile: {
            include: {
              user: { select: { id: true, email: true, avatar: true } },
            },
          },
          skills: true,
          _count: { select: { applications: true } },
        },
      },
    },
  });

  return <FreelancerApplicationsView applications={applications} />;
}
