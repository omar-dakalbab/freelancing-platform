// ---------------------------------------------------------------------------
// PayPal REST API v2 client
// Uses native fetch — no SDK dependency needed.
// ---------------------------------------------------------------------------

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox";

const BASE_URL =
  PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

let cachedToken: { token: string; expiresAt: number } | null = null;

/** Get an OAuth2 access token (cached until expiry). */
async function getAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set");
  }

  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const credentials = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000, // refresh 60s early
  };
  return cachedToken.token;
}

/** Make an authenticated request to PayPal. */
async function paypalFetch<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal API error: ${res.status} ${text}`);
  }

  // 204 No Content
  if (res.status === 204) return {} as T;
  return res.json();
}

// ---------------------------------------------------------------------------
// Orders API — Checkout
// ---------------------------------------------------------------------------

interface CreateOrderParams {
  amount: number; // USD, e.g. 500.00
  description: string;
  customId: string; // JSON stringified metadata
  returnUrl: string;
  cancelUrl: string;
}

interface PayPalOrder {
  id: string;
  status: string;
  links: Array<{ href: string; rel: string; method: string }>;
}

export async function createPayPalOrder(params: CreateOrderParams): Promise<PayPalOrder> {
  return paypalFetch<PayPalOrder>("/v2/checkout/orders", {
    method: "POST",
    body: {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: params.amount.toFixed(2),
          },
          description: params.description,
          custom_id: params.customId,
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            return_url: params.returnUrl,
            cancel_url: params.cancelUrl,
            user_action: "PAY_NOW",
            brand_name: "LetsWork",
          },
        },
      },
    },
  });
}

interface CaptureResult {
  id: string;
  status: string;
  purchase_units: Array<{
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: { currency_code: string; value: string };
      }>;
    };
  }>;
}

export async function capturePayPalOrder(orderId: string): Promise<CaptureResult> {
  return paypalFetch<CaptureResult>(`/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
  });
}

// ---------------------------------------------------------------------------
// Payouts API — Send money to freelancers
// ---------------------------------------------------------------------------

interface PayoutParams {
  recipientEmail: string;
  amount: number;
  note: string;
  senderBatchId: string;
}

interface PayPalPayoutResult {
  batch_header: {
    payout_batch_id: string;
    batch_status: string;
  };
}

export async function createPayPalPayout(params: PayoutParams): Promise<PayPalPayoutResult> {
  return paypalFetch<PayPalPayoutResult>("/v1/payments/payouts", {
    method: "POST",
    body: {
      sender_batch_header: {
        sender_batch_id: params.senderBatchId,
        email_subject: "You have a payment from LetsWork",
        email_message: "You received a payout for your completed contract on LetsWork.",
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            value: params.amount.toFixed(2),
            currency: "USD",
          },
          receiver: params.recipientEmail,
          note: params.note,
          sender_item_id: params.senderBatchId,
        },
      ],
    },
  });
}

// ---------------------------------------------------------------------------
// Webhook verification
// ---------------------------------------------------------------------------

export async function verifyPayPalWebhook(
  webhookId: string,
  headers: Record<string, string>,
  body: string
): Promise<boolean> {
  try {
    const result = await paypalFetch<{ verification_status: string }>(
      "/v1/notifications/verify-webhook-signature",
      {
        method: "POST",
        body: {
          auth_algo: headers["paypal-auth-algo"],
          cert_url: headers["paypal-cert-url"],
          transmission_id: headers["paypal-transmission-id"],
          transmission_sig: headers["paypal-transmission-sig"],
          transmission_time: headers["paypal-transmission-time"],
          webhook_id: webhookId,
          webhook_event: JSON.parse(body),
        },
      }
    );
    return result.verification_status === "SUCCESS";
  } catch {
    return false;
  }
}
