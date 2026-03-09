import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Get all clients and freelancers
  const [client1, client2, client3] = await Promise.all([
    prisma.user.findUnique({ where: { email: "techcorp@example.com" }, include: { clientProfile: true } }),
    prisma.user.findUnique({ where: { email: "designstudio@example.com" }, include: { clientProfile: true } }),
    prisma.user.findUnique({ where: { email: "startupventures@example.com" }, include: { clientProfile: true } }),
  ]);

  const [freelancer1, freelancer2] = await Promise.all([
    prisma.user.findUnique({ where: { email: "alex@example.com" }, include: { freelancerProfile: true } }),
    prisma.user.findUnique({ where: { email: "sarah@example.com" }, include: { freelancerProfile: true } }),
  ]);

  // Verify emails for all users
  await prisma.user.updateMany({
    where: {
      email: {
        in: [
          "techcorp@example.com", "designstudio@example.com", "startupventures@example.com",
          "alex@example.com", "sarah@example.com",
        ],
      },
    },
    data: { emailVerified: new Date() },
  });

  const c1 = client1!.clientProfile!;
  const c2 = client2!.clientProfile!;
  const c3 = client3!.clientProfile!;
  const f1 = freelancer1!.freelancerProfile!;
  const f2 = freelancer2!.freelancerProfile!;

  // Contract 1: ACTIVE, funded — alex + designstudio
  const job1 = await prisma.job.create({
    data: {
      title: "Redesign Company Dashboard UI",
      description: "Modernize our internal dashboard with a fresh design system.",
      category: "Design & Creative",
      budgetMin: 1500, budgetMax: 3000, timeline: "1-3 months", status: "FILLED",
      clientProfileId: c2.id,
    },
  });
  const contract1 = await prisma.contract.create({
    data: {
      jobId: job1.id, clientProfileId: c2.id, freelancerProfileId: f1.id,
      amount: 2200,
      description: "Dashboard UI redesign with new component library and dark mode support.",
      status: "ACTIVE",
    },
  });
  await prisma.payment.create({
    data: {
      contractId: contract1.id, amount: 2200, platformFee: 220,
      stripePaymentId: "pi_test_dash_redesign", stripeSessionId: "cs_test_dash_redesign",
      status: "COMPLETED",
    },
  });
  console.log("1. ACTIVE + funded:", contract1.id, "- Redesign Company Dashboard UI ($2,200)");

  // Contract 2: COMPLETED, funded — alex + startupventures
  const job2 = await prisma.job.create({
    data: {
      title: "Build Authentication Microservice",
      description: "JWT-based auth service with OAuth2 support.",
      category: "Web Development",
      budgetMin: 3000, budgetMax: 5000, timeline: "1-3 months", status: "FILLED",
      clientProfileId: c3.id,
    },
  });
  const contract2 = await prisma.contract.create({
    data: {
      jobId: job2.id, clientProfileId: c3.id, freelancerProfileId: f1.id,
      amount: 4000,
      description: "Auth microservice with JWT, refresh tokens, OAuth2 (Google, GitHub), and rate limiting.",
      status: "COMPLETED",
    },
  });
  await prisma.payment.create({
    data: {
      contractId: contract2.id, amount: 4000, platformFee: 400,
      stripePaymentId: "pi_test_auth_service", stripeSessionId: "cs_test_auth_service",
      status: "COMPLETED",
    },
  });
  console.log("2. COMPLETED + funded:", contract2.id, "- Build Authentication Microservice ($4,000)");

  // Contract 3: COMPLETED, funded — sarah + techcorp
  const job3 = await prisma.job.create({
    data: {
      title: "Mobile App Landing Page Design",
      description: "High-converting landing page for our new mobile app launch.",
      category: "Design & Creative",
      budgetMin: 800, budgetMax: 1500, timeline: "Less than 1 month", status: "FILLED",
      clientProfileId: c1.id,
    },
  });
  const contract3 = await prisma.contract.create({
    data: {
      jobId: job3.id, clientProfileId: c1.id, freelancerProfileId: f2.id,
      amount: 1200,
      description: "Landing page design with hero section, features, testimonials, pricing, and CTA.",
      status: "COMPLETED",
    },
  });
  await prisma.payment.create({
    data: {
      contractId: contract3.id, amount: 1200, platformFee: 120,
      stripePaymentId: "pi_test_landing_page", stripeSessionId: "cs_test_landing_page",
      status: "COMPLETED",
    },
  });
  console.log("3. COMPLETED + funded:", contract3.id, "- Mobile App Landing Page ($1,200)");

  // Contract 4: ACTIVE, funded — sarah + designstudio
  const job4 = await prisma.job.create({
    data: {
      title: "Design System for SaaS Product",
      description: "Comprehensive design system with reusable components.",
      category: "Design & Creative",
      budgetMin: 2500, budgetMax: 5000, timeline: "1-3 months", status: "FILLED",
      clientProfileId: c2.id,
    },
  });
  const contract4 = await prisma.contract.create({
    data: {
      jobId: job4.id, clientProfileId: c2.id, freelancerProfileId: f2.id,
      amount: 3500,
      description: "Full design system: tokens, components, patterns, documentation in Figma and Storybook.",
      status: "ACTIVE",
    },
  });
  await prisma.payment.create({
    data: {
      contractId: contract4.id, amount: 3500, platformFee: 350,
      stripePaymentId: "pi_test_design_system", stripeSessionId: "cs_test_design_system",
      status: "COMPLETED",
    },
  });
  console.log("4. ACTIVE + funded:", contract4.id, "- Design System for SaaS ($3,500)");

  // Contract 5: PENDING (not yet accepted) — alex + techcorp
  const job5 = await prisma.job.create({
    data: {
      title: "CI/CD Pipeline Setup with GitHub Actions",
      description: "Automated testing, building, and deployment pipeline.",
      category: "DevOps & Cloud",
      budgetMin: 1000, budgetMax: 2000, timeline: "Less than 1 month", status: "FILLED",
      clientProfileId: c1.id,
    },
  });
  const contract5 = await prisma.contract.create({
    data: {
      jobId: job5.id, clientProfileId: c1.id, freelancerProfileId: f1.id,
      amount: 1500,
      description: "GitHub Actions CI/CD: lint, test, build, deploy to Vercel (staging + production).",
      status: "PENDING",
    },
  });
  console.log("5. PENDING:", contract5.id, "- CI/CD Pipeline Setup ($1,500)");

  // Contract 6: ACTIVE, not yet funded — alex + designstudio
  const job6 = await prisma.job.create({
    data: {
      title: "API Integration with Third-Party Services",
      description: "Integrate Twilio, SendGrid, and Stripe APIs into existing platform.",
      category: "Web Development",
      budgetMin: 2000, budgetMax: 4000, timeline: "1-3 months", status: "FILLED",
      clientProfileId: c2.id,
    },
  });
  const contract6 = await prisma.contract.create({
    data: {
      jobId: job6.id, clientProfileId: c2.id, freelancerProfileId: f1.id,
      amount: 3000,
      description: "Integration of Twilio SMS, SendGrid email, and Stripe billing into the platform.",
      status: "ACTIVE",
    },
  });
  console.log("6. ACTIVE (not funded):", contract6.id, "- API Integration ($3,000)");

  // Contract 7: COMPLETED, funded — sarah + startupventures
  const job7 = await prisma.job.create({
    data: {
      title: "Onboarding Flow UI/UX Redesign",
      description: "Redesign the user onboarding experience to improve conversion.",
      category: "Design & Creative",
      budgetMin: 1500, budgetMax: 2500, timeline: "Less than 1 month", status: "FILLED",
      clientProfileId: c3.id,
    },
  });
  const contract7 = await prisma.contract.create({
    data: {
      jobId: job7.id, clientProfileId: c3.id, freelancerProfileId: f2.id,
      amount: 2000,
      description: "Complete onboarding flow redesign: signup, profile setup, first-use tutorial.",
      status: "COMPLETED",
    },
  });
  await prisma.payment.create({
    data: {
      contractId: contract7.id, amount: 2000, platformFee: 200,
      stripePaymentId: "pi_test_onboarding", stripeSessionId: "cs_test_onboarding",
      status: "COMPLETED",
    },
  });
  console.log("7. COMPLETED + funded:", contract7.id, "- Onboarding Flow Redesign ($2,000)");

  console.log("\n=== Summary ===");
  console.log("Created 7 new contracts:");
  console.log("  Alex (alex@example.com): 4 contracts (2 active, 1 completed, 1 pending)");
  console.log("  Sarah (sarah@example.com): 3 contracts (1 active, 2 completed)");
  console.log("  COMPLETED contracts with payments ready for withdrawal: #2, #3, #7");
  console.log("  ACTIVE contracts with payments (not yet withdrawable): #1, #4");
  console.log("  ACTIVE contract without payment (can fund via Stripe): #6");
  console.log("  PENDING contract (needs acceptance): #5");
  console.log("\nAll passwords: Password123");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
