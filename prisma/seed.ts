import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data (order matters for FK constraints)
  await prisma.contactSubmission.deleteMany();
  await prisma.adminAction.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.milestone.deleteMany();
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

  // =================== SKILLS ===================
  const skillNames = [
    "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Python",
    "PostgreSQL", "MongoDB", "GraphQL", "REST API", "Docker", "AWS",
    "Tailwind CSS", "CSS", "HTML", "Vue.js", "Go", "Java", "PHP", "Laravel",
    "UI/UX Design", "Figma", "SEO", "Content Writing", "Data Analysis",
    "React Native", "Swift", "Kotlin", "Flutter", "Firebase",
    "Redis", "Elasticsearch", "Kubernetes", "Terraform", "CI/CD",
    "Machine Learning", "TensorFlow", "NLP", "Computer Vision",
    "Shopify", "WordPress", "Webflow", "Stripe API",
    "Copywriting", "Technical Writing", "Video Editing", "Motion Graphics",
    "Illustration", "3D Modeling", "Blender",
  ];

  const skills = await Promise.all(
    skillNames.map((name) => prisma.skill.create({ data: { name } }))
  );
  const s = Object.fromEntries(skills.map((sk) => [sk.name, sk]));
  console.log(`Created ${skills.length} skills`);

  // =================== ADMIN ===================
  const admin = await prisma.user.create({
    data: { email: "admin@tryletswork.com", passwordHash, role: "ADMIN" },
  });

  // =================== CLIENTS (8) ===================
  const clientsData = [
    { email: "techcorp@example.com", company: "TechCorp Solutions", desc: "We build innovative software solutions for enterprise clients across multiple industries.", website: "https://techcorp.example.com", industry: "Technology" },
    { email: "designstudio@example.com", company: "Creative Design Studio", desc: "Award-winning design agency specializing in brand identity and digital experiences.", website: "https://designstudio.example.com", industry: "Media & Entertainment" },
    { email: "startupventures@example.com", company: "Startup Ventures", desc: "Early-stage startup building the next generation of fintech tools.", website: undefined, industry: "Finance" },
    { email: "healthplus@example.com", company: "HealthPlus Digital", desc: "Digital health company building telemedicine and patient management solutions for clinics worldwide.", website: "https://healthplus.example.com", industry: "Healthcare" },
    { email: "greenleaf@example.com", company: "GreenLeaf Analytics", desc: "Environmental tech company using data science to help organizations reduce their carbon footprint.", website: "https://greenleaf.example.com", industry: "Environment" },
    { email: "novalearn@example.com", company: "NovaLearn", desc: "EdTech startup creating AI-powered personalized learning experiences for K-12 students.", website: "https://novalearn.example.com", industry: "Education" },
    { email: "urbanlogistics@example.com", company: "Urban Logistics Co", desc: "Last-mile delivery logistics platform optimizing routes and fleet management for urban areas.", website: undefined, industry: "Logistics" },
    { email: "foodies@example.com", company: "Foodies Marketplace", desc: "Online marketplace connecting local food artisans with customers who appreciate handcrafted, sustainable food.", website: "https://foodies.example.com", industry: "Food & Beverage" },
  ];

  const clients: any[] = [];
  for (const c of clientsData) {
    const user = await prisma.user.create({
      data: {
        email: c.email, passwordHash, role: "CLIENT",
        clientProfile: {
          create: { companyName: c.company, companyDescription: c.desc, website: c.website, industry: c.industry, completionStatus: 100 },
        },
      },
      include: { clientProfile: true },
    });
    clients.push(user);
  }
  console.log(`Created ${clients.length} clients`);

  // =================== FREELANCERS (12) ===================
  const freelancersData = [
    {
      email: "alex@example.com", title: "Full-Stack Developer",
      bio: "Passionate full-stack developer with 6 years of experience building scalable web applications. I specialize in React, Next.js, and Node.js with a strong eye for UX. Delivered 50+ successful projects.",
      rate: 85, phone: "+1-555-0101", whatsapp: "+15550101",
      skills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL"],
      portfolio: [
        { title: "E-commerce Platform", description: "Full-featured e-commerce site with Next.js and PostgreSQL. Handles 10k+ daily users.", url: "https://example.com/ecommerce" },
        { title: "SaaS Dashboard", description: "Real-time analytics dashboard for a B2B SaaS company with complex data visualization.", url: "https://example.com/dashboard" },
      ],
    },
    {
      email: "sarah@example.com", title: "UI/UX Designer & Frontend Developer",
      bio: "Designer turned developer with 5 years of crafting beautiful, user-centered digital experiences. I bridge the gap between design and engineering to deliver pixel-perfect implementations.",
      rate: 75, phone: "+1-555-0102", whatsapp: "+15550102",
      skills: ["UI/UX Design", "Figma", "React", "TypeScript", "Tailwind CSS"],
      portfolio: [
        { title: "Mobile Banking App Design", description: "Complete UX redesign of a mobile banking app. Increased user satisfaction by 40%.", url: "https://example.com/banking" },
        { title: "Design System", description: "Comprehensive design system with 100+ components for a Fortune 500 company." },
      ],
    },
    {
      email: "mike@example.com", title: "Python & Data Science Expert",
      bio: "Data scientist and Python expert with 8 years of experience. Specialized in machine learning, data analysis, and building data pipelines.",
      rate: 95, phone: "+1-555-0103", whatsapp: "+15550103",
      skills: ["Python", "Data Analysis", "PostgreSQL", "Docker", "AWS"],
      portfolio: [
        { title: "Sales Analytics Pipeline", description: "End-to-end ETL pipeline and analytics dashboard for a retail company with 1M+ transactions/day.", url: "https://example.com/pipeline" },
      ],
    },
    {
      email: "elena@example.com", title: "Mobile App Developer",
      bio: "Cross-platform mobile developer with 4 years building production apps in React Native and Flutter. Published 12 apps on App Store and Play Store with 500k+ combined downloads.",
      rate: 90, phone: "+44-7700-900100", whatsapp: "+447700900100",
      skills: ["React Native", "Flutter", "TypeScript", "Firebase", "REST API"],
      portfolio: [
        { title: "Fitness Tracker App", description: "Cross-platform fitness app with workout tracking, social features, and Apple Health integration. 100k+ downloads.", url: "https://example.com/fitness" },
        { title: "Food Delivery App", description: "Real-time food delivery app with GPS tracking, in-app payments, and push notifications.", url: "https://example.com/delivery" },
      ],
    },
    {
      email: "james@example.com", title: "DevOps & Cloud Architect",
      bio: "AWS-certified cloud architect with 7 years of experience. I help startups and enterprises build reliable, scalable infrastructure. Expert in containerization, CI/CD, and infrastructure as code.",
      rate: 110, phone: "+1-555-0105", whatsapp: "+15550105",
      skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
      portfolio: [
        { title: "Microservices Migration", description: "Migrated a monolithic Rails app to 15 microservices on Kubernetes. Reduced deployment time from 2hrs to 8min.", url: "https://example.com/k8s" },
        { title: "Multi-Region AWS Setup", description: "Designed multi-region active-active architecture handling 50k req/sec with 99.99% uptime." },
      ],
    },
    {
      email: "priya@example.com", title: "Machine Learning Engineer",
      bio: "ML engineer with a PhD in Computer Science. 5 years building production ML systems. Specialized in NLP, computer vision, and recommendation systems.",
      rate: 120, phone: "+91-98765-43210", whatsapp: "+919876543210",
      skills: ["Python", "Machine Learning", "TensorFlow", "NLP", "Computer Vision"],
      portfolio: [
        { title: "Product Recommendation Engine", description: "Built a collaborative filtering recommendation system serving 2M users, increasing conversion by 25%.", url: "https://example.com/recommender" },
        { title: "Medical Image Analysis", description: "CNN-based diagnostic tool for detecting anomalies in X-rays with 96% accuracy.", url: "https://example.com/medical-ai" },
      ],
    },
    {
      email: "lucas@example.com", title: "WordPress & Shopify Expert",
      bio: "E-commerce specialist with 6 years building and customizing online stores. I help businesses launch fast with WordPress and Shopify, optimized for conversions and SEO.",
      rate: 55, phone: "+55-11-99999-0001", whatsapp: "+5511999990001",
      skills: ["WordPress", "Shopify", "HTML", "CSS", "SEO"],
      portfolio: [
        { title: "Luxury Fashion Store", description: "Custom Shopify Plus store with 3D product previews and AR try-on. $2M+ revenue in first year.", url: "https://example.com/fashion" },
        { title: "Multi-vendor Marketplace", description: "WordPress + WooCommerce marketplace with 200+ vendors and custom vendor dashboards." },
      ],
    },
    {
      email: "aisha@example.com", title: "Content Strategist & SEO Writer",
      bio: "Content strategist with 5 years helping SaaS companies grow organic traffic. I combine data-driven SEO with engaging storytelling. Helped clients achieve 3-10x traffic growth.",
      rate: 60, phone: "+971-50-123-4567", whatsapp: "+971501234567",
      skills: ["Content Writing", "SEO", "Copywriting", "Technical Writing"],
      portfolio: [
        { title: "SaaS Blog Strategy", description: "Built content strategy from scratch for a B2B SaaS company. Grew organic traffic from 5k to 80k monthly visitors in 12 months.", url: "https://example.com/saas-blog" },
        { title: "Technical Documentation", description: "Rewrote API documentation for a developer tools company. Support tickets dropped 40%." },
      ],
    },
    {
      email: "tomasz@example.com", title: "Go & Backend Engineer",
      bio: "Backend engineer with 9 years of experience. Specialized in Go and distributed systems. I build high-performance APIs and microservices that handle millions of requests.",
      rate: 100, phone: "+48-600-100-200", whatsapp: "+48600100200",
      skills: ["Go", "PostgreSQL", "Redis", "Docker", "Kubernetes"],
      portfolio: [
        { title: "Real-time Bidding Platform", description: "Built an ad-tech RTB platform in Go processing 500k bid requests/sec with <10ms p99 latency.", url: "https://example.com/rtb" },
        { title: "Payment Processing Service", description: "Designed a PCI-compliant payment service handling $50M+ in annual transactions." },
      ],
    },
    {
      email: "yuki@example.com", title: "Motion Designer & Video Editor",
      bio: "Creative motion designer with 4 years of experience in brand storytelling. I create stunning animations, explainer videos, and social media content that captures attention.",
      rate: 70, phone: "+81-90-1234-5678", whatsapp: "+819012345678",
      skills: ["Motion Graphics", "Video Editing", "Illustration", "Figma"],
      portfolio: [
        { title: "Product Launch Video", description: "60-second animated product launch video for a tech startup. 2M+ views on social media.", url: "https://example.com/launch-video" },
        { title: "Brand Animation Package", description: "Full brand animation toolkit including logo animation, transitions, and social templates." },
      ],
    },
    {
      email: "carlos@example.com", title: "Vue.js & Laravel Developer",
      bio: "Full-stack developer specializing in Vue.js and Laravel. 5 years building elegant web applications for startups. I focus on clean architecture and rapid delivery.",
      rate: 65, phone: "+34-612-345-678", whatsapp: "+34612345678",
      skills: ["Vue.js", "PHP", "Laravel", "PostgreSQL", "REST API"],
      portfolio: [
        { title: "Project Management Tool", description: "Built a Basecamp-like project management app with real-time updates, file sharing, and Gantt charts.", url: "https://example.com/pm-tool" },
        { title: "CRM System", description: "Custom CRM for a real estate agency with lead scoring, email automation, and analytics dashboard." },
      ],
    },
    {
      email: "nina@example.com", title: "3D Artist & Illustrator",
      bio: "Freelance 3D artist and illustrator with a passion for creating immersive visual experiences. 6 years working with game studios, ad agencies, and tech companies.",
      rate: 80, phone: "+49-170-1234567", whatsapp: "+491701234567",
      skills: ["3D Modeling", "Blender", "Illustration", "UI/UX Design", "Figma"],
      portfolio: [
        { title: "Game Environment Design", description: "Created 20+ detailed 3D environments for an indie RPG game. Featured on ArtStation trending.", url: "https://example.com/game-art" },
        { title: "Product Visualization", description: "Photorealistic 3D renders for a furniture company's online catalog. Replaced photography entirely.", url: "https://example.com/3d-furniture" },
      ],
    },
  ];

  const freelancers: any[] = [];
  for (const f of freelancersData) {
    const user = await prisma.user.create({
      data: {
        email: f.email, passwordHash, role: "FREELANCER",
        freelancerProfile: {
          create: {
            title: f.title, bio: f.bio, hourlyRate: f.rate, completionStatus: 100,
            phoneNumber: f.phone, whatsappNumber: f.whatsapp,
            skills: { connect: f.skills.map((name) => ({ id: s[name].id })) },
            portfolioItems: { create: f.portfolio.map((p) => ({ title: p.title, description: p.description, url: (p as { url?: string }).url })) },
          },
        },
      },
      include: { freelancerProfile: true },
    });
    freelancers.push(user);
  }
  console.log(`Created ${freelancers.length} freelancers`);

  // Helper to get freelancer/client by email
  const fl = (email: string) => freelancers.find((f) => f.email === email)!;
  const cl = (email: string) => clients.find((c) => c.email === email)!;

  // =================== JOBS (15) ===================
  const jobsData = [
    { title: "Build a Modern E-commerce Website with Next.js", desc: "We're looking for an experienced Next.js developer to build our new e-commerce platform from scratch.\n\n**What we need:**\n- Product catalog with categories and search\n- Shopping cart and checkout\n- User accounts and order history\n- Admin dashboard for product management\n- Responsive design for mobile and desktop\n\n**Technical requirements:**\n- Next.js with App Router\n- TypeScript\n- PostgreSQL\n- Tailwind CSS", category: "Web Development", min: 3000, max: 6000, timeline: "1-3 months", client: "techcorp@example.com", skills: ["Next.js", "React", "TypeScript", "PostgreSQL"], status: "OPEN" as const },
    { title: "Design Brand Identity and Website for Tech Startup", desc: "We're a new tech startup looking for a talented designer to create our brand identity and design our marketing website.\n\n**Deliverables:**\n- Logo and brand guidelines\n- Landing page design (desktop + mobile)\n- 5-6 interior page designs\n- Design system in Figma", category: "Design & Creative", min: 2000, max: 4000, timeline: "1-3 months", client: "designstudio@example.com", skills: ["UI/UX Design", "Figma"], status: "OPEN" as const },
    { title: "Data Pipeline Development and Analytics Dashboard", desc: "We need a data engineer to build our analytics infrastructure.\n\n**Scope:**\n- ETL pipelines for sales and marketing data\n- PostgreSQL data warehouse\n- Analytics dashboard with key metrics\n- Automated reporting", category: "Data Science & Analytics", min: 4000, max: 8000, timeline: "3-6 months", client: "techcorp@example.com", skills: ["Python", "PostgreSQL", "Data Analysis", "AWS", "Docker"], status: "OPEN" as const },
    { title: "React Native Mobile App for Fitness Tracking", desc: "Build a fitness tracking mobile app for iOS and Android.\n\n**Features:**\n- Workout logging and tracking\n- Exercise library with videos\n- Progress charts and analytics\n- Social features\n- Apple Health / Google Fit integration", category: "Mobile Development", min: 8000, max: 15000, timeline: "3-6 months", client: "designstudio@example.com", skills: ["React Native", "TypeScript", "Firebase"], status: "OPEN" as const },
    { title: "Content Writer for Tech Blog (Ongoing)", desc: "Looking for a tech-savvy content writer for our developer blog.\n\n**What you'll write:**\n- Technical tutorials and how-tos\n- Industry news and analysis\n- 4-6 articles per month, 1500-3000 words each", category: "Writing & Translation", min: 500, max: 1200, timeline: "Ongoing", client: "techcorp@example.com", skills: ["Content Writing", "SEO"], status: "OPEN" as const },
    { title: "GraphQL API Development for SaaS Platform", desc: "Build a robust GraphQL API for our SaaS platform with authentication, subscriptions, and real-time updates.", category: "Web Development", min: 5000, max: 9000, timeline: "2-3 months", client: "startupventures@example.com", skills: ["GraphQL", "Node.js", "TypeScript"], status: "FILLED" as const },
    { title: "Telemedicine Platform - Full Stack Development", desc: "Build a HIPAA-compliant telemedicine platform.\n\n**Requirements:**\n- Video consultations with WebRTC\n- Patient scheduling and management\n- Electronic health records integration\n- Prescription management\n- Mobile-responsive design", category: "Web Development", min: 12000, max: 25000, timeline: "3-6 months", client: "healthplus@example.com", skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker"], status: "OPEN" as const },
    { title: "Carbon Footprint Analytics Dashboard", desc: "Create an interactive dashboard for organizations to track and analyze their carbon emissions.\n\n**Features:**\n- Data ingestion from multiple sources\n- Interactive charts and visualizations\n- Benchmarking against industry standards\n- PDF report generation\n- Goal tracking and recommendations", category: "Data Science & Analytics", min: 6000, max: 10000, timeline: "2-3 months", client: "greenleaf@example.com", skills: ["Python", "React", "Data Analysis", "PostgreSQL"], status: "OPEN" as const },
    { title: "AI-Powered Learning Platform MVP", desc: "Build the MVP for our AI-powered personalized learning platform.\n\n**Core features:**\n- Student onboarding with skill assessment\n- AI-generated practice problems\n- Progress tracking and analytics\n- Parent/teacher dashboard\n- Gamification elements", category: "Web Development", min: 15000, max: 30000, timeline: "3-6 months", client: "novalearn@example.com", skills: ["Next.js", "Python", "Machine Learning", "PostgreSQL"], status: "OPEN" as const },
    { title: "Fleet Management Mobile App", desc: "Develop a mobile app for delivery drivers and fleet managers.\n\n**Features:**\n- Real-time GPS tracking\n- Route optimization\n- Delivery status updates\n- Driver performance metrics\n- Push notifications", category: "Mobile Development", min: 10000, max: 18000, timeline: "3-6 months", client: "urbanlogistics@example.com", skills: ["React Native", "TypeScript", "Firebase", "REST API"], status: "OPEN" as const },
    { title: "Shopify Store Setup & Custom Theme", desc: "Set up our Shopify store with a custom theme.\n\n**Deliverables:**\n- Custom Shopify theme based on our brand\n- Product catalog setup (200+ products)\n- Payment and shipping configuration\n- SEO optimization\n- Training documentation", category: "Web Development", min: 2000, max: 4000, timeline: "Less than 1 month", client: "foodies@example.com", skills: ["Shopify", "HTML", "CSS", "SEO"], status: "OPEN" as const },
    { title: "Explainer Video for Product Launch", desc: "Create a 90-second animated explainer video for our product launch.\n\n**Style:**\n- Modern, clean 2D animation\n- Matching our brand colors and style\n- Professional voiceover included\n- Background music and sound effects\n- Multiple format outputs (16:9, 9:16, 1:1)", category: "Design & Creative", min: 1500, max: 3000, timeline: "Less than 1 month", client: "novalearn@example.com", skills: ["Motion Graphics", "Video Editing", "Illustration"], status: "OPEN" as const },
    { title: "Kubernetes Cluster Setup & CI/CD Pipeline", desc: "Set up our production Kubernetes infrastructure.\n\n**Scope:**\n- Multi-node K8s cluster on AWS EKS\n- GitOps-based CI/CD with ArgoCD\n- Monitoring with Prometheus & Grafana\n- Log aggregation with ELK stack\n- Auto-scaling configuration\n- Security hardening", category: "DevOps & Cloud", min: 8000, max: 14000, timeline: "1-3 months", client: "urbanlogistics@example.com", skills: ["Kubernetes", "AWS", "Docker", "Terraform", "CI/CD"], status: "OPEN" as const },
    { title: "WordPress Blog Migration & Redesign", desc: "Migrate our existing blog to a new WordPress setup.\n\n**Requirements:**\n- Migrate 500+ existing posts with SEO preserved\n- New responsive theme design\n- Speed optimization (Core Web Vitals)\n- Newsletter integration\n- Custom author pages", category: "Web Development", min: 1500, max: 3000, timeline: "Less than 1 month", client: "greenleaf@example.com", skills: ["WordPress", "HTML", "CSS", "SEO"], status: "OPEN" as const },
    { title: "API Documentation & Developer Portal", desc: "Write comprehensive API documentation and build a developer portal.\n\n**Deliverables:**\n- OpenAPI/Swagger specification\n- Interactive API reference\n- Getting started guides\n- Code examples in 5 languages\n- Changelog and migration guides", category: "Writing & Translation", min: 3000, max: 5000, timeline: "1-3 months", client: "healthplus@example.com", skills: ["Technical Writing", "REST API", "HTML"], status: "OPEN" as const },
  ];

  const jobs: any[] = [];
  for (const j of jobsData) {
    const client = cl(j.client);
    const job = await prisma.job.create({
      data: {
        title: j.title, description: j.desc, category: j.category,
        budgetMin: j.min, budgetMax: j.max, timeline: j.timeline, status: j.status,
        clientProfileId: client.clientProfile!.id,
        skills: { connect: j.skills.map((name) => ({ id: s[name].id })) },
      },
    });
    jobs.push(job);
  }
  console.log(`Created ${jobs.length} jobs`);

  // Helper to find job by index
  const job = (i: number) => jobs[i];

  // =================== APPLICATIONS (25+) ===================
  const appsData = [
    // Job 0: E-commerce (techcorp)
    { job: 0, freelancer: "alex@example.com", proposal: "I'd love to work on this e-commerce project! I have extensive experience building Next.js applications and have built 3 similar platforms.\n\nMy approach:\n1. Architecture planning and data modeling\n2. Set up Next.js with TypeScript\n3. Implement core features iteratively\n4. Comprehensive testing before delivery", bid: 4500, status: "SHORTLISTED" as const },
    { job: 0, freelancer: "sarah@example.com", proposal: "While my primary expertise is in design and frontend, I've worked on several full-stack Next.js projects and would bring both technical skills AND beautiful UI.", bid: 5000, status: "SUBMITTED" as const },
    { job: 0, freelancer: "carlos@example.com", proposal: "I've built several e-commerce platforms with Vue.js and can adapt quickly to Next.js. My strength is in building clean, maintainable backend architectures.", bid: 4000, status: "SUBMITTED" as const },
    // Job 1: Brand Identity (designstudio)
    { job: 1, freelancer: "sarah@example.com", proposal: "This is exactly my wheelhouse! I specialize in brand identity for tech companies and have worked with 20+ startups.", bid: 3200, status: "SUBMITTED" as const },
    { job: 1, freelancer: "nina@example.com", proposal: "I'd love to bring a unique creative vision to your brand. My background in 3D art and illustration gives me a distinctive perspective on brand design.", bid: 3500, status: "SUBMITTED" as const },
    { job: 1, freelancer: "yuki@example.com", proposal: "I can create a cohesive brand identity that works across all touchpoints — from logo animation to social media templates.", bid: 2800, status: "SHORTLISTED" as const },
    // Job 2: Data Pipeline (techcorp)
    { job: 2, freelancer: "mike@example.com", proposal: "This aligns perfectly with my expertise. I've built data pipelines and analytics dashboards for 15+ companies.", bid: 6500, status: "SUBMITTED" as const },
    { job: 2, freelancer: "priya@example.com", proposal: "I can build a robust, scalable data pipeline using modern tools. My ML background also means I can add predictive analytics features.", bid: 7000, status: "SUBMITTED" as const },
    // Job 3: Fitness App (designstudio)
    { job: 3, freelancer: "elena@example.com", proposal: "I've published 12 mobile apps and built a very similar fitness tracker. I can deliver a polished, production-ready app.", bid: 12000, status: "SHORTLISTED" as const },
    { job: 3, freelancer: "alex@example.com", proposal: "While I'm primarily a web developer, I have React Native experience and would love to tackle this project.", bid: 11000, status: "SUBMITTED" as const },
    // Job 4: Content Writer (techcorp)
    { job: 4, freelancer: "aisha@example.com", proposal: "I specialize in tech content and have helped SaaS companies grow their organic traffic by 3-10x. I can start immediately.", bid: 900, status: "SHORTLISTED" as const },
    // Job 5: GraphQL API (startupventures) - FILLED
    { job: 5, freelancer: "alex@example.com", proposal: "I have extensive experience building GraphQL APIs. I'll deliver a robust, scalable API with proper authentication and real-time subscriptions.", bid: 7000, status: "HIRED" as const },
    { job: 5, freelancer: "tomasz@example.com", proposal: "I build high-performance APIs for a living. My Go expertise means I can deliver an extremely fast GraphQL implementation.", bid: 8000, status: "REJECTED" as const },
    // Job 6: Telemedicine (healthplus)
    { job: 6, freelancer: "alex@example.com", proposal: "I've built healthcare applications before and understand HIPAA compliance requirements. I can deliver a secure, reliable telemedicine platform.", bid: 20000, status: "SUBMITTED" as const },
    { job: 6, freelancer: "tomasz@example.com", proposal: "I specialize in building secure, high-performance backends. I can architect a HIPAA-compliant system with proper encryption and audit logging.", bid: 18000, status: "SUBMITTED" as const },
    // Job 7: Carbon Dashboard (greenleaf)
    { job: 7, freelancer: "priya@example.com", proposal: "Data visualization and analytics are my specialty. I can build an interactive dashboard with ML-powered recommendations for reducing emissions.", bid: 8000, status: "SUBMITTED" as const },
    { job: 7, freelancer: "mike@example.com", proposal: "I've built similar analytics dashboards for environmental data. I can handle the full stack from data ingestion to visualization.", bid: 7500, status: "SUBMITTED" as const },
    // Job 8: AI Learning Platform (novalearn)
    { job: 8, freelancer: "priya@example.com", proposal: "This combines my two passions — AI and education. I can build the ML models for personalized learning paths and the recommendation engine.", bid: 25000, status: "SHORTLISTED" as const },
    // Job 9: Fleet Management (urbanlogistics)
    { job: 9, freelancer: "elena@example.com", proposal: "I've built GPS-tracking apps before and have deep experience with real-time mobile features. This is right in my wheelhouse.", bid: 14000, status: "SUBMITTED" as const },
    // Job 10: Shopify Store (foodies)
    { job: 10, freelancer: "lucas@example.com", proposal: "Shopify is my specialty — I've built 50+ stores. I can have your store live in under 3 weeks with a stunning custom theme.", bid: 3000, status: "SHORTLISTED" as const },
    // Job 11: Explainer Video (novalearn)
    { job: 11, freelancer: "yuki@example.com", proposal: "I create engaging animated explainers! My recent product launch video got 2M+ views. I can deliver a polished video in 2-3 weeks.", bid: 2200, status: "SUBMITTED" as const },
    // Job 12: Kubernetes (urbanlogistics)
    { job: 12, freelancer: "james@example.com", proposal: "I'm an AWS-certified cloud architect with extensive Kubernetes experience. I've set up production clusters for companies handling millions of requests.", bid: 11000, status: "SHORTLISTED" as const },
    // Job 13: WordPress Migration (greenleaf)
    { job: 13, freelancer: "lucas@example.com", proposal: "I've handled dozens of WordPress migrations with zero SEO loss. I can migrate your 500+ posts and deliver a blazing-fast new site.", bid: 2500, status: "SUBMITTED" as const },
    // Job 14: API Docs (healthplus)
    { job: 14, freelancer: "aisha@example.com", proposal: "Technical writing is my forte. I've written API docs for 10+ developer tools companies. I deliver clear, comprehensive documentation developers actually enjoy reading.", bid: 4000, status: "SUBMITTED" as const },
  ];

  const apps: any[] = [];
  for (const a of appsData) {
    const freelancer = fl(a.freelancer);
    const application = await prisma.jobApplication.create({
      data: {
        jobId: job(a.job).id,
        freelancerProfileId: freelancer.freelancerProfile!.id,
        proposalText: a.proposal, bidAmount: a.bid, status: a.status,
      },
    });
    apps.push(application);
  }
  console.log(`Created ${apps.length} applications`);

  // =================== CONVERSATIONS & MESSAGES ===================
  const conversationsData = [
    {
      appIndex: 0, // Alex <-> TechCorp on e-commerce job
      messages: [
        { sender: "techcorp@example.com", content: "Hi Alex! We've shortlisted your proposal. Can you tell us more about your timeline?", read: true },
        { sender: "alex@example.com", content: "Thanks! I can start immediately. I estimate 8 weeks — 2 for setup, 4 for core features, 2 for polish and testing.", read: true },
        { sender: "techcorp@example.com", content: "That sounds great. Can you do a video call this week to go over the requirements?", read: true },
        { sender: "alex@example.com", content: "Absolutely! I'm available Tuesday or Thursday afternoon. Which works better?", read: false },
      ],
    },
    {
      appIndex: 11, // Alex <-> Startup Ventures on GraphQL job (hired)
      messages: [
        { sender: "startupventures@example.com", content: "Alex, great to have you on board! The contract is ready for review.", read: true },
        { sender: "alex@example.com", content: "Fantastic! Everything looks good. I've accepted the contract.", read: true },
        { sender: "startupventures@example.com", content: "Please go ahead with the implementation. Looking forward to the first milestone.", read: true },
        { sender: "alex@example.com", content: "Starting today! I'll post weekly progress updates here.", read: true },
      ],
    },
    {
      appIndex: 8, // Elena <-> Design Studio on fitness app
      messages: [
        { sender: "designstudio@example.com", content: "Hi Elena! Your portfolio is impressive. Can you share more details about the fitness app you built?", read: true },
        { sender: "elena@example.com", content: "Thanks! That app had workout tracking, social features, and Apple Health integration — very similar to what you need. I can share a demo link.", read: true },
        { sender: "designstudio@example.com", content: "That would be great. Also, would you be open to starting with a small prototype first?", read: true },
        { sender: "elena@example.com", content: "Absolutely! A 2-week prototype sprint would let you evaluate my work before committing to the full project.", read: false },
      ],
    },
    {
      appIndex: 10, // Aisha <-> TechCorp on content writing
      messages: [
        { sender: "techcorp@example.com", content: "Hi Aisha! We love your content portfolio. Can you share some topic ideas for our developer blog?", read: true },
        { sender: "aisha@example.com", content: "Of course! Here are 5 topic ideas:\n1. Building Scalable APIs with Node.js\n2. React Performance Optimization\n3. TypeScript Best Practices in 2024\n4. Microservices vs Monolith\n5. CI/CD Pipeline Setup Guide\n\nI can adjust based on your audience.", read: true },
        { sender: "techcorp@example.com", content: "These are perfect! Let's start with topics 1 and 3. Can you have drafts ready by next week?", read: false },
      ],
    },
    {
      appIndex: 17, // Priya <-> NovaLearn on AI platform
      messages: [
        { sender: "novalearn@example.com", content: "Priya, your ML background is exactly what we need. Can you walk us through how you'd approach the personalized learning engine?", read: true },
        { sender: "priya@example.com", content: "I'd use a hybrid approach: collaborative filtering for content recommendations plus a knowledge graph to model learning paths. For the assessment engine, I'd use adaptive testing with item response theory.", read: true },
        { sender: "novalearn@example.com", content: "That's very thorough. What about the cold-start problem for new students?", read: true },
        { sender: "priya@example.com", content: "Great question! I'd use a diagnostic quiz during onboarding combined with demographic-based priors. After 5-10 interactions, the model transitions to personalized predictions. I've used this approach before with 85%+ accuracy.", read: true },
        { sender: "novalearn@example.com", content: "Impressive. Let's schedule a technical deep-dive call. Are you available this Thursday?", read: false },
      ],
    },
    {
      appIndex: 19, // Lucas <-> Foodies on Shopify
      messages: [
        { sender: "foodies@example.com", content: "Hi Lucas! We need the store up fast. Can you really deliver in 3 weeks?", read: true },
        { sender: "lucas@example.com", content: "Yes! Here's my typical timeline:\n- Week 1: Theme customization + product catalog setup\n- Week 2: Payment, shipping, SEO configuration\n- Week 3: Testing, training docs, and launch prep\n\nI've done this 50+ times.", read: true },
        { sender: "foodies@example.com", content: "That's exactly what we need. Let's go ahead — can you start Monday?", read: true },
        { sender: "lucas@example.com", content: "Monday works! I'll send over a checklist of what I'll need from you (product photos, descriptions, brand assets) over the weekend.", read: false },
      ],
    },
    {
      appIndex: 21, // James <-> Urban Logistics on K8s
      messages: [
        { sender: "urbanlogistics@example.com", content: "James, we currently run everything on EC2 instances with manual deployments. It's painful. How would you approach the migration?", read: true },
        { sender: "james@example.com", content: "I'd recommend a phased approach:\n1. Containerize your services with Docker\n2. Set up EKS cluster with proper networking\n3. Deploy non-critical services first\n4. Set up CI/CD with ArgoCD\n5. Migrate critical services with blue/green deployments\n6. Add monitoring and alerting\n\nThis minimizes risk while keeping your services running.", read: true },
        { sender: "urbanlogistics@example.com", content: "That makes sense. We have 8 services currently. How long would the full migration take?", read: true },
        { sender: "james@example.com", content: "For 8 services, I'd estimate 6-8 weeks total. The first 2 services take the longest as we set up all the infrastructure. After that, each additional service is much faster.", read: false },
      ],
    },
  ];

  for (const c of conversationsData) {
    const conv = await prisma.conversation.create({
      data: { jobApplicationId: apps[c.appIndex].id },
    });
    const senderMap = Object.fromEntries([...clients, ...freelancers].map((u) => [u.email, u.id]));
    await prisma.message.createMany({
      data: c.messages.map((m, i) => ({
        conversationId: conv.id,
        senderId: senderMap[m.sender],
        content: m.content,
        readAt: m.read ? new Date(Date.now() - (c.messages.length - i) * 3600000) : null,
      })),
    });
  }
  console.log(`Created ${conversationsData.length} conversations with messages`);

  // =================== CONTRACTS (8) ===================
  // Contract 1: Active - Alex doing e-commerce for TechCorp
  const contract1 = await prisma.contract.create({
    data: {
      jobId: job(0).id,
      clientProfileId: cl("techcorp@example.com").clientProfile!.id,
      freelancerProfileId: fl("alex@example.com").freelancerProfile!.id,
      amount: 4500,
      description: "Full-stack e-commerce platform development with Next.js, TypeScript, and PostgreSQL.",
      status: "ACTIVE",
    },
  });

  // Contract 2: Completed - Alex did GraphQL API for Startup Ventures
  const contract2 = await prisma.contract.create({
    data: {
      jobId: job(5).id,
      clientProfileId: cl("startupventures@example.com").clientProfile!.id,
      freelancerProfileId: fl("alex@example.com").freelancerProfile!.id,
      amount: 7000,
      description: "GraphQL API development for SaaS platform with authentication, subscriptions, and real-time updates.",
      status: "COMPLETED",
    },
  });

  // Contract 3: Pending - Sarah doing brand identity for Design Studio
  const contract3 = await prisma.contract.create({
    data: {
      jobId: job(1).id,
      clientProfileId: cl("designstudio@example.com").clientProfile!.id,
      freelancerProfileId: fl("sarah@example.com").freelancerProfile!.id,
      amount: 3200,
      description: "Brand identity and website design for fintech startup. Includes logo, brand guidelines, and 6 page designs.",
      status: "PENDING",
    },
  });

  // Contract 4: Completed - Lucas did Shopify store for Foodies
  const contract4 = await prisma.contract.create({
    data: {
      jobId: job(10).id,
      clientProfileId: cl("foodies@example.com").clientProfile!.id,
      freelancerProfileId: fl("lucas@example.com").freelancerProfile!.id,
      amount: 3000,
      description: "Custom Shopify store setup with branded theme, 200+ products, and SEO optimization.",
      status: "COMPLETED",
    },
  });

  // Contract 5: Active - James doing K8s for Urban Logistics
  const contract5 = await prisma.contract.create({
    data: {
      jobId: job(12).id,
      clientProfileId: cl("urbanlogistics@example.com").clientProfile!.id,
      freelancerProfileId: fl("james@example.com").freelancerProfile!.id,
      amount: 11000,
      description: "Production Kubernetes cluster setup on AWS EKS with CI/CD pipeline, monitoring, and security hardening.",
      status: "ACTIVE",
    },
  });

  // Contract 6: Completed - Aisha did content for TechCorp
  const contract6 = await prisma.contract.create({
    data: {
      jobId: job(4).id,
      clientProfileId: cl("techcorp@example.com").clientProfile!.id,
      freelancerProfileId: fl("aisha@example.com").freelancerProfile!.id,
      amount: 900,
      description: "Ongoing tech blog content creation — 4 articles per month on developer topics.",
      status: "COMPLETED",
    },
  });

  // Contract 7: Submitted - Elena working on fitness app for Design Studio
  const contract7 = await prisma.contract.create({
    data: {
      jobId: job(3).id,
      clientProfileId: cl("designstudio@example.com").clientProfile!.id,
      freelancerProfileId: fl("elena@example.com").freelancerProfile!.id,
      amount: 12000,
      description: "React Native fitness tracking app for iOS and Android with social features and health integrations.",
      status: "SUBMITTED",
    },
  });

  // Contract 8: Active - Priya working on AI platform for NovaLearn
  const contract8 = await prisma.contract.create({
    data: {
      jobId: job(8).id,
      clientProfileId: cl("novalearn@example.com").clientProfile!.id,
      freelancerProfileId: fl("priya@example.com").freelancerProfile!.id,
      amount: 25000,
      description: "AI-powered personalized learning platform MVP with adaptive assessments and content recommendations.",
      status: "ACTIVE",
    },
  });

  console.log("Created 8 contracts");

  // =================== MILESTONES ===================
  // Milestones for contract5 (K8s project)
  await prisma.milestone.createMany({
    data: [
      { contractId: contract5.id, title: "Infrastructure Setup", description: "Set up EKS cluster, networking, and base infrastructure", amount: 3000, order: 1, status: "APPROVED" },
      { contractId: contract5.id, title: "CI/CD Pipeline", description: "Configure ArgoCD and GitOps workflow", amount: 3000, order: 2, status: "IN_PROGRESS" },
      { contractId: contract5.id, title: "Service Migration", description: "Migrate all 8 services to Kubernetes", amount: 3000, order: 3, status: "PENDING" },
      { contractId: contract5.id, title: "Monitoring & Hardening", description: "Set up Prometheus, Grafana, and security hardening", amount: 2000, order: 4, status: "PENDING" },
    ],
  });

  // Milestones for contract8 (AI platform)
  await prisma.milestone.createMany({
    data: [
      { contractId: contract8.id, title: "Assessment Engine", description: "Build adaptive testing and skill assessment system", amount: 8000, order: 1, status: "APPROVED" },
      { contractId: contract8.id, title: "Recommendation System", description: "ML-powered content recommendation engine", amount: 8000, order: 2, status: "IN_PROGRESS" },
      { contractId: contract8.id, title: "Student & Parent Dashboards", description: "Progress tracking and analytics dashboards", amount: 5000, order: 3, status: "PENDING" },
      { contractId: contract8.id, title: "Gamification & Polish", description: "Badges, streaks, leaderboards, and final polish", amount: 4000, order: 4, status: "PENDING" },
    ],
  });

  console.log("Created milestones");

  // =================== REVIEWS (7) ===================
  const reviewsData = [
    { contract: contract2, reviewer: "startupventures@example.com", reviewee: "alex@example.com", rating: 5, comment: "Alex delivered exceptional work! The GraphQL API is well-structured, thoroughly documented, and performs brilliantly. He was communicative throughout and delivered ahead of schedule. Would absolutely hire again." },
    { contract: contract4, reviewer: "foodies@example.com", reviewee: "lucas@example.com", rating: 5, comment: "Lucas is a Shopify wizard! Our store looks amazing and was ready in under 3 weeks as promised. Sales have been great since launch. The training docs he provided were super helpful." },
    { contract: contract4, reviewer: "lucas@example.com", reviewee: "foodies@example.com", rating: 4, comment: "Great client to work with. Clear requirements and quick feedback. Product photos could have been ready sooner, but overall a smooth project." },
    { contract: contract6, reviewer: "techcorp@example.com", reviewee: "aisha@example.com", rating: 5, comment: "Aisha's content is outstanding. Her articles are well-researched, engaging, and perfectly optimized for SEO. Our blog traffic has increased 150% since she started writing for us." },
    { contract: contract6, reviewer: "aisha@example.com", reviewee: "techcorp@example.com", rating: 5, comment: "TechCorp is an excellent client. Clear briefs, prompt feedback, and they really value quality content. A pleasure to work with." },
    { contract: contract2, reviewer: "alex@example.com", reviewee: "startupventures@example.com", rating: 4, comment: "Good client with clear vision. Requirements were well-defined and feedback was constructive. Slight delays in approvals but nothing major." },
  ];

  for (const r of reviewsData) {
    const reviewer = [...clients, ...freelancers].find((u) => u.email === r.reviewer)!;
    const reviewee = [...clients, ...freelancers].find((u) => u.email === r.reviewee)!;
    await prisma.review.create({
      data: { contractId: r.contract.id, reviewerId: reviewer.id, revieweeId: reviewee.id, rating: r.rating, comment: r.comment },
    });
  }
  console.log(`Created ${reviewsData.length} reviews`);

  // =================== ADMIN ACTIONS ===================
  await prisma.adminAction.createMany({
    data: [
      { adminId: admin.id, targetType: "USER", targetId: fl("mike@example.com").id, action: "SUSPEND", reason: "Account flagged for review — duplicate profile detected.", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { adminId: admin.id, targetType: "USER", targetId: fl("mike@example.com").id, action: "WARN", reason: "Profile bio contained external links violating ToS.", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    ],
  });

  await prisma.user.update({
    where: { id: fl("mike@example.com").id },
    data: { suspended: true },
  });

  console.log("Created admin actions");

  // =================== CONTACT SUBMISSIONS ===================
  await prisma.contactSubmission.createMany({
    data: [
      { name: "John Smith", email: "john@example.com", subject: "Partnership Inquiry", message: "Hi, I'm interested in partnering with LetsWork for our recruitment needs. We're a mid-size tech company looking for a reliable freelance platform.", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { name: "Maria Garcia", email: "maria@example.com", subject: "Account Issue", message: "I'm having trouble verifying my email address. I've tried multiple times but the verification link seems to expire instantly.", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { name: "Ahmed Hassan", email: "ahmed@example.com", subject: "Feature Request", message: "It would be great if you could add a portfolio video feature for freelancers. Many of us do video/animation work and static images don't do our work justice.", createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
    ],
  });
  console.log("Created contact submissions");

  console.log("\n=== Seed Complete ===");
  console.log("Demo accounts (all use password: Password123):");
  console.log("  Admin:       admin@tryletswork.com");
  console.log("  Clients (8): techcorp@, designstudio@, startupventures@, healthplus@, greenleaf@, novalearn@, urbanlogistics@, foodies@");
  console.log("  Freelancers (12): alex@, sarah@, mike@ (suspended), elena@, james@, priya@, lucas@, aisha@, tomasz@, yuki@, carlos@, nina@");
  console.log("\nDemo data:");
  console.log(`  ${skills.length} skills`);
  console.log(`  ${jobs.length} jobs (${jobs.filter((j) => j.status === "OPEN").length} open, ${jobs.filter((j) => j.status === "FILLED").length} filled)`);
  console.log(`  ${apps.length} applications`);
  console.log(`  ${conversationsData.length} conversations with messages`);
  console.log("  8 contracts (3 active, 3 completed, 1 pending, 1 submitted)");
  console.log(`  ${reviewsData.length} reviews`);
  console.log("  8 milestones across 2 contracts");
  console.log("  2 admin actions");
  console.log("  3 contact submissions");
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
