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
      payouts: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch connect status for freelancers
  let connectStatus = { onboarded: false, accountId: null as string | null };
  if (role === "FREELANCER") {
    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId },
      select: {
        stripeConnectOnboarded: true,
        stripeConnectAccountId: true,
      },
    });
    if (profile) {
      connectStatus = {
        onboarded: profile.stripeConnectOnboarded,
        accountId: profile.stripeConnectAccountId,
      };
    }
  }

  return (
    <PaymentsView
      payments={payments}
      session={session}
      connectStatus={connectStatus}
    />
  );
}
