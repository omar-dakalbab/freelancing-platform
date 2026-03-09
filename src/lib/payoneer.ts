// ---------------------------------------------------------------------------
// Payoneer REST API client (payout-only)
// Uses native fetch — no SDK dependency needed.
// ---------------------------------------------------------------------------

const PAYONEER_PARTNER_ID = process.env.PAYONEER_PARTNER_ID;
const PAYONEER_USERNAME = process.env.PAYONEER_USERNAME;
const PAYONEER_PASSWORD = process.env.PAYONEER_PASSWORD;
const PAYONEER_PROGRAM_ID = process.env.PAYONEER_PROGRAM_ID;
const PAYONEER_API_URL =
  process.env.PAYONEER_API_URL || "https://api.sandbox.payoneer.com";

function getAuthHeader(): string {
  if (!PAYONEER_USERNAME || !PAYONEER_PASSWORD) {
    throw new Error("PAYONEER_USERNAME and PAYONEER_PASSWORD must be set");
  }
  return `Basic ${Buffer.from(`${PAYONEER_USERNAME}:${PAYONEER_PASSWORD}`).toString("base64")}`;
}

interface PayoneerPayoutParams {
  payeeEmail: string;
  amount: number;
  currency?: string;
  description: string;
  paymentId: string; // unique reference
}

interface PayoneerPayoutResult {
  payment_id: string;
  status: string;
}

export async function createPayoneerPayout(
  params: PayoneerPayoutParams
): Promise<PayoneerPayoutResult> {
  if (!PAYONEER_PARTNER_ID || !PAYONEER_PROGRAM_ID) {
    throw new Error("PAYONEER_PARTNER_ID and PAYONEER_PROGRAM_ID must be set");
  }

  const res = await fetch(
    `${PAYONEER_API_URL}/v4/programs/${PAYONEER_PROGRAM_ID}/payouts`,
    {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payee_id: params.payeeEmail,
        amount: params.amount,
        currency: params.currency || "USD",
        description: params.description,
        client_reference_id: params.paymentId,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Payoneer API error: ${res.status} ${text}`);
  }

  return res.json();
}
