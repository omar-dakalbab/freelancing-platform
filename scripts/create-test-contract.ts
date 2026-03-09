import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const client = await prisma.user.findUnique({
    where: { email: "techcorp@example.com" },
    include: { clientProfile: true },
  });

  const freelancer = await prisma.user.findUnique({
    where: { email: "alex@example.com" },
    include: { freelancerProfile: true },
  });

  if (!client?.clientProfile || !freelancer?.freelancerProfile) {
    console.log("Users not found. Run seed first.");
    return;
  }

  const job = await prisma.job.create({
    data: {
      title: "Build REST API for Inventory Management System",
      description: "Need a REST API built with Node.js and PostgreSQL for our inventory system.",
      category: "Web Development",
      budgetMin: 2000,
      budgetMax: 3500,
      timeline: "1-3 months",
      status: "FILLED",
      clientProfileId: client.clientProfile.id,
    },
  });

  const contract = await prisma.contract.create({
    data: {
      jobId: job.id,
      clientProfileId: client.clientProfile.id,
      freelancerProfileId: freelancer.freelancerProfile.id,
      amount: 2500,
      description: "REST API development for inventory management. Includes auth, CRUD endpoints, and documentation.",
      status: "ACTIVE",
    },
  });

  // Ensure both users have verified emails so they can log in
  await prisma.user.updateMany({
    where: { email: { in: ["techcorp@example.com", "alex@example.com"] } },
    data: { emailVerified: new Date() },
  });

  console.log("Created contract:", contract.id);
  console.log("Job:", job.title);
  console.log("Amount: $2,500");
  console.log("Status: ACTIVE (ready to fund)");
  console.log("");
  console.log("Login as techcorp@example.com / Password123");
  console.log("Go to /dashboard/contracts/" + contract.id);
  console.log('Click "Fund Contract" and use card 4242 4242 4242 4242');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
