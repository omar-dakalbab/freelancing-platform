import type { Metadata } from "next";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read LetsWork's Terms of Service governing the use of our freelance platform.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using LetsWork ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Platform. We reserve the right to update these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the modified Terms.`,
  },
  {
    title: "2. Eligibility",
    content: `You must be at least 18 years old and capable of forming a binding legal agreement to use LetsWork. By registering, you represent that all information you provide is accurate and complete. Accounts registered with false information may be suspended or terminated.`,
  },
  {
    title: "3. Account Registration",
    content: `To access most features, you must create an account and select a role: Client or Freelancer. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. Notify us immediately if you suspect unauthorized access to your account.`,
  },
  {
    title: "4. Platform Services",
    content: `LetsWork provides a marketplace connecting clients seeking services with freelancers offering their skills. We facilitate job postings, applications, messaging, and contract tracking. LetsWork does not process payments and is not a party to any contract between clients and freelancers — we act solely as an intermediary platform.`,
  },
  {
    title: "5. Fees and Payments",
    content: `LetsWork is free to use. The Platform does not process payments or charge service fees of any kind. All compensation arrangements are made directly between clients and freelancers, outside of the Platform. LetsWork is not responsible for any payment disputes, non-payment, or financial arrangements between users.`,
  },
  {
    title: "6. User Conduct",
    content: `You agree not to: (a) use the Platform for any unlawful purpose; (b) post false, misleading, or fraudulent content; (c) harass, abuse, or threaten other users; (d) scrape, crawl, or use automated means to access the Platform; (e) upload malware or malicious code; (f) impersonate another person or entity. Violation of these rules may result in account suspension or termination.`,
  },
  {
    title: "7. Intellectual Property",
    content: `Unless otherwise agreed in a contract, freelancers retain ownership of their work until full payment is received, at which point ownership transfers to the client. LetsWork retains all rights to the Platform's design, branding, code, and content. You may not reproduce, distribute, or create derivative works from Platform content without written permission.`,
  },
  {
    title: "8. Contracts Between Users",
    content: `Contracts created through the Platform are agreements between the client and freelancer. LetsWork facilitates contract creation and tracking but is not liable for the quality of work, missed deadlines, payment disputes, or other disputes between parties. We encourage users to clearly define project scope, deliverables, and timelines before entering a contract.`,
  },
  {
    title: "9. Reviews and Ratings",
    content: `Users may leave reviews after contract completion. Reviews must be honest and based on genuine experiences. We reserve the right to remove reviews that are defamatory, fraudulent, or violate our community guidelines. Manipulation of the review system (e.g., fake reviews, review trading) is strictly prohibited.`,
  },
  {
    title: "10. Privacy",
    content: `Your use of the Platform is also governed by our Privacy Policy. By using LetsWork, you consent to the collection and use of your information as described in the Privacy Policy.`,
  },
  {
    title: "11. Limitation of Liability",
    content: `LetsWork is provided "as is" without warranties of any kind. To the maximum extent permitted by law, LetsWork shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenue, whether incurred directly or indirectly. Our total liability for any claim arising from your use of the Platform shall not exceed the fees you have paid to LetsWork in the 12 months preceding the claim.`,
  },
  {
    title: "12. Termination",
    content: `We may suspend or terminate your account at any time for violations of these Terms or for any other reason at our discretion. Upon termination, your right to use the Platform ceases immediately. Provisions that by their nature should survive termination (including ownership, warranty disclaimers, and liability limitations) will remain in effect.`,
  },
  {
    title: "13. Dispute Resolution",
    content: `Any disputes arising from these Terms or your use of the Platform shall first be attempted to be resolved through good-faith negotiation. If negotiation fails, disputes shall be resolved through binding arbitration in accordance with applicable laws. You agree to waive your right to participate in class action lawsuits against LetsWork.`,
  },
  {
    title: "14. Contact",
    content: `If you have questions about these Terms, please contact us at legal@tryletswork.com.`,
  },
];

export default function TermsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 py-16 sm:py-20">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true"><div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-accent-600/10 blur-3xl" /></div>
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-white/60">
            Last updated: March 1, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed mb-10">
              Welcome to LetsWork. These Terms of Service govern your access to and use of our platform.
              Please read them carefully before using our services.
            </p>
            <div className="space-y-8">
              {sections.map((section) => (
                <div key={section.title}>
                  <h2 className="text-lg font-bold text-gray-900 mb-3">{section.title}</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
