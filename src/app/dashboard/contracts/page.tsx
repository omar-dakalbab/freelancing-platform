import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ContractsListView } from "@/features/contracts/contracts-list-view";

export const metadata = { title: "Contracts" };

export default async function ContractsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const role = session.user.role;

  const contracts = await prisma.contract.findMany({
    where:
      role === "CLIENT"
        ? { clientProfile: { userId } }
        : role === "FREELANCER"
        ? { freelancerProfile: { userId } }
        : {},
    include: {
      job: { select: { id: true, title: true } },
      clientProfile: {
        include: { user: { select: { id: true, email: true, avatar: true } } },
      },
      freelancerProfile: {
        include: { user: { select: { id: true, email: true, avatar: true } } },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize to plain objects to avoid Prisma object serialization issues
  const serializedContracts = JSON.parse(JSON.stringify(contracts));

  return <ContractsListView contracts={serializedContracts} session={session} />;
}
