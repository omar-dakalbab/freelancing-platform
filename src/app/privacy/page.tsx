import type { Metadata } from "next";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how LetsWork collects, uses, and protects your personal information.",
};

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly: name, email address, password, profile details (bio, skills, portfolio, hourly rate), and payment information processed through Stripe. We also collect usage data automatically, including IP address, browser type, pages visited, and interaction patterns through cookies and similar technologies.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use your information to: (a) provide, maintain, and improve the Platform; (b) process transactions and send related information; (c) send transactional emails (verification, password resets, contract updates, payment confirmations); (d) enable communication between clients and freelancers; (e) display your public profile to other users; (f) detect and prevent fraud, abuse, and security threats; (g) comply with legal obligations.`,
  },
  {
    title: "3. Information Sharing",
    content: `We share your information with: (a) other Platform users as necessary (e.g., your public profile, application details); (b) Stripe for payment processing; (c) Brevo for transactional email delivery; (d) service providers who assist in Platform operations; (e) law enforcement when required by law. We do not sell your personal information to third parties.`,
  },
  {
    title: "4. Data Security",
    content: `We implement industry-standard security measures including encrypted data transmission (TLS/SSL), hashed passwords (bcrypt), secure session management, and regular security audits. While we strive to protect your data, no method of electronic transmission or storage is 100% secure. You are responsible for keeping your login credentials confidential.`,
  },
  {
    title: "5. Cookies",
    content: `We use essential cookies for authentication and session management. We may also use analytics cookies to understand how users interact with the Platform. You can manage cookie preferences through your browser settings. Disabling essential cookies may prevent you from using certain Platform features. For more details, see our Cookie Policy.`,
  },
  {
    title: "6. Your Rights",
    content: `Depending on your jurisdiction, you may have the right to: (a) access the personal data we hold about you; (b) request correction of inaccurate data; (c) request deletion of your data; (d) object to or restrict processing of your data; (e) data portability; (f) withdraw consent. To exercise these rights, contact us at omardakelbab.dev@gmail.com.`,
  },
  {
    title: "7. Data Retention",
    content: `We retain your account data for as long as your account is active. After account deletion, we may retain certain data for up to 3 years to comply with legal obligations, resolve disputes, and enforce our agreements. Anonymized and aggregated data may be retained indefinitely for analytics purposes.`,
  },
  {
    title: "8. International Data Transfers",
    content: `Your data may be processed in countries other than your own. We ensure appropriate safeguards are in place for international transfers, including standard contractual clauses where applicable. By using the Platform, you consent to the transfer of your data to the countries where our servers and service providers are located.`,
  },
  {
    title: "9. Children's Privacy",
    content: `LetsWork is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we learn that we have collected data from a child under 18, we will take steps to delete that information promptly.`,
  },
  {
    title: "10. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a notice on the Platform. Your continued use of the Platform after changes are posted constitutes acceptance of the updated policy.`,
  },
  {
    title: "11. Contact Us",
    content: `If you have questions about this Privacy Policy or our data practices, contact us at omardakelbab.dev@gmail.com.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 py-16 sm:py-20">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true"><div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-accent-600/10 blur-3xl" /></div>
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Privacy Policy
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
              At LetsWork, we take your privacy seriously. This Privacy Policy explains how we collect,
              use, share, and protect your personal information when you use our platform.
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
