import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClientDashboard } from "@/features/profiles/client-dashboard";
import { FreelancerDashboard } from "@/features/profiles/freelancer-dashboard";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;

  if (role === "ADMIN") {
    redirect("/admin");
  }

  if (role === "CLIENT") {
    const profile = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: { select: { id: true, email: true, avatar: true, createdAt: true } },
        jobs: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            skills: true,
            _count: { select: { applications: true } },
          },
        },
      },
    });

    const [totalApplications, activeContracts, unreadMessages] = await Promise.all([
      prisma.jobApplication.count({
        where: { job: { clientProfileId: profile?.id } },
      }),
      prisma.contract.count({
        where: {
          clientProfileId: profile?.id,
          status: { in: ["PENDING", "ACTIVE", "SUBMITTED"] },
        },
      }),
      prisma.message.count({
        where: {
          readAt: null,
          senderId: { not: session.user.id },
          conversation: {
            jobApplication: {
              job: { clientProfile: { userId: session.user.id } },
            },
          },
        },
      }),
    ]);

    return (
      <ClientDashboard
        profile={profile}
        session={session}
        stats={{
          totalJobs: profile?.jobs.length ?? 0,
          totalApplications,
          activeJobs: profile?.jobs.filter((j) => j.status === "OPEN").length ?? 0,
          activeContracts,
          unreadMessages,
        }}
      />
    );
  }

  if (role === "FREELANCER") {
    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: { select: { id: true, email: true, avatar: true, createdAt: true } },
        skills: true,
        applications: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            job: {
              include: {
                clientProfile: {
                  include: { user: { select: { id: true, email: true, avatar: true } } },
                },
                skills: true,
                _count: { select: { applications: true } },
              },
            },
          },
        },
      },
    });

    const [openJobs, activeContracts, unreadMessages] = await Promise.all([
      prisma.job.count({ where: { status: "OPEN" } }),
      prisma.contract.count({
        where: {
          freelancerProfileId: profile?.id,
          status: { in: ["PENDING", "ACTIVE", "SUBMITTED"] },
        },
      }),
      prisma.message.count({
        where: {
          readAt: null,
          senderId: { not: session.user.id },
          conversation: {
            jobApplication: {
              freelancerProfile: { userId: session.user.id },
            },
          },
        },
      }),
    ]);

    return (
      <FreelancerDashboard
        profile={profile}
        session={session}
        stats={{
          totalApplications: profile?.applications.length ?? 0,
          shortlisted: profile?.applications.filter((a) => a.status === "SHORTLISTED").length ?? 0,
          openJobs,
          activeContracts,
          unreadMessages,
        }}
      />
    );
  }

  redirect("/");
}
