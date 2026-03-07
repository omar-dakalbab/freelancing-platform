"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import {
  Menu, X, Briefcase, LogOut, User, ChevronDown, Shield, ArrowRight,
  LayoutDashboard, FolderOpen, FileText, MessageSquare, CreditCard, Search, ScrollText,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Session } from "next-auth";

interface NavbarProps {
  session: Session | null;
}

const clientLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/my-jobs", label: "My Jobs", icon: FolderOpen },
  { href: "/dashboard/contracts", label: "Contracts", icon: ScrollText },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
];

const freelancerLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Find Jobs", icon: Search },
  { href: "/dashboard/applications", label: "Applications", icon: FileText },
  { href: "/dashboard/contracts", label: "Contracts", icon: ScrollText },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
];

export function Navbar({ session }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const role = user?.role;
  const navLinks = role === "CLIENT" ? clientLinks : role === "FREELANCER" ? freelancerLinks : [];

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // Close profile dropdown on Escape or click outside
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setProfileOpen(false);
    }
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }

    if (profileOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  // Poll for unread messages count
  useEffect(() => {
    if (!user) return;

    async function fetchUnread() {
      try {
        const res = await fetch("/api/conversations");
        if (res.ok) {
          const json = await res.json();
          const total = (json.data as Array<{ unreadCount: number }>).reduce(
            (sum: number, c: { unreadCount: number }) => sum + c.unreadCount,
            0
          );
          setUnreadCount(total);
        }
      } catch {
        // Ignore
      }
    }

    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <nav
      className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-800 shadow-sm" aria-hidden="true">
              <Briefcase className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              Freelance<span className="text-accent-600">Hub</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          {user && (
            <div className="hidden md:flex items-center gap-0.5" role="menubar">
              {navLinks.map((link) => {
                const isMessages = link.href === "/dashboard/messages";
                const isActive = pathname === link.href || (isMessages && pathname.startsWith("/dashboard/messages"));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-3 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2",
                      isActive
                        ? "bg-brand-50 text-brand-800 shadow-sm"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                    {isMessages && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent-600 px-1 text-[10px] font-bold text-white ring-2 ring-white" aria-label={`${unreadCount} unread messages`}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Guest nav links (homepage) */}
          {!user && (
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/jobs"
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              >
                Browse Jobs
              </Link>
              <Link
                href="/freelancers"
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              >
                Find Talent
              </Link>
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!user ? (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="shadow-sm">
                    Sign up free
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </Link>
              </>
            ) : (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-100 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  aria-label="Account menu"
                >
                  <Avatar
                    src={user.avatar}
                    alt={user.email || "User"}
                    email={user.email || ""}
                    size="sm"
                  />
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {user.email?.split("@")[0]}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", profileOpen && "rotate-180")} aria-hidden="true" />
                </button>

                {profileOpen && (
                  <div
                    className="absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-gray-200 bg-white shadow-xl py-2 ring-1 ring-black/5"
                    role="menu"
                    aria-label="Account options"
                  >
                    <div className="px-4 py-3 mb-1">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.avatar}
                          alt={user.email || "User"}
                          email={user.email || ""}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                          <p className="text-xs text-gray-500 capitalize">{role?.toLowerCase()} account</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mx-1"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                      >
                        <User className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        My Profile
                      </Link>
                      {role === "ADMIN" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent-700 hover:bg-accent-50 transition-colors rounded-lg mx-1"
                          role="menuitem"
                          onClick={() => setProfileOpen(false)}
                        >
                          <Shield className="h-4 w-4 text-accent-600" aria-hidden="true" />
                          Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-gray-100 pt-1 mt-1">
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-lg mx-1"
                        style={{ width: "calc(100% - 0.5rem)" }}
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            {user && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && user && (
        <div className="md:hidden border-t border-gray-200 bg-white px-3 py-3 shadow-lg" role="menu" aria-label="Mobile navigation">
          <div className="space-y-0.5">
            {navLinks.map((link) => {
              const isMessages = link.href === "/dashboard/messages";
              const isActive = pathname === link.href || (isMessages && pathname.startsWith("/dashboard/messages"));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-brand-50 text-brand-800"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                  role="menuitem"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-4.5 w-4.5", isActive ? "text-brand-800" : "text-gray-400")} aria-hidden="true" />
                    {link.label}
                  </div>
                  {isMessages && unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-600 px-1.5 text-xs font-bold text-white" aria-label={`${unreadCount} unread`}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
