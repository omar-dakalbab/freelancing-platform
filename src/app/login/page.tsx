"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  Eye, EyeOff, Mail, ArrowRight, Shield, Zap, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { track, EVENTS } from "@/lib/analytics";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    track(EVENTS.LOGIN_STARTED, { method: "credentials" });
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        const checkRes = await fetch("/api/auth/check-verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email }),
        });
        const checkJson = await checkRes.json();

        if (checkJson.data?.unverified) {
          track(EVENTS.LOGIN_FAILED, { reason: "unverified_email" });
          setUnverifiedEmail(data.email);
          return;
        }

        track(EVENTS.LOGIN_FAILED, { reason: "invalid_credentials" });
        toast.error("Invalid email or password");
        return;
      }

      track(EVENTS.LOGIN_SUCCESS, { method: "credentials" });
      toast.success("Welcome back!");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      track(EVENTS.LOGIN_FAILED, { reason: "unknown_error" });
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800">
        {/* Background decorations */}
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute -top-40 -left-20 h-[500px] w-[500px] rounded-full bg-accent-600/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-brand-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-60" />
          <div className="animate-float absolute top-20 left-[15%] h-2 w-2 rounded-full bg-accent-400/30" />
          <div className="animate-float-delay absolute top-40 right-[20%] h-1.5 w-1.5 rounded-full bg-white/20" />
        </div>

        <div className="relative flex flex-col justify-between p-10 xl:p-12 w-full">
          {/* Logo */}
          <Link href="/">
            <Logo variant="white" size="sm" />
          </Link>

          {/* Center content */}
          <div className="max-w-lg">
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-[1.15]">
              Welcome back to your{" "}
              <span className="bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent">
                professional hub
              </span>
            </h2>
            <p className="mt-4 text-base text-white/50 leading-relaxed">
              Continue managing your projects, tracking payments, and connecting with top talent.
            </p>

            {/* Feature highlights */}
            <div className="mt-8 space-y-3.5">
              {[
                { icon: Shield, text: "Secure & encrypted login" },
                { icon: Zap, text: "Instant access to your dashboard" },
                { icon: Star, text: "Pick up where you left off" },
              ].map((item, i) => (
                <div key={i} className="homepage-fade-in flex items-center gap-3" style={{ animationDelay: `${i * 150}ms` }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/5">
                    <item.icon className="h-4 w-4 text-accent-400" />
                  </div>
                  <span className="text-sm text-white/70 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom testimonial */}
          <div className="relative overflow-hidden rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm p-5">
            <div className="animate-shimmer absolute inset-0 rounded-xl" />
            <div className="flex gap-1 mb-3" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
              ))}
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              &ldquo;The platform made it so easy to find and hire exceptional freelancers. Our project was completed ahead of schedule.&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-xs font-bold text-white">
                SC
              </div>
              <div>
                <p className="text-xs font-semibold text-white/90">Sarah Chen</p>
                <p className="text-xs text-white/40">CTO, TechFlow</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-cream px-4 py-12 sm:px-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex">
              <Logo variant="dark" size="sm" />
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Welcome back</h1>
            <p className="mt-2 text-sm text-gray-500">
              Sign in to your account to continue
            </p>
          </div>

          <ScrollReveal>
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm">
            {unverifiedEmail ? (
              <div className="text-center py-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-50 mb-5">
                  <Mail className="h-7 w-7 text-accent-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Verify your email</h2>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                  Your account <strong className="text-gray-700">{unverifiedEmail}</strong> has not been verified yet.
                  Check your inbox for the verification link.
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  Don&apos;t see the email? Check your spam folder or resend it.
                </p>
                <div className="mt-6 space-y-3">
                  <Button
                    className="w-full"
                    loading={resending}
                    onClick={async () => {
                      track(EVENTS.RESEND_VERIFICATION);
                      setResending(true);
                      try {
                        const res = await fetch("/api/auth/resend-verification", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: unverifiedEmail }),
                        });
                        if (res.ok) {
                          toast.success("Verification email sent! Check your inbox.");
                        } else {
                          toast.error("Something went wrong. Please try again.");
                        }
                      } catch {
                        toast.error("Something went wrong. Please try again.");
                      } finally {
                        setResending(false);
                      }
                    }}
                    size="lg"
                  >
                    Resend verification email
                  </Button>
                  <button
                    type="button"
                    onClick={() => setUnverifiedEmail(null)}
                    className="text-sm text-accent-600 hover:text-accent-700 font-medium transition-colors"
                  >
                    Back to sign in
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  error={errors.email?.message}
                  className="h-11"
                  {...register("email")}
                />

                <div>
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    autoComplete="current-password"
                    required
                    error={errors.password?.message}
                    className="h-11"
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="hover:text-gray-600 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                      </button>
                    }
                    {...register("password")}
                  />
                  <div className="mt-2 text-right">
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <Button type="submit" className="w-full group" loading={isSubmitting} size="xl">
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Button>
              </form>
            )}
          </div>
          </ScrollReveal>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-brand-700 hover:text-brand-800 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
