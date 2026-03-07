import Link from "next/link";
import { Briefcase } from "lucide-react";

const footerLinks = {
  platform: [
    { href: "/jobs", label: "Browse Jobs" },
    { href: "/freelancers", label: "Find Talent" },
    { href: "/register?role=CLIENT", label: "Post a Job" },
    { href: "/register?role=FREELANCER", label: "Become a Freelancer" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/blog", label: "Blog" },
    { href: "/careers", label: "Careers" },
  ],
  support: [
    { href: "/help", label: "Help Center" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/trust", label: "Trust & Safety" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-2 gap-8 py-12 sm:py-16 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-800 shadow-sm" aria-hidden="true">
                <Briefcase className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900">
                Freelance<span className="text-accent-600">Hub</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-gray-500 max-w-xs">
              The premier platform connecting businesses with top freelance talent worldwide.
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900">
              Platform
            </h3>
            <nav className="mt-4 flex flex-col gap-2.5" aria-label="Platform links">
              {footerLinks.platform.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-500 hover:text-brand-800 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900">
              Company
            </h3>
            <nav className="mt-4 flex flex-col gap-2.5" aria-label="Company links">
              {footerLinks.company.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-500 hover:text-brand-800 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900">
              Support
            </h3>
            <nav className="mt-4 flex flex-col gap-2.5" aria-label="Support links">
              {footerLinks.support.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-500 hover:text-brand-800 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 py-6 sm:flex-row">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} FreelanceHub. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
            >
              Privacy
            </Link>
            <Link
              href="/cookies"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
