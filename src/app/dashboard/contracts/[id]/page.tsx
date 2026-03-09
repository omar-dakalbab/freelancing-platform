import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ContractDetailView } from "@/features/contracts/contract-detail-view";

export const metadata = { title: "Contract Details" };

type PageProps = { params: Promise<{ id: string }> };

export default async function ContractDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      job: { select: { id: true, title: true, category: true } },
      clientProfile: {
        include: { user: { select: { id: true, email: true, avatar: true } } },
      },
      freelancerProfile: {
        include: { user: { select: { id: true, email: true, avatar: true } } },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        include: {
          payouts: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
      milestones: { orderBy: { order: "asc" } },
      reviews: { select: { id: true, reviewerId: true, rating: true } },
    },
  });

  if (!contract) notFound();

  const userId = session.user.id;
  const isClient = contract.clientProfile.userId === userId;
  const isFreelancer = contract.freelancerProfile.userId === userId;

  if (!isClient && !isFreelancer && session.user.role !== "ADMIN") redirect("/dashboard");

  // Serialize to plain objects to avoid Prisma object serialization issues
  const serializedContract = JSON.parse(JSON.stringify(contract));

  return (
    <ContractDetailView
      contract={serializedContract}
      isClient={isClient}
      isFreelancer={isFreelancer}
      session={session}
    />
  );
}
