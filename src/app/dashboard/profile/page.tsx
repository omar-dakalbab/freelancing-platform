import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClientProfileForm } from "@/features/profiles/client-profile-form";
import { FreelancerProfileForm } from "@/features/profiles/freelancer-profile-form";

export const metadata = { title: "Edit Profile" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;

  if (role === "CLIENT") {
    const profile = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: { select: { id: true, email: true, avatar: true, createdAt: true } },
      },
    });
    // Serialize to plain objects to avoid Prisma object serialization issues
    return <ClientProfileForm profile={profile ? JSON.parse(JSON.stringify(profile)) : null} session={session} />;
  }

  if (role === "FREELANCER") {
    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: { select: { id: true, email: true, avatar: true, createdAt: true } },
        skills: true,
        portfolioItems: { orderBy: { createdAt: "desc" } },
      },
    });
    // Serialize to plain objects to avoid Prisma object serialization issues
    return <FreelancerProfileForm profile={profile ? JSON.parse(JSON.stringify(profile)) : null} session={session} />;
  }

  redirect("/dashboard");
}
