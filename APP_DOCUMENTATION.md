# FreelanceHub — Full Application Documentation

## Overview

FreelanceHub is a niche freelance hiring platform MVP inspired by Upwork. It enables clients to post jobs, freelancers to create profiles and apply, and provides end-to-end hiring, contracting, payment, and review workflows — all managed through an admin dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Database | PostgreSQL via Supabase (PgBouncer pooling) |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| Authentication | NextAuth.js v5 (Auth.js) — credentials provider |
| Payments | Stripe (Checkout + Webhooks) |
| Email | Brevo (Sendinblue) transactional API |
| AI Chatbot | Anthropic Claude API (with static fallback) |
| Styling | Tailwind CSS v4 + Radix UI primitives |
| Forms | React Hook Form + Zod v4 validation |
| State | Zustand |
| Icons | Lucide React |
| Testing | Playwright (E2E) + Axe Core (accessibility) |

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Next.js App Router                 │
│  ┌────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │  Pages &    │  │  API Route  │  │  Middleware    │  │
│  │  Layouts    │  │  Handlers   │  │  (proxy.ts)   │  │
│  └─────┬──────┘  └──────┬──────┘  └───────┬───────┘  │
│        │                │                  │          │
│  ┌─────┴────────────────┴──────────────────┴───────┐  │
│  │              Shared Libraries                    │  │
│  │  auth.ts │ prisma.ts │ email.ts │ validations/   │  │
│  └─────────────────────┬───────────────────────────┘  │
└────────────────────────┼─────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
    ┌─────┴─────┐  ┌─────┴─────┐  ┌────┴─────┐
    │ Supabase  │  │  Stripe   │  │  Brevo   │
    │ PostgreSQL│  │  Payments │  │  Email   │
    └───────────┘  └───────────┘  └──────────┘
```

### Folder Structure

```
freelance-platform/
├── prisma/
│   ├── schema.prisma          # 14 models, 5 enums
│   ├── prisma.config.ts       # Migration config (DIRECT_URL)
│   ├── seed.ts                # Demo data seeder
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout with navbar, footer, chat widget
│   │   ├── not-found.tsx      # 404 page
│   │   ├── error.tsx          # Error boundary
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── forgot-password/   # Password reset request
│   │   ├── reset-password/    # Password reset form
│   │   ├── jobs/              # Public job listing + detail + apply
│   │   ├── freelancers/       # Public freelancer directory + profiles
│   │   ├── dashboard/         # Protected dashboard pages
│   │   │   ├── profile/       # Profile management
│   │   │   ├── post-job/      # Job creation (client)
│   │   │   ├── my-jobs/       # Job management (client)
│   │   │   ├── applications/  # Applications view (freelancer)
│   │   │   ├── contracts/     # Contracts management
│   │   │   ├── payments/      # Payment history
│   │   │   └── messages/      # Messaging system
│   │   ├── admin/             # Admin dashboard
│   │   │   ├── users/         # User management
│   │   │   ├── jobs/          # Job moderation
│   │   │   ├── contracts/     # Contract oversight
│   │   │   ├── payments/      # Payment tracking
│   │   │   └── reviews/       # Review moderation
│   │   └── api/               # 39 API route handlers
│   ├── components/
│   │   ├── layout/            # Navbar, Footer
│   │   ├── ui/                # 14 reusable UI components
│   │   └── chat-widget.tsx    # AI assistant widget
│   ├── features/              # 27 feature components
│   │   ├── admin/             # Admin views (7 files)
│   │   ├── applications/      # Application forms & views (3 files)
│   │   ├── contracts/         # Contract management (3 files)
│   │   ├── jobs/              # Job listing & forms (5 files)
│   │   ├── messaging/         # Chat interface (3 files)
│   │   ├── payments/          # Payment views (1 file)
│   │   ├── profiles/          # Profile forms & dashboards (4 files)
│   │   └── reviews/           # Review form (1 file)
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── email.ts           # Brevo email service (7 template functions)
│   │   ├── utils.ts           # Utility functions
│   │   └── validations/       # 10 Zod schema files
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
├── .env.example               # Environment variable template
├── package.json               # 22 prod + 10 dev dependencies
├── next.config.ts             # Security headers, image domains
└── tailwind.config.ts         # Tailwind configuration
```

---

## Database Schema

### 14 Models

#### User & Authentication
| Model | Fields | Purpose |
|-------|--------|---------|
| **User** | id, email, passwordHash, role, avatar, suspended, emailVerified, createdAt, updatedAt | Core user account |
| **PasswordReset** | id, userId, token, expiresAt, used, createdAt | Password reset tokens |

#### Profiles
| Model | Fields | Purpose |
|-------|--------|---------|
| **ClientProfile** | id, userId, companyName, companyDescription, website, industry, completionStatus | Client company info |
| **FreelancerProfile** | id, userId, bio, title, hourlyRate, completionStatus | Freelancer details |
| **Skill** | id, name | Tagging system (many-to-many with FreelancerProfile and Job) |
| **PortfolioItem** | id, freelancerProfileId, title, description, url, imageUrl | Freelancer portfolio pieces |

#### Jobs & Applications
| Model | Fields | Purpose |
|-------|--------|---------|
| **Job** | id, clientProfileId, title, description, category, budgetMin, budgetMax, timeline, status, createdAt | Job postings |
| **JobApplication** | id, jobId, freelancerProfileId, proposalText, bidAmount, status, createdAt | Applications with proposals |

#### Communication
| Model | Fields | Purpose |
|-------|--------|---------|
| **Conversation** | id, jobApplicationId, createdAt | Chat threads linked to applications |
| **Message** | id, conversationId, senderId, content, readAt, createdAt | Individual messages |

#### Contracts & Payments
| Model | Fields | Purpose |
|-------|--------|---------|
| **Contract** | id, jobId, clientProfileId, freelancerProfileId, amount, description, status, createdAt | Work agreements |
| **Payment** | id, contractId, amount, platformFee, stripePaymentId, stripeSessionId, status, createdAt | Stripe payment records |

#### Reviews & Admin
| Model | Fields | Purpose |
|-------|--------|---------|
| **Review** | id, contractId, reviewerId, revieweeId, rating, comment, createdAt | Client reviews of freelancers |
| **AdminAction** | id, adminId, targetType, targetId, action, reason, createdAt | Admin audit log |

### Enums

| Enum | Values |
|------|--------|
| **Role** | CLIENT, FREELANCER, ADMIN |
| **JobStatus** | DRAFT, OPEN, CLOSED, FILLED, REMOVED |
| **ApplicationStatus** | SUBMITTED, SHORTLISTED, REJECTED, HIRED |
| **ContractStatus** | PENDING, ACTIVE, SUBMITTED, COMPLETED, CANCELLED |
| **PaymentStatus** | PENDING, COMPLETED, FAILED, REFUNDED |

---

## User Roles & Permissions

### Client
- Create and manage company profile
- Post, edit, publish, and close jobs
- View applicants and their proposals
- Shortlist, reject, or hire applicants
- Start conversations with applicants
- Create fixed-price contracts
- Fund contracts via Stripe
- Mark contracts as completed
- Leave reviews for freelancers

### Freelancer
- Create and manage professional profile (bio, skills, hourly rate, portfolio)
- Browse and search public job listings
- Apply to jobs with proposals and bid amounts
- Chat with clients after being shortlisted
- Accept or reject contract offers
- Submit completed work
- View received reviews and ratings

### Admin
- View platform analytics dashboard (users, jobs, contracts, payments)
- Manage users (approve, suspend, activate)
- Moderate job posts (remove fraudulent or low-quality listings)
- Oversee all contracts and payments
- Moderate reviews
- All admin actions are logged to the AdminAction audit trail

---

## Core Workflows

### 1. Registration & Authentication
```
User visits /register
  → Selects role (Client or Freelancer)
  → Enters email + password
  → Account created, profile initialized
  → Welcome email sent via Brevo
  → Redirected to dashboard

User visits /login
  → Enters credentials
  → NextAuth session created (JWT)
  → Role-based dashboard displayed

Forgot password:
  → User enters email at /forgot-password
  → Reset token generated, email sent
  → User clicks link to /reset-password?token=...
  → New password set
```

### 2. Job Posting & Discovery
```
Client: Dashboard → Post a Job
  → Fill title, description, category, skills, budget, timeline
  → Save as Draft or Publish (OPEN)
  → Job appears on public /jobs listing

Anyone: /jobs
  → Search by keyword
  → Filter by category, budget range, skills
  → Paginated results (12 per page)
  → Click job for full details
```

### 3. Application & Hiring
```
Freelancer: /jobs/[id] → Apply
  → Write proposal + enter bid amount
  → Application created (SUBMITTED)
  → Client notified via email

Client: Dashboard → My Jobs → [job]
  → View all applications
  → Shortlist → status SHORTLISTED, freelancer notified, conversation created
  → Hire → status HIRED, freelancer notified
  → Reject → status REJECTED, freelancer notified
```

### 4. Messaging
```
After shortlisting/hiring:
  → Conversation auto-created
  → Both parties see it in Dashboard → Messages
  → Real-time messaging (polling every 4 seconds)
  → Unread count badge in navbar (polls every 10 seconds)
  → Messages marked as read on view
```

### 5. Contracts
```
Client creates contract for HIRED freelancer:
  → Sets fixed price + description
  → Contract status: PENDING

Freelancer accepts:
  → Status: ACTIVE

Client funds via Stripe:
  → Stripe Checkout redirect
  → Webhook confirms payment
  → Payment recorded (10% platform fee)

Freelancer submits work:
  → Status: SUBMITTED

Client approves:
  → Status: COMPLETED
  → "Leave Review" option appears
```

### 6. Payments
```
Client clicks "Fund Contract"
  → POST /api/stripe/checkout creates Stripe session
  → Client redirected to Stripe Checkout
  → On success: webhook fires checkout.session.completed
  → Payment status: COMPLETED
  → Platform fee calculated (10%)
  → Freelancer notified via email

Freelancer payout: MOCKED for MVP
  → Shows "Payout pending" status
```

### 7. Reviews
```
After contract COMPLETED:
  → Client sees "Leave Review" on contract detail
  → Rates 1-5 stars + comment
  → One review per contract (unique constraint)
  → Review appears on freelancer's public profile
  → Average rating calculated and displayed
  → Freelancer notified via email
```

---

## API Reference

### Authentication (4 endpoints)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET/POST | `/api/auth/[...nextauth]` | - | NextAuth handlers |
| POST | `/api/auth/register` | - | Register new user |
| POST | `/api/auth/forgot-password` | - | Request password reset |
| POST | `/api/auth/reset-password` | - | Reset password with token |

### Jobs (3 endpoints)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/jobs` | - | List jobs with filters |
| POST | `/api/jobs` | Client | Create new job |
| GET | `/api/jobs/[id]` | - | Get job details |

### Applications (4 endpoints)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/applications` | Yes | List applications (role-aware) |
| POST | `/api/applications` | Freelancer | Submit application |
| GET | `/api/applications/[id]` | Yes | Get application detail |
| PATCH | `/api/applications/[id]` | Client | Update status (shortlist/hire/reject) |

### Contracts (4 endpoints)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/contracts` | Yes | List user's contracts |
| POST | `/api/contracts` | Client | Create contract |
| GET | `/api/contracts/[id]` | Yes | Get contract details |
| PATCH | `/api/contracts/[id]` | Yes | Update contract status |

### Messaging (4 endpoints)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/conversations` | Yes | List conversations |
| POST | `/api/conversations` | Client | Create conversation |
| GET | `/api/conversations/[id]/messages` | Yes | Get messages |
| POST | `/api/conversations/[id]/messages` | Yes | Send message |

### Payments (2 endpoints)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/stripe/checkout` | Client | Create Stripe checkout session |
| POST | `/api/stripe/webhook` | Stripe | Handle payment webhooks |

### Profiles (6 endpoints)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/profiles/client` | Client | Get client profile |
| PATCH | `/api/profiles/client` | Client | Update client profile |
| GET | `/api/profiles/freelancer` | Freelancer | Get freelancer profile |
| PATCH | `/api/profiles/freelancer` | Freelancer | Update freelancer profile |
| POST | `/api/profiles/freelancer/portfolio` | Freelancer | Add portfolio item |
| PATCH | `/api/profiles/freelancer/portfolio/[id]` | Freelancer | Update portfolio item |

### Freelancer Directory (2 endpoints)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/freelancers` | - | List freelancers with filters |
| GET | `/api/freelancers/[id]` | - | Get freelancer public profile |

### Reviews (2 endpoints)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/reviews` | - | Get reviews for a freelancer |
| POST | `/api/reviews` | Client | Create review |

### Other (3 endpoints)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/skills` | - | List all skills |
| POST | `/api/upload` | Yes | Upload file (avatar) |
| POST | `/api/chat` | - | AI chatbot (Claude API) |

### Admin (9 endpoints)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/analytics` | Admin | Platform analytics |
| GET | `/api/admin/users` | Admin | List all users |
| POST | `/api/admin/users/[id]/action` | Admin | Suspend/activate user |
| GET | `/api/admin/jobs` | Admin | List all jobs |
| POST | `/api/admin/jobs/[id]/action` | Admin | Remove/restore job |
| GET | `/api/admin/contracts` | Admin | List all contracts |
| GET | `/api/admin/payments` | Admin | List all payments |
| GET | `/api/admin/reviews` | Admin | List all reviews |
| DELETE | `/api/admin/reviews/[id]` | Admin | Delete review |

**Total: 39 API endpoints**

---

## Email Notifications (Brevo)

| Event | Recipient | Template |
|-------|-----------|----------|
| User registers | New user | Welcome email with role-specific guide |
| Forgot password | User | Reset link with token |
| Freelancer applies to job | Client | Application received notification |
| Application shortlisted | Freelancer | Status update |
| Application rejected | Freelancer | Status update |
| Application hired | Freelancer | Hired notification |
| Contract created | Freelancer | New contract details |
| Payment completed | Freelancer | Payment received confirmation |
| Review submitted | Freelancer | New review notification |

All emails are sent asynchronously (fire-and-forget) so they never block API responses. Failures are logged but do not break the main flow.

---

## AI Chatbot

The platform includes a floating chat widget on every page with two modes:

### Static Mode (default, `USE_AI = false`)
- Keyword-based FAQ responses covering 10 topics
- No API key required
- Instant responses with typing delay simulation
- Topics: posting jobs, applying, payments, contracts, reviews, messaging, profiles, search

### AI Mode (`USE_AI = true`)
- Powered by Claude (Haiku 4.5) via Anthropic API
- Context-aware system prompt with full platform knowledge
- Streaming responses for smooth UX
- Knows the user's role and tailors guidance accordingly
- Requires `ANTHROPIC_API_KEY` environment variable

---

## Security

### Authentication
- Passwords hashed with bcrypt
- JWT-based sessions via NextAuth.js
- Password reset tokens with expiration
- Suspended users blocked at login

### Route Protection
- Middleware (`proxy.ts`) enforces role-based access on all page routes
- API routes independently verify authentication and authorization
- Admin routes double-check ADMIN role

### Security Headers (next.config.ts)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Data Validation
- All inputs validated with Zod schemas on both client and server
- SQL injection prevented by Prisma ORM (parameterized queries)
- Stripe webhooks verified with signing secret

---

## Environment Variables

```bash
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Authentication
AUTH_SECRET="min-32-char-random-string"
AUTH_URL="http://localhost:3000"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="FreelanceHub"

# Stripe (Payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Brevo (Email)
BREVO_API_KEY="xkeysib-..."
BREVO_SENDER_EMAIL="noreply@yourplatform.com"
BREVO_SENDER_NAME="FreelanceHub"

# AI Chatbot (optional)
ANTHROPIC_API_KEY="sk-ant-..."

# File Uploads
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE_MB="5"
```

---

## Demo Accounts

All accounts use password: **`Password123`**

| Role | Email | Details |
|------|-------|---------|
| Admin | admin@freelancehub.com | Full platform access |
| Client | techcorp@example.com | TechCorp Solutions, Technology |
| Client | designstudio@example.com | Creative Design Studio, Media |
| Client | startupventures@example.com | Startup Ventures, Finance |
| Freelancer | alex@example.com | Full-Stack Developer, $85/hr |
| Freelancer | sarah@example.com | UI/UX Designer, $75/hr |
| Freelancer | mike@example.com | Data Scientist, $95/hr (suspended) |

### Pre-seeded Data
- 25 skills
- 6 jobs (5 open, 1 filled)
- 5 applications in various statuses
- 2 conversations with message history
- 3 contracts (active, completed, pending)
- 2 completed payments with platform fees
- 1 five-star review
- 1 admin action (user suspension)

---

## Setup & Running

```bash
# 1. Clone and install
cd freelance-platform
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Supabase, Stripe, and Brevo credentials

# 3. Push database schema
npx prisma db push

# 4. Seed demo data
npx tsx prisma/seed.ts

# 5. Start development server
npm run dev
# Open http://localhost:3000

# For Stripe webhook testing locally:
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Project Statistics

| Metric | Count |
|--------|-------|
| Total source files | 100+ |
| Page routes | 27 |
| API endpoints | 39 |
| Database models | 14 |
| Database enums | 5 |
| UI components | 14 |
| Feature components | 27 |
| Validation schemas | 10 |
| Email templates | 7 |
| Production dependencies | 22 |
| Dev dependencies | 10 |
| Environment variables | 16 |

---

## Known Limitations (MVP)

1. **Freelancer payouts** are mocked — shows "Payout pending" status
2. **File uploads** use local storage (not S3/R2)
3. **Messaging** uses polling (not WebSockets) — 4-second intervals
4. **Search** is basic keyword matching (no full-text search engine)
5. **No email verification** flow (just email/password auth)
6. **Hourly contracts** not supported — fixed-price only
7. **No dispute resolution** system
8. **No notification center** — only email notifications
9. **Single currency** (USD only)
10. **No multi-language** support
