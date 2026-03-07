import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data (order matters for FK constraints)
  await prisma.adminAction.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.job.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.freelancerProfile.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.user.deleteMany();
  await prisma.skill.deleteMany();

  const passwordHash = await bcrypt.hash("Password123", 12);

  // Seed skills
  const skillNames = [
    "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Python",
    "PostgreSQL", "MongoDB", "GraphQL", "REST API", "Docker", "AWS",
    "Tailwind CSS", "CSS", "HTML", "Vue.js", "Go", "Java", "PHP", "Laravel",
    "UI/UX Design", "Figma", "SEO", "Content Writing", "Data Analysis",
  ];

  const skills = await Promise.all(
    skillNames.map((name) => prisma.skill.create({ data: { name } }))
  );

  const skillMap = Object.fromEntries(skills.map((s) => [s.name, s]));

  // =================== ADMIN ===================
  const admin = await prisma.user.create({
    data: {
      email: "admin@freelancehub.com",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log("Created admin:", admin.email);

  // =================== CLIENTS ===================
  const client1 = await prisma.user.create({
    data: {
      email: "techcorp@example.com",
      passwordHash,
      role: "CLIENT",
      clientProfile: {
        create: {
          companyName: "TechCorp Solutions",
          companyDescription: "We build innovative software solutions for enterprise clients across multiple industries.",
          website: "https://techcorp.example.com",
          industry: "Technology",
          completionStatus: 100,
        },
      },
    },
    include: { clientProfile: true },
  });

  const client2 = await prisma.user.create({
    data: {
      email: "designstudio@example.com",
      passwordHash,
      role: "CLIENT",
      clientProfile: {
        create: {
          companyName: "Creative Design Studio",
          companyDescription: "Award-winning design agency specializing in brand identity and digital experiences.",
          website: "https://designstudio.example.com",
          industry: "Media & Entertainment",
          completionStatus: 100,
        },
      },
    },
    include: { clientProfile: true },
  });

  const client3 = await prisma.user.create({
    data: {
      email: "startupventures@example.com",
      passwordHash,
      role: "CLIENT",
      clientProfile: {
        create: {
          companyName: "Startup Ventures",
          companyDescription: "Early-stage startup building the next generation of fintech tools.",
          industry: "Finance",
          completionStatus: 80,
        },
      },
    },
    include: { clientProfile: true },
  });

  console.log("Created clients:", client1.email, client2.email, client3.email);

  // =================== FREELANCERS ===================
  const freelancer1 = await prisma.user.create({
    data: {
      email: "alex@example.com",
      passwordHash,
      role: "FREELANCER",
      freelancerProfile: {
        create: {
          title: "Full-Stack Developer",
          bio: "I'm a passionate full-stack developer with 6 years of experience building scalable web applications. I specialize in React, Next.js, and Node.js with a strong eye for UX. I've delivered 50+ successful projects and pride myself on clean, maintainable code.",
          hourlyRate: 85,
          completionStatus: 100,
          skills: {
            connect: [
              { id: skillMap["React"].id },
              { id: skillMap["Next.js"].id },
              { id: skillMap["TypeScript"].id },
              { id: skillMap["Node.js"].id },
              { id: skillMap["PostgreSQL"].id },
            ],
          },
          portfolioItems: {
            create: [
              {
                title: "E-commerce Platform",
                description: "Built a full-featured e-commerce site with Next.js, Stripe payments, and PostgreSQL. Handles 10k+ daily users.",
                url: "https://example.com/ecommerce",
              },
              {
                title: "SaaS Dashboard",
                description: "Developed a real-time analytics dashboard for a B2B SaaS company with complex data visualization.",
                url: "https://example.com/dashboard",
              },
            ],
          },
        },
      },
    },
    include: { freelancerProfile: true },
  });

  const freelancer2 = await prisma.user.create({
    data: {
      email: "sarah@example.com",
      passwordHash,
      role: "FREELANCER",
      freelancerProfile: {
        create: {
          title: "UI/UX Designer & Frontend Developer",
          bio: "Designer turned developer with 5 years of crafting beautiful, user-centered digital experiences. I bridge the gap between design and engineering to deliver pixel-perfect implementations that users love.",
          hourlyRate: 75,
          completionStatus: 100,
          skills: {
            connect: [
              { id: skillMap["UI/UX Design"].id },
              { id: skillMap["Figma"].id },
              { id: skillMap["React"].id },
              { id: skillMap["TypeScript"].id },
              { id: skillMap["Tailwind CSS"].id },
            ],
          },
          portfolioItems: {
            create: [
              {
                title: "Mobile Banking App Design",
                description: "Complete UX redesign of a mobile banking app. Increased user satisfaction by 40%.",
                url: "https://example.com/banking",
              },
              {
                title: "Design System",
                description: "Built a comprehensive design system with 100+ components for a Fortune 500 company.",
              },
            ],
          },
        },
      },
    },
    include: { freelancerProfile: true },
  });

  const freelancer3 = await prisma.user.create({
    data: {
      email: "mike@example.com",
      passwordHash,
      role: "FREELANCER",
      freelancerProfile: {
        create: {
          title: "Python & Data Science Expert",
          bio: "Data scientist and Python expert with 8 years of experience. Specialized in machine learning, data analysis, and building data pipelines. I help businesses make sense of their data and build intelligent systems.",
          hourlyRate: 95,
          completionStatus: 100,
          skills: {
            connect: [
              { id: skillMap["Python"].id },
              { id: skillMap["Data Analysis"].id },
              { id: skillMap["PostgreSQL"].id },
              { id: skillMap["Docker"].id },
              { id: skillMap["AWS"].id },
            ],
          },
          portfolioItems: {
            create: [
              {
                title: "Sales Analytics Pipeline",
                description: "Built an end-to-end ETL pipeline and analytics dashboard for a retail company with 1M+ transactions/day.",
                url: "https://example.com/pipeline",
              },
            ],
          },
        },
      },
    },
    include: { freelancerProfile: true },
  });

  console.log("Created freelancers:", freelancer1.email, freelancer2.email, freelancer3.email);

  // =================== JOBS ===================
  const job1 = await prisma.job.create({
    data: {
      title: "Build a Modern E-commerce Website with Next.js",
      description: `We're looking for an experienced Next.js developer to build our new e-commerce platform from scratch.

**What we need:**
- Product catalog with categories and search
- Shopping cart and checkout with Stripe integration
- User accounts and order history
- Admin dashboard for product management
- Responsive design for mobile and desktop

**Technical requirements:**
- Next.js 14 with App Router
- TypeScript
- PostgreSQL for data storage
- Stripe for payments
- Tailwind CSS for styling

We expect clean, well-documented code with tests. The project should be deployment-ready on Vercel.`,
      category: "Web Development",
      budgetMin: 3000,
      budgetMax: 6000,
      timeline: "1-3 months",
      status: "OPEN",
      clientProfileId: client1.clientProfile!.id,
      skills: {
        connect: [
          { id: skillMap["Next.js"].id },
          { id: skillMap["React"].id },
          { id: skillMap["TypeScript"].id },
          { id: skillMap["PostgreSQL"].id },
        ],
      },
    },
  });

  const job2 = await prisma.job.create({
    data: {
      title: "Design Brand Identity and Website for Tech Startup",
      description: `We're a new tech startup in the fintech space looking for a talented designer to create our brand identity and design our marketing website.

**Deliverables:**
- Logo and brand guidelines (colors, typography, tone)
- Landing page design (desktop + mobile)
- 5-6 interior page designs
- Design system/component library in Figma

**Requirements:**
- Strong portfolio in brand identity
- Experience with B2B tech companies
- Figma proficiency`,
      category: "Design & Creative",
      budgetMin: 2000,
      budgetMax: 4000,
      timeline: "1-3 months",
      status: "OPEN",
      clientProfileId: client2.clientProfile!.id,
      skills: {
        connect: [
          { id: skillMap["UI/UX Design"].id },
          { id: skillMap["Figma"].id },
        ],
      },
    },
  });

  const job3 = await prisma.job.create({
    data: {
      title: "Data Pipeline Development and Analytics Dashboard",
      description: `We need an experienced data engineer to build our data infrastructure and analytics dashboard.

**Project scope:**
- Design and implement ETL pipelines for sales and marketing data
- Build a PostgreSQL data warehouse
- Create an analytics dashboard with key business metrics
- Set up automated reporting`,
      category: "Data Science & Analytics",
      budgetMin: 4000,
      budgetMax: 8000,
      timeline: "3-6 months",
      status: "OPEN",
      clientProfileId: client1.clientProfile!.id,
      skills: {
        connect: [
          { id: skillMap["Python"].id },
          { id: skillMap["PostgreSQL"].id },
          { id: skillMap["Data Analysis"].id },
          { id: skillMap["AWS"].id },
          { id: skillMap["Docker"].id },
        ],
      },
    },
  });

  const job4 = await prisma.job.create({
    data: {
      title: "React Native Mobile App for Fitness Tracking",
      description: `We want to build a fitness tracking mobile app for iOS and Android.

**Features:**
- Workout logging and tracking
- Exercise library with videos
- Progress charts and analytics
- Social features (share workouts, challenges)
- Integration with Apple Health / Google Fit`,
      category: "Mobile Development",
      budgetMin: 8000,
      budgetMax: 15000,
      timeline: "3-6 months",
      status: "OPEN",
      clientProfileId: client2.clientProfile!.id,
      skills: {
        connect: [
          { id: skillMap["React"].id },
          { id: skillMap["TypeScript"].id },
          { id: skillMap["JavaScript"].id },
        ],
      },
    },
  });

  const job5 = await prisma.job.create({
    data: {
      title: "Content Writer for Tech Blog (Ongoing)",
      description: `We're looking for a tech-savvy content writer to create engaging articles for our developer-focused blog.

**What you'll write:**
- Technical tutorials and how-tos
- Industry news and analysis
- 4-6 articles per month, 1500-3000 words each`,
      category: "Writing & Translation",
      budgetMin: 500,
      budgetMax: 1200,
      timeline: "Ongoing",
      status: "OPEN",
      clientProfileId: client1.clientProfile!.id,
      skills: {
        connect: [
          { id: skillMap["Content Writing"].id },
          { id: skillMap["SEO"].id },
        ],
      },
    },
  });

  // A filled job for the completed contract scenario
  const job6 = await prisma.job.create({
    data: {
      title: "GraphQL API Development for SaaS Platform",
      description: `Build a robust GraphQL API for our SaaS platform with authentication, subscriptions, and real-time updates.`,
      category: "Web Development",
      budgetMin: 5000,
      budgetMax: 9000,
      timeline: "2-3 months",
      status: "FILLED",
      clientProfileId: client3.clientProfile!.id,
      skills: {
        connect: [
          { id: skillMap["GraphQL"].id },
          { id: skillMap["Node.js"].id },
          { id: skillMap["TypeScript"].id },
        ],
      },
    },
  });

  console.log("Created jobs:", job1.id, job2.id, job3.id, job4.id, job5.id, job6.id);

  // =================== APPLICATIONS ===================
  const app1 = await prisma.jobApplication.create({
    data: {
      jobId: job1.id,
      freelancerProfileId: freelancer1.freelancerProfile!.id,
      proposalText: `I'd love to work on this e-commerce project! I have extensive experience building Next.js applications and have built 3 similar e-commerce platforms in the past.

My approach:
1. Start with architecture planning and data modeling
2. Set up Next.js with TypeScript and the chosen database
3. Implement core features iteratively with regular demos
4. Integrate Stripe with proper error handling and webhooks
5. Ensure comprehensive testing before delivery`,
      bidAmount: 4500,
      status: "SHORTLISTED",
    },
  });

  const app2 = await prisma.jobApplication.create({
    data: {
      jobId: job1.id,
      freelancerProfileId: freelancer2.freelancerProfile!.id,
      proposalText: `Hi! While my primary expertise is in design and frontend, I've worked on several full-stack Next.js projects and would love to bring both strong technical skills AND beautiful UI to your e-commerce platform.`,
      bidAmount: 5000,
      status: "SUBMITTED",
    },
  });

  const app3 = await prisma.jobApplication.create({
    data: {
      jobId: job2.id,
      freelancerProfileId: freelancer2.freelancerProfile!.id,
      proposalText: `This project is exactly in my wheelhouse! I specialize in brand identity for tech companies and have worked with 20+ startups. For fintech companies specifically, trust and simplicity are the key design principles.`,
      bidAmount: 3200,
      status: "SUBMITTED",
    },
  });

  const app4 = await prisma.jobApplication.create({
    data: {
      jobId: job3.id,
      freelancerProfileId: freelancer3.freelancerProfile!.id,
      proposalText: `This is a great project and aligns perfectly with my expertise. I've built data pipelines and analytics dashboards for 15+ companies across various industries.`,
      bidAmount: 6500,
      status: "SUBMITTED",
    },
  });

  // Hired application for completed contract
  const app5 = await prisma.jobApplication.create({
    data: {
      jobId: job6.id,
      freelancerProfileId: freelancer1.freelancerProfile!.id,
      proposalText: `I have extensive experience building GraphQL APIs. I'll deliver a robust, scalable API with proper authentication and real-time subscriptions.`,
      bidAmount: 7000,
      status: "HIRED",
    },
  });

  console.log("Created applications:", app1.id, app2.id, app3.id, app4.id, app5.id);

  // =================== CONVERSATIONS & MESSAGES ===================
  // Conversation for shortlisted application
  const conv1 = await prisma.conversation.create({
    data: { jobApplicationId: app1.id },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv1.id,
        senderId: client1.id,
        content: "Hi Alex! We've shortlisted your proposal. Can you tell us more about your timeline for this project?",
        readAt: new Date(),
      },
      {
        conversationId: conv1.id,
        senderId: freelancer1.id,
        content: "Thanks for considering me! I can start immediately. I estimate 8 weeks for the full delivery — 2 weeks for setup and architecture, 4 weeks for core features, 2 weeks for polish and testing.",
        readAt: new Date(),
      },
      {
        conversationId: conv1.id,
        senderId: client1.id,
        content: "That sounds great. We'd like to proceed. Can you do a video call this week to go over the requirements in detail?",
        readAt: new Date(),
      },
      {
        conversationId: conv1.id,
        senderId: freelancer1.id,
        content: "Absolutely! I'm available Tuesday or Thursday afternoon. Which works better for you?",
      },
    ],
  });

  // Conversation for the hired application
  const conv2 = await prisma.conversation.create({
    data: { jobApplicationId: app5.id },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv2.id,
        senderId: client3.id,
        content: "Alex, great to have you on board! The contract is ready for your review.",
        readAt: new Date(),
      },
      {
        conversationId: conv2.id,
        senderId: freelancer1.id,
        content: "Fantastic! I've reviewed it and everything looks good. I've accepted the contract.",
        readAt: new Date(),
      },
      {
        conversationId: conv2.id,
        senderId: client3.id,
        content: "Payment has been processed. Please go ahead with the implementation.",
        readAt: new Date(),
      },
      {
        conversationId: conv2.id,
        senderId: freelancer1.id,
        content: "Excellent! I'll start today. I'll post weekly progress updates here.",
        readAt: new Date(),
      },
    ],
  });

  console.log("Created conversations and messages");

  // =================== CONTRACTS ===================
  // Active contract (shortlisted application, manually created)
  const contract1 = await prisma.contract.create({
    data: {
      jobId: job1.id,
      clientProfileId: client1.clientProfile!.id,
      freelancerProfileId: freelancer1.freelancerProfile!.id,
      amount: 4500,
      description: "Full-stack e-commerce platform development with Next.js, TypeScript, and Stripe integration. Includes all features outlined in the job posting.",
      status: "ACTIVE",
    },
  });

  // Payment for contract1
  await prisma.payment.create({
    data: {
      contractId: contract1.id,
      amount: 4500,
      platformFee: 450,
      stripePaymentId: "pi_demo_contract1",
      stripeSessionId: "cs_demo_contract1",
      status: "COMPLETED",
    },
  });

  // Completed contract (job6 + app5)
  const contract2 = await prisma.contract.create({
    data: {
      jobId: job6.id,
      clientProfileId: client3.clientProfile!.id,
      freelancerProfileId: freelancer1.freelancerProfile!.id,
      amount: 7000,
      description: "GraphQL API development for SaaS platform with authentication, subscriptions, and real-time updates.",
      status: "COMPLETED",
    },
  });

  // Payment for contract2
  await prisma.payment.create({
    data: {
      contractId: contract2.id,
      amount: 7000,
      platformFee: 700,
      stripePaymentId: "pi_demo_contract2",
      stripeSessionId: "cs_demo_contract2",
      status: "COMPLETED",
    },
  });

  // Pending contract (design job)
  const contract3 = await prisma.contract.create({
    data: {
      jobId: job2.id,
      clientProfileId: client2.clientProfile!.id,
      freelancerProfileId: freelancer2.freelancerProfile!.id,
      amount: 3200,
      description: "Brand identity and website design for fintech startup. Includes logo, brand guidelines, and 6 page designs in Figma.",
      status: "PENDING",
    },
  });

  console.log("Created contracts:", contract1.id, contract2.id, contract3.id);

  // =================== REVIEWS ===================
  // Review for the completed contract
  await prisma.review.create({
    data: {
      contractId: contract2.id,
      reviewerId: client3.id,
      revieweeId: freelancer1.id,
      rating: 5,
      comment: "Alex delivered exceptional work! The GraphQL API is well-structured, thoroughly documented, and performs brilliantly. He was communicative throughout and delivered ahead of schedule. Would absolutely hire again.",
    },
  });

  // Also create a few more reviews for alex from previous clients (for demo purposes, linked to contract1 as well)
  // Note: We need separate completed contracts for this. Let's add extra review data via a slightly different approach:
  // We'll create another review from client2 on a hypothetical past contract represented by contract2's job
  // In production this would require more contracts, but for seeding purposes we add it:

  console.log("Created reviews");

  // =================== ADMIN ACTIONS ===================
  await prisma.adminAction.createMany({
    data: [
      {
        adminId: admin.id,
        targetType: "USER",
        targetId: freelancer3.id,
        action: "SUSPEND",
        reason: "Account flagged for review — duplicate profile detected.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Suspend mike for demo purposes (can be reactivated)
  await prisma.user.update({
    where: { id: freelancer3.id },
    data: { suspended: true },
  });

  console.log("Created admin actions");

  console.log("\n=== Seed Complete ===");
  console.log("Demo accounts (all use password: Password123):");
  console.log("  Admin:      admin@freelancehub.com");
  console.log("  Client 1:   techcorp@example.com");
  console.log("  Client 2:   designstudio@example.com");
  console.log("  Client 3:   startupventures@example.com");
  console.log("  Freelancer: alex@example.com");
  console.log("  Freelancer: sarah@example.com");
  console.log("  Freelancer: mike@example.com (suspended)");
  console.log("\nDemo data:");
  console.log("  6 jobs (5 open, 1 filled)");
  console.log("  5 applications");
  console.log("  2 conversations with messages");
  console.log("  3 contracts (1 active+funded, 1 completed, 1 pending)");
  console.log("  2 payments (both COMPLETED)");
  console.log("  1 review (5 stars for Alex)");
  console.log("  1 admin action (mike suspended)");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
