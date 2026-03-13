import type { Metadata } from "next";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Learn about how LetsWork uses cookies and similar technologies.",
};

const cookieTypes = [
  {
    name: "Essential Cookies",
    required: true,
    description: "These cookies are necessary for the Platform to function and cannot be disabled. They include session cookies for authentication, CSRF protection tokens, and preferences you set (like staying logged in).",
    examples: [
      { cookie: "next-auth.session-token", purpose: "Maintains your login session", duration: "Session / 30 days" },
      { cookie: "next-auth.csrf-token", purpose: "Prevents cross-site request forgery", duration: "Session" },
      { cookie: "next-auth.callback-url", purpose: "Redirects after authentication", duration: "Session" },
    ],
  },
  {
    name: "Analytics Cookies",
    required: false,
    description: "These cookies help us understand how visitors interact with the Platform by collecting anonymous usage statistics. This data helps us improve our services.",
    examples: [
      { cookie: "_ga / _gid", purpose: "Google Analytics — tracks page views and user behavior", duration: "2 years / 24 hours" },
    ],
  },
  {
    name: "Functional Cookies",
    required: false,
    description: "These cookies enable enhanced functionality like remembering your preferences, form data, and settings across visits.",
    examples: [
      { cookie: "theme-preference", purpose: "Remembers your display preference", duration: "1 year" },
    ],
  },
];

const sections = [
  {
    title: "What Are Cookies?",
    content: "Cookies are small text files stored on your device when you visit a website. They help the website remember your actions and preferences over time, so you don't have to re-enter them each visit. Cookies are widely used across the internet and are essential to how modern websites function.",
  },
  {
    title: "How to Manage Cookies",
    content: "Most web browsers allow you to control cookies through their settings. You can typically choose to block all cookies, accept all cookies, or be notified when a cookie is set. Note that blocking essential cookies may prevent you from using core Platform features like logging in. Check your browser's help documentation for specific instructions on managing cookies.",
  },
  {
    title: "Third-Party Cookies",
    content: "Some cookies on our Platform are set by third-party services we use, such as Stripe (payment processing) and Google Analytics (usage analytics). These third parties have their own privacy and cookie policies. We recommend reviewing their policies for more information on how they handle your data.",
  },
  {
    title: "Updates to This Policy",
    content: "We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices. We will notify users of significant changes through a notice on the Platform.",
  },
  {
    title: "Contact Us",
    content: "If you have questions about our use of cookies, please contact us at omardakelbab.dev@gmail.com.",
  },
];

export default function CookiesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 py-16 sm:py-20">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true"><div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-accent-600/10 blur-3xl" /></div>
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Cookie Policy
          </h1>
          <p className="mt-3 text-white/60">
            Last updated: March 1, 2026
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
          <p className="text-gray-600 leading-relaxed mb-12">
            This Cookie Policy explains how LetsWork (&quot;the Platform&quot;) uses cookies and similar tracking
            technologies when you visit our website. It explains what these technologies are, why we use them,
            and your rights to control their use.
          </p>
          </ScrollReveal>

          {/* Cookie types */}
          <div className="space-y-10 mb-14">
            {cookieTypes.map((type, index) => (
              <ScrollReveal key={type.name} delay={index * 0.1}>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-lg font-bold text-gray-900">{type.name}</h2>
                  {type.required && (
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-medium text-brand-700">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{type.description}</p>
                <div className="overflow-hidden rounded-lg border border-gray-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-4 py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Cookie</th>
                        <th className="px-4 py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Purpose</th>
                        <th className="px-4 py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {type.examples.map((ex) => (
                        <tr key={ex.cookie}>
                          <td className="px-4 py-3 font-mono text-xs text-gray-700">{ex.cookie}</td>
                          <td className="px-4 py-3 text-gray-600 text-[13px]">{ex.purpose}</td>
                          <td className="px-4 py-3 text-gray-500 text-[13px]">{ex.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Additional sections */}
          <ScrollReveal>
          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-bold text-gray-900 mb-3">{section.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
