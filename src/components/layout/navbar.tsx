"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import {
  Menu, X, LogOut, User, ChevronDown, Shield, ArrowRight,
  LayoutDashboard, FolderOpen, FileText, MessageSquare, CreditCard, Search, ScrollText,
  Sparkles,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import type { Session } from "next-auth";
import { track, EVENTS } from "@/lib/analytics";

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
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
];

const AUTH_ROUTES = ["/login", "/register"];

export function Navbar({ session }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const role = user?.role;

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const navLinks = role === "CLIENT" ? clientLinks : role === "FREELANCER" ? freelancerLinks : [];

  // Detect if we're on the homepage (dark hero)
  const isHomepage = pathname === "/";

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  useEffect(() => {
    if (!user) return;

    // Skip polling when on messages page — MessagesLayout handles it there
    const onMessagesPage = pathname.startsWith("/dashboard/messages");

    async function fetchUnread() {
      if (document.hidden || onMessagesPage) return;
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
    const interval = setInterval(fetchUnread, 30000);

    function handleVisibilityChange() {
      if (!document.hidden && !onMessagesPage) fetchUnread();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, pathname]);

  if (isAuthRoute) return null;

  // Determine navbar color scheme based on page and scroll state
  const isTransparent = isHomepage && !scrolled && !user;

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isTransparent
            ? "bg-transparent"
            : scrolled
              ? "bg-white/80 backdrop-blur-xl shadow-sm shadow-gray-200/50"
              : "bg-white/80 backdrop-blur-xl",
          !isTransparent && "border-b border-gray-200/60"
        )}
        aria-label="Main navigation"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
            >
              <Logo variant={isTransparent ? "white" : "dark"} />
            </Link>

            {/* Desktop nav links — authenticated */}
            {user && (
              <div className="hidden md:flex items-center gap-1 rounded-full bg-gray-100/80 p-1" role="menubar">
                {navLinks.map((link) => {
                  const isMessages = link.href === "/dashboard/messages";
                  const isActive = pathname === link.href || (isMessages && pathname.startsWith("/dashboard/messages"));
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2",
                        isActive
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className={cn("h-3.5 w-3.5", isActive ? "text-brand-600" : "text-gray-400")} aria-hidden="true" />
                      {link.label}
                      {isMessages && unreadCount > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-600 px-1 text-[10px] font-bold text-white animate-pulse" aria-label={`${unreadCount} unread messages`}>
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Guest nav links */}
            {!user && (
              <div className="hidden md:flex items-center gap-1">
                {[
                  { href: "/jobs", label: "Browse Jobs" },
                  { href: "/freelancers", label: "Find Talent" },
                  { href: "/blog", label: "Blog" },
                  { href: "/about", label: "About" },
                  { href: "/contact", label: "Contact" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200",
                      isTransparent
                        ? "text-white/70 hover:text-white hover:bg-white/10"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Right side */}
            <div className="flex items-center gap-2.5">
              {!user ? (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "rounded-full",
                        isTransparent && "text-white/80 hover:text-white hover:bg-white/10"
                      )}
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      size="sm"
                      className={cn(
                        "rounded-full",
                        isTransparent
                          ? "bg-white text-brand-900 hover:bg-white/90"
                          : ""
                      )}
                    >
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      Get started
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-full px-2 py-1.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2",
                      profileOpen
                        ? "bg-gray-100 ring-2 ring-gray-200"
                        : "hover:bg-gray-100"
                    )}
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
                    <span className="hidden sm:block text-[13px] font-medium text-gray-700 max-w-[120px] truncate">
                      {user.email?.split("@")[0]}
                    </span>
                    <ChevronDown className={cn(
                      "h-3.5 w-3.5 text-gray-400 transition-transform duration-200",
                      profileOpen && "rotate-180"
                    )} aria-hidden="true" />
                  </button>

                  {/* Profile dropdown */}
                  <div
                    className={cn(
                      "absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-gray-200/80 bg-white/95 backdrop-blur-xl shadow-xl shadow-gray-200/50 transition-all duration-200 origin-top-right",
                      profileOpen
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                    )}
                    role="menu"
                    aria-label="Account options"
                  >
                    <div className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.avatar}
                          alt={user.email || "User"}
                          email={user.email || ""}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                          <div className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5">
                            <span className="text-[11px] font-medium text-brand-700 capitalize">{role?.toLowerCase()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 px-2 py-2">
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors rounded-xl"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                          <User className="h-4 w-4 text-gray-500" aria-hidden="true" />
                        </div>
                        My Profile
                      </Link>
                      {role === "ADMIN" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors rounded-xl"
                          role="menuitem"
                          onClick={() => setProfileOpen(false)}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                            <Shield className="h-4 w-4 text-gray-500" aria-hidden="true" />
                          </div>
                          Admin Panel
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-100 px-2 py-2">
                      <button
                        onClick={() => { track(EVENTS.LOGOUT); signOut({ callbackUrl: "/" }); }}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors rounded-xl"
                        role="menuitem"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                          <LogOut className="h-4 w-4 text-red-500" aria-hidden="true" />
                        </div>
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={cn(
                  "md:hidden flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2",
                  mobileOpen
                    ? "bg-gray-100 rotate-90"
                    : isTransparent
                      ? "hover:bg-white/10"
                      : "hover:bg-gray-100"
                )}
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen ? (
                  <X className={cn("h-5 w-5", isTransparent ? "text-white" : "text-gray-600")} aria-hidden="true" />
                ) : (
                  <Menu className={cn("h-5 w-5", isTransparent ? "text-white" : "text-gray-600")} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "md:hidden transition-all duration-300 overflow-hidden",
            mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="border-t border-gray-100 bg-white/95 backdrop-blur-xl px-4 py-3" role="menu" aria-label="Mobile navigation">
            {/* Guest links for mobile */}
            {!user && (
              <div className="space-y-1 mb-3">
                {[
                  { href: "/jobs", label: "Browse Jobs", icon: Search },
                  { href: "/freelancers", label: "Find Talent", icon: User },
                  { href: "/blog", label: "Blog", icon: FileText },
                  { href: "/about", label: "About", icon: Sparkles },
                  { href: "/contact", label: "Contact", icon: MessageSquare },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    role="menuitem"
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <link.icon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                    </div>
                    {link.label}
                  </Link>
                ))}
                <div className="pt-2 flex gap-2">
                  <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full rounded-xl">
                      Get started
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Authenticated links for mobile */}
            {user && (
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const isMessages = link.href === "/dashboard/messages";
                  const isActive = pathname === link.href || (isMessages && pathname.startsWith("/dashboard/messages"));
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-3 rounded-xl text-[13px] font-medium transition-all duration-200",
                        isActive
                          ? "bg-brand-50 text-brand-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                      role="menuitem"
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setMobileOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                          isActive ? "bg-brand-100" : "bg-gray-100"
                        )}>
                          <Icon className={cn("h-4 w-4", isActive ? "text-brand-600" : "text-gray-400")} aria-hidden="true" />
                        </div>
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
            )}
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className={cn(isTransparent ? "h-0" : "h-16")} />
    </>
  );
}
