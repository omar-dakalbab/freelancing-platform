"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Briefcase, CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Status = "verifying" | "success" | "error" | "no-token";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>(token ? "verifying" : "no-token");
  const [errorMessage, setErrorMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("no-token");
      return;
    }

    setStatus("verifying");
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const json = await res.json();
        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(json.error?.message || "Verification failed");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMessage("Something went wrong. Please try again.");
      });
  }, [token]);

  async function handleResend() {
    if (!resendEmail) return;
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });
      if (res.ok) {
        toast.success("If your account exists and is unverified, a new link has been sent.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200/80 p-6 sm:p-8">
      {status === "verifying" && (
        <div className="text-center py-4">
          <Loader2 className="h-10 w-10 text-brand-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-base font-semibold text-gray-900">Verifying your email...</h2>
          <p className="mt-2 text-sm text-gray-500">Please wait a moment.</p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center py-4">
          <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-base font-semibold text-gray-900">Email verified!</h2>
          <p className="mt-2 text-sm text-gray-500">
            Your email has been verified successfully. You can now sign in.
          </p>
          <Link href="/login">
            <Button className="mt-5" size="lg">
              Sign in
            </Button>
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="text-center py-4">
          <XCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-base font-semibold text-gray-900">Verification failed</h2>
          <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>

          <div className="mt-5 space-y-3">
            <p className="text-sm text-gray-600">Need a new verification link?</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="you@example.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
              />
              <Button onClick={handleResend} loading={resending} disabled={!resendEmail}>
                Resend
              </Button>
            </div>
          </div>
        </div>
      )}

      {status === "no-token" && (
        <div className="text-center py-4">
          <Mail className="h-10 w-10 text-brand-500 mx-auto mb-4" />
          <h2 className="text-base font-semibold text-gray-900">Check your email</h2>
          <p className="mt-2 text-sm text-gray-500">
            We&apos;ve sent a verification link to your email address. Click the link to verify
            your account.
          </p>
          <p className="mt-3 text-xs text-gray-400">
            Don&apos;t see the email? Check your spam folder.
          </p>

          <div className="mt-5 space-y-3">
            <p className="text-sm text-gray-600">Didn&apos;t receive the email?</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="you@example.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
              />
              <Button onClick={handleResend} loading={resending} disabled={!resendEmail}>
                Resend
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-800 mb-4">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Email Verification</h1>
        </div>

        <Suspense
          fallback={
            <div className="rounded-xl border border-gray-200/80 p-6 sm:p-8">
              <div className="text-center py-4">
                <Loader2 className="h-10 w-10 text-brand-500 mx-auto mb-4 animate-spin" />
                <h2 className="text-base font-semibold text-gray-900">Verifying your email...</h2>
                <p className="mt-2 text-sm text-gray-500">Please wait a moment.</p>
              </div>
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/login" className="font-medium text-brand-700 hover:text-brand-800">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
