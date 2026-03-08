"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import type { Session } from "next-auth";
import { identifyUser, setSuperProperties } from "@/lib/analytics";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

if (typeof window !== "undefined" && POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",

    // Pageviews — we capture manually on route change for SPA accuracy
    capture_pageview: false,
    capture_pageleave: true,

    // Autocapture — clicks, inputs, form submits
    autocapture: true,

    // Session recording — full session replays
    // @ts-expect-error — valid PostHog config option not yet in type defs
    enable_recording_consent_check: false,

    // Performance
    capture_performance: true,

    // Dead clicks & rage clicks
    capture_dead_clicks: true,

    // Network request capture (XHR/fetch timing, status codes)
    capture_heatmaps: true,

    // Disable in development for cleaner data
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development") {
        ph.opt_out_capturing();
        ph.set_config({ disable_session_recording: true });
      }
    },
  });
}

/** Captures SPA pageviews on route change */
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (pathname && ph) {
      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) url += `?${search}`;

      ph.capture("$pageview", {
        $current_url: url,
        path: pathname,
        search: search || undefined,
        referrer: document.referrer || undefined,
      });
    }
  }, [pathname, searchParams, ph]);

  return null;
}

/** Identifies the user in PostHog when session is available */
function PostHogIdentify({ session }: { session: Session | null }) {
  useEffect(() => {
    if (session?.user) {
      const { id, email, role } = session.user;
      if (id) {
        identifyUser(id, {
          email: email || undefined,
          role: role || undefined,
        });
        setSuperProperties({
          user_role: role || "unknown",
        });
      }
    }
  }, [session]);

  return null;
}

interface Props {
  children: React.ReactNode;
  session?: Session | null;
}

export function PostHogProvider({ children, session }: Props) {
  if (!POSTHOG_KEY) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      <PostHogIdentify session={session ?? null} />
      {children}
    </PHProvider>
  );
}
