import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PaymentsView } from "@/features/payments/payments-view";

export const metadata = { title: "Payments" };

export default async function PaymentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const role = session.user.role;

  const payments = await prisma.payment.findMany({
    where: {
      contract:
        role === "CLIENT"
          ? { clientProfile: { userId } }
          : { freelancerProfile: { userId } },
    },
    include: {
      contract: {
        include: {
          job: { select: { id: true, title: true } },
          clientProfile: {
            include: { user: { select: { id: true, email: true, avatar: true } } },
          },
          freelancerProfile: {
            include: { user: { select: { id: true, email: true, avatar: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <PaymentsView payments={payments} session={session} />;
}
