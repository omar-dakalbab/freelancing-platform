import posthog from "posthog-js";

// ---------------------------------------------------------------------------
// Centralized analytics helper — wraps PostHog so the rest of the app
// doesn't need to import posthog-js directly.
// ---------------------------------------------------------------------------

type Properties = Record<string, unknown>;

/** Fire a custom event. No-ops if PostHog isn't initialised. */
export function track(event: string, properties?: Properties) {
  if (typeof window === "undefined") return;
  try {
    posthog.capture(event, properties);
  } catch {
    // silently ignore – analytics should never break the app
  }
}

/** Identify a logged-in user and attach traits. */
export function identifyUser(userId: string, traits?: Properties) {
  if (typeof window === "undefined") return;
  try {
    posthog.identify(userId, traits);
  } catch {
    // ignore
  }
}

/** Reset identity on logout. */
export function resetUser() {
  if (typeof window === "undefined") return;
  try {
    posthog.reset();
  } catch {
    // ignore
  }
}

/** Set a super-property that persists across events. */
export function setSuperProperties(properties: Properties) {
  if (typeof window === "undefined") return;
  try {
    posthog.register(properties);
  } catch {
    // ignore
  }
}

/** Track how long something takes (e.g. form completion). */
export function timeEvent(event: string) {
  if (typeof window === "undefined") return;
  try {
    // PostHog doesn't have a native time_event, but we can store the
    // start time and compute duration when the event fires.
    (window as unknown as Record<string, unknown>)[`__ph_timer_${event}`] = Date.now();
  } catch {
    // ignore
  }
}

/** Fire a timed event – automatically adds $duration if timeEvent was called. */
export function trackTimed(event: string, properties?: Properties) {
  if (typeof window === "undefined") return;
  const key = `__ph_timer_${event}`;
  const start = (window as unknown as Record<string, unknown>)[key] as number | undefined;
  const duration = start ? (Date.now() - start) / 1000 : undefined;
  delete (window as unknown as Record<string, unknown>)[key];
  track(event, { ...properties, ...(duration != null ? { $duration: duration } : {}) });
}

// ---------------------------------------------------------------------------
// Pre-defined event names — keeps naming consistent across the codebase.
// ---------------------------------------------------------------------------

export const EVENTS = {
  // Auth
  LOGIN_STARTED: "login_started",
  LOGIN_SUCCESS: "login_success",
  LOGIN_FAILED: "login_failed",
  REGISTER_STARTED: "register_started",
  REGISTER_SUCCESS: "register_success",
  REGISTER_FAILED: "register_failed",
  ROLE_SELECTED: "role_selected",
  LOGOUT: "logout",
  FORGOT_PASSWORD: "forgot_password_requested",
  RESET_PASSWORD: "reset_password_completed",
  RESEND_VERIFICATION: "resend_verification_email",

  // Jobs
  JOB_CREATED: "job_created",
  JOB_PUBLISHED: "job_published",
  JOB_SAVED_DRAFT: "job_saved_draft",
  JOB_EDITED: "job_edited",
  JOB_VIEWED: "job_viewed",
  JOB_SEARCHED: "job_searched",
  JOB_FILTERED: "job_filtered",
  JOB_FILTERS_CLEARED: "job_filters_cleared",

  // Applications
  APPLICATION_SUBMITTED: "application_submitted",
  APPLICATION_SHORTLISTED: "application_shortlisted",
  APPLICATION_REJECTED: "application_rejected",
  APPLICATION_HIRED: "application_hired",
  APPLICATION_VIEWED: "application_viewed",

  // Contracts
  CONTRACT_CREATED: "contract_created",
  CONTRACT_ACCEPTED: "contract_accepted",
  CONTRACT_DECLINED: "contract_declined",
  CONTRACT_SUBMITTED: "contract_work_submitted",
  CONTRACT_COMPLETED: "contract_completed",
  CONTRACT_CANCELLED: "contract_cancelled",
  CONTRACT_FUNDED: "contract_funded",
  MILESTONE_STARTED: "milestone_started",
  MILESTONE_SUBMITTED: "milestone_submitted",
  MILESTONE_APPROVED: "milestone_approved",

  // Payments
  PAYMENT_CHECKOUT_STARTED: "payment_checkout_started",
  PAYMENT_SUCCESS: "payment_success",
  PAYMENT_CANCELLED: "payment_cancelled",
  PAYOUT_REQUESTED: "payout_requested",
  STRIPE_CONNECTED: "stripe_account_connected",

  // Profile
  PROFILE_UPDATED: "profile_updated",
  AVATAR_UPLOADED: "avatar_uploaded",
  PORTFOLIO_ITEM_ADDED: "portfolio_item_added",
  PORTFOLIO_ITEM_DELETED: "portfolio_item_deleted",

  // Messaging
  MESSAGE_SENT: "message_sent",
  CONVERSATION_OPENED: "conversation_opened",

  // Reviews
  REVIEW_SUBMITTED: "review_submitted",
  REVIEW_RATING_SET: "review_rating_set",

  // Chat widget
  CHAT_WIDGET_OPENED: "chat_widget_opened",
  CHAT_WIDGET_CLOSED: "chat_widget_closed",
  CHAT_WIDGET_MESSAGE_SENT: "chat_widget_message_sent",
  CHAT_WIDGET_QUICK_ACTION: "chat_widget_quick_action",
  CHAT_WIDGET_RESET: "chat_widget_reset",

  // Contact
  CONTACT_FORM_SUBMITTED: "contact_form_submitted",

  // Navigation / engagement
  CTA_CLICKED: "cta_clicked",
  SEARCH_PERFORMED: "search_performed",
  NEWSLETTER_SUBSCRIBED: "newsletter_subscribed",
} as const;
