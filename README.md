# FreelanceHub

A full-stack freelancing platform connecting businesses with freelance talent. Built with Next.js 16, React 19, and PostgreSQL.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS v4, Radix UI |
| Database | PostgreSQL (Supabase) via Prisma ORM 7 |
| Auth | NextAuth v5 (credentials provider, bcrypt) |
| Payments | Stripe (checkout sessions, webhooks) |
| Email | Brevo transactional email API |
| AI Chat | Anthropic API |
| Forms | React Hook Form + Zod validation |
| State | Zustand |
| Testing | Playwright (E2E + accessibility via axe-core) |
| Icons | Lucide React |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/                # REST API endpoints
│   │   ├── auth/           # Register, login, forgot/reset password
│   │   ├── jobs/           # CRUD for job listings
│   │   ├── applications/   # Job applications
│   │   ├── contracts/      # Contract management
│   │   ├── conversations/  # Messaging system
│   │   ├── freelancers/    # Freelancer directory
│   │   ├── profiles/       # Client & freelancer profiles
│   │   ├── reviews/        # Post-contract reviews
│   │   ├── stripe/         # Checkout & webhook handlers
│   │   ├── chat/           # AI chatbot endpoint
│   │   ├── upload/         # File uploads (avatars)
│   │   ├── skills/         # Skills autocomplete
│   │   └── admin/          # Admin analytics, user/job/contract management
│   ├── admin/              # Admin panel pages
│   ├── dashboard/          # Authenticated user dashboard
│   ├── jobs/               # Public job browsing & detail pages
│   ├── freelancers/        # Freelancer directory & profiles
│   ├── login/              # Login page
│   ├── register/           # Registration (client/freelancer)
│   ├── forgot-password/    # Password reset request
│   └── reset-password/     # Password reset form
├── components/
│   ├── ui/                 # Reusable UI primitives (Button, Input, Badge, etc.)
│   ├── layout/             # Navbar, Footer
│   └── chat-widget.tsx     # AI-powered chat assistant
├── features/               # Feature-specific components
│   ├── admin/              # Admin views (users, jobs, contracts, payments, reviews)
│   ├── applications/       # Apply form, applications list
│   ├── contracts/          # Contract detail, list, create form
│   ├── jobs/               # Job card, detail, form, listing, my-jobs
│   ├── messaging/          # Chat window, conversation list, layout
│   ├── payments/           # Payments view
│   ├── profiles/           # Client/freelancer dashboards & profile forms
│   └── reviews/            # Review form
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── prisma.ts           # Prisma client singleton
│   ├── email.ts            # Brevo email service
│   ├── utils.ts            # Utility functions (cn, formatCurrency, etc.)
│   └── validations/        # Zod schemas (auth, job, profile, contract, etc.)
└── types/                  # TypeScript type definitions & NextAuth augmentation
prisma/
├── schema.prisma           # Database schema (13 models)
├── migrations/             # SQL migrations
└── seed.ts                 # Database seeder
tests/
└── e2e/                    # Playwright E2E & accessibility tests
```

## Database Schema

13 models covering the full platform lifecycle:

- **User** - Auth, roles (CLIENT / FREELANCER / ADMIN), suspension
- **ClientProfile** / **FreelancerProfile** - Role-specific profiles with completion tracking
- **Skill** - Many-to-many with freelancers and jobs
- **PortfolioItem** - Freelancer portfolio pieces
- **Job** - Listings with status (DRAFT / OPEN / CLOSED / FILLED / REMOVED), category, budget range
- **JobApplication** - Proposals with bid amounts and status tracking
- **Conversation** / **Message** - Per-application messaging with read receipts
- **Contract** - Lifecycle (PENDING / ACTIVE / SUBMITTED / COMPLETED / CANCELLED)
- **Payment** - Stripe-integrated with platform fee calculation
- **Review** - Post-contract ratings and comments
- **AdminAction** - Audit log for admin operations
- **PasswordReset** - Token-based password recovery

## API Endpoints

### Auth
- `POST /api/auth/register` - Create account (client or freelancer)
- `POST /api/auth/[...nextauth]` - NextAuth session management
- `POST /api/auth/forgot-password` - Request password reset email
- `POST /api/auth/reset-password` - Reset password with token

### Jobs
- `GET /api/jobs` - List jobs (search, category, budget filters, pagination)
- `POST /api/jobs` - Create job listing (clients only)
- `GET /api/jobs/[id]` - Job detail
- `PUT /api/jobs/[id]` - Update job
- `DELETE /api/jobs/[id]` - Delete job

### Applications
- `GET /api/applications` - List applications (filtered by role)
- `POST /api/applications` - Submit proposal (freelancers only)
- `PATCH /api/applications/[id]` - Update status (shortlist, reject, hire)

### Contracts
- `GET /api/contracts` - List contracts
- `POST /api/contracts` - Create contract from application
- `GET /api/contracts/[id]` - Contract detail
- `PATCH /api/contracts/[id]` - Update contract status

### Messaging
- `GET /api/conversations` - List conversations with unread counts
- `GET /api/conversations/[id]/messages` - Fetch messages
- `POST /api/conversations/[id]/messages` - Send message

### Profiles
- `GET/PUT /api/profiles/client` - Client profile
- `GET/PUT /api/profiles/freelancer` - Freelancer profile
- `POST /api/profiles/freelancer/portfolio` - Add portfolio item
- `DELETE /api/profiles/freelancer/portfolio/[id]` - Remove portfolio item

### Freelancers
- `GET /api/freelancers` - Browse freelancers (search, skills, rate filters)
- `GET /api/freelancers/[id]` - Freelancer public profile

### Payments
- `POST /api/stripe/checkout` - Create Stripe checkout session
- `POST /api/stripe/webhook` - Stripe webhook handler

### Reviews
- `POST /api/reviews` - Submit review for completed contract

### Admin
- `GET /api/admin/analytics` - Platform statistics
- `GET /api/admin/users` - List users with filters
- `POST /api/admin/users/[id]/action` - Suspend/unsuspend/promote users
- `GET /api/admin/jobs` - List all jobs
- `POST /api/admin/jobs/[id]/action` - Remove/reopen jobs
- `GET /api/admin/contracts` - List all contracts
- `GET /api/admin/payments` - List all payments
- `GET /api/admin/reviews` - List reviews
- `DELETE /api/admin/reviews/[id]` - Remove review

### Other
- `POST /api/chat` - AI chatbot
- `POST /api/upload` - Avatar file upload
- `GET /api/skills` - Skills autocomplete

## Features

### For Clients
- Post and manage job listings with categories, budgets, and required skills
- Review freelancer proposals and portfolios
- Shortlist, reject, or hire applicants
- Create contracts and manage milestones
- Pay freelancers via Stripe with escrow-style flow
- Leave reviews after contract completion
- Real-time messaging with freelancers

### For Freelancers
- Build a profile with skills, hourly rate, bio, and portfolio
- Browse and search jobs by keyword, category, and budget
- Submit proposals with custom bid amounts
- Track application status (submitted, shortlisted, hired, rejected)
- Manage active contracts and submit deliverables
- Message clients directly
- Build reputation through reviews and ratings

### Admin Panel
- Dashboard with platform analytics (users, jobs, contracts, revenue)
- User management (view, suspend, unsuspend, promote to admin)
- Job moderation (remove inappropriate listings, reopen jobs)
- Contract and payment oversight
- Review moderation (remove policy-violating reviews)
- Full audit log of admin actions

### Platform
- AI-powered chat assistant for user support
- Responsive design (mobile, tablet, desktop)
- Accessibility: WCAG-compliant focus management, ARIA labels, keyboard navigation, reduced motion support
- Password reset flow via transactional email (Brevo)
- Avatar uploads with fallback initials
- Unread message badge with polling

## Color Palette

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary | Dark blue-gray | `#25343F` | Navbar, headers, text, avatars |
| Secondary | Orange | `#FF9B51` | Buttons, CTAs, focus rings, links, active states |
| Neutral bg | Light gray | `#EAEFEF` | Page backgrounds, card sections |
| Neutral support | Medium gray | `#BFC9D1` | Borders, secondary text, dividers |

Colors are defined centrally via CSS custom properties in `globals.css` using Tailwind v4's `@theme inline` directive. All components reference `brand-*` (primary) and `accent-*` (secondary) tokens.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase account)
- Stripe account (for payments)
- Brevo account (for emails)
- Anthropic API key (for AI chat)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/omar-dakalbab/freelancing-platform.git
   cd freelancing-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Fill in your database URL, API keys, and secrets
   ```

4. **Set up the database**
   ```bash
   npm run db:generate    # Generate Prisma client
   npm run db:migrate     # Run migrations
   npm run db:seed        # Seed sample data
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |
| `npm run db:reset` | Reset DB and re-seed |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:a11y` | Run accessibility tests |

## Environment Variables

See [`.env.example`](.env.example) for all required and optional variables:

- `DATABASE_URL` / `DIRECT_URL` - PostgreSQL connection strings
- `AUTH_SECRET` / `AUTH_URL` - NextAuth configuration
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` - Stripe payments
- `BREVO_API_KEY` / `BREVO_SENDER_EMAIL` - Transactional email
- `ANTHROPIC_API_KEY` - AI chatbot
- `NEXT_PUBLIC_APP_URL` - Application URL

## Deployment

The app is designed for deployment on Vercel with a Supabase PostgreSQL database:

1. Push to GitHub
2. Connect the repo to Vercel
3. Add environment variables in the Vercel dashboard
4. Prisma migrations run via `npm run db:migrate` against the direct database URL
5. Stripe webhooks should be configured to point to `https://yourdomain.com/api/stripe/webhook`
