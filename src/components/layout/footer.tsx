"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";

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

const AUTH_ROUTES = ["/login", "/register"];

export function Footer() {
  const pathname = usePathname();

  if (AUTH_ROUTES.includes(pathname)) return null;

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 py-10 sm:py-12 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2">
              <Logo />
            </Link>
            <p className="mt-3 text-[13px] leading-relaxed text-gray-500 max-w-xs">
              Connecting businesses with top freelance talent worldwide.
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Platform
            </h3>
            <nav className="mt-3 flex flex-col gap-2" aria-label="Platform links">
              {footerLinks.platform.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13px] text-gray-600 hover:text-gray-900 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Company
            </h3>
            <nav className="mt-3 flex flex-col gap-2" aria-label="Company links">
              {footerLinks.company.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13px] text-gray-600 hover:text-gray-900 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Support
            </h3>
            <nav className="mt-3 flex flex-col gap-2" aria-label="Support links">
              {footerLinks.support.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13px] text-gray-600 hover:text-gray-900 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 py-5 sm:flex-row">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} LetsWork. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/terms"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
            >
              Privacy
            </Link>
            <Link
              href="/cookies"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
