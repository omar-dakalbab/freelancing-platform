import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Find the pending payment for the test contract
  const payment = await prisma.payment.findFirst({
    where: {
      contract: { id: "cmmhn0t5x0001jqw8r85y3x67" },
      status: "PENDING",
    },
  });

  if (!payment) {
    console.log("No pending payment found for this contract.");
    return;
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "COMPLETED",
      stripePaymentId: "pi_3T8f4KQSH3G9LKMS1lejMYyv",
    },
  });

  console.log("Payment marked as COMPLETED:", payment.id);
  console.log("Amount:", payment.amount);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
