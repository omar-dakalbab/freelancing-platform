"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  Eye, EyeOff, Building2, Laptop, ArrowRight, CheckCircle, Users, Globe, Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { Confetti } from "@/components/ui/confetti";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import { track, EVENTS } from "@/lib/analytics";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get("role") as "CLIENT" | "FREELANCER") || "CLIENT";
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"CLIENT" | "FREELANCER">(defaultRole);
  const [showConfetti, setShowConfetti] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: defaultRole },
  });

  function handleRoleSelect(role: "CLIENT" | "FREELANCER") {
    setSelectedRole(role);
    setValue("role", role);
    track(EVENTS.ROLE_SELECTED, { role });
  }

  async function onSubmit(data: RegisterInput) {
    track(EVENTS.REGISTER_STARTED, { role: data.role });
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        track(EVENTS.REGISTER_FAILED, { reason: json.error?.message || "unknown" });
        toast.error(json.error?.message || "Registration failed");
        return;
      }

      track(EVENTS.REGISTER_SUCCESS, { role: data.role });
      setShowConfetti(true);
      toast.success("Account created! Please check your email to verify.");
      setTimeout(() => router.push("/verify-email"), 1500);
    } catch {
      track(EVENTS.REGISTER_FAILED, { reason: "unknown_error" });
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <>
    <Confetti active={showConfetti} />
    <div className="flex h-screen overflow-hidden">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800">
        {/* Background decorations */}
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute -top-40 -right-20 h-[500px] w-[500px] rounded-full bg-accent-600/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-brand-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-60" />
          <div className="absolute top-32 left-16 h-3 w-3 rounded-full bg-accent-400/30 animate-float" />
          <div className="absolute bottom-40 right-20 h-2 w-2 rounded-full bg-white/20 animate-float-delay" />
        </div>

        <div className="relative flex flex-col justify-between p-10 xl:p-12 w-full">
          {/* Logo */}
          <Link href="/">
            <Logo variant="white" size="sm" />
          </Link>

          {/* Center content */}
          <div className="max-w-lg">
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-[1.15]">
              Start your journey with{" "}
              <span className="bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent">
                top talent
              </span>
            </h2>
            <p className="mt-4 text-base text-white/50 leading-relaxed">
              Join thousands of professionals and businesses growing together on LetsWork.
            </p>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 gap-3.5">
              {[
                { value: "50K+", label: "Active freelancers", icon: Users },
                { value: "95%", label: "Client satisfaction", icon: CheckCircle },
                { value: "120+", label: "Countries", icon: Globe },
                { value: "10K+", label: "Projects completed", icon: Briefcase },
              ].map((stat, i) => (
                <div key={i} className="rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm p-4 xl:p-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 mb-2">
                    <stat.icon className="h-4 w-4 text-accent-400" aria-hidden="true" />
                  </div>
                  <p className="text-xl xl:text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["SC", "MJ", "ER", "AK", "LW"].map((initials, i) => (
                <div
                  key={i}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand-900 bg-gradient-to-br from-brand-600 to-brand-800 text-[10px] font-bold text-white"
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/50">
              Join <span className="text-white/90 font-semibold">10,000+</span> professionals
            </p>
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
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Create your account</h1>
            <p className="mt-2 text-sm text-gray-500">
              Get started in under a minute — it&apos;s free
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm">
            {/* Role selection */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 block mb-2.5">
                I want to...
              </label>
              <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account type">
                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedRole === "CLIENT"}
                  onClick={() => handleRoleSelect("CLIENT")}
                  className={cn(
                    "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2",
                    selectedRole === "CLIENT"
                      ? "border-brand-700 bg-brand-50/50 text-brand-800 shadow-sm"
                      : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {selectedRole === "CLIENT" && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-4 w-4 text-brand-600" aria-hidden="true" />
                    </div>
                  )}
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                    selectedRole === "CLIENT" ? "bg-brand-100" : "bg-gray-100"
                  )}>
                    <Building2 className="h-5 w-5" aria-hidden="true" />
                  </div>
                  Hire Freelancers
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedRole === "FREELANCER"}
                  onClick={() => handleRoleSelect("FREELANCER")}
                  className={cn(
                    "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2",
                    selectedRole === "FREELANCER"
                      ? "border-brand-700 bg-brand-50/50 text-brand-800 shadow-sm"
                      : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {selectedRole === "FREELANCER" && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-4 w-4 text-brand-600" aria-hidden="true" />
                    </div>
                  )}
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                    selectedRole === "FREELANCER" ? "bg-brand-100" : "bg-gray-100"
                  )}>
                    <Laptop className="h-5 w-5" aria-hidden="true" />
                  </div>
                  Find Work
                </button>
              </div>
              {errors.role && (
                <p className="mt-1.5 text-xs text-red-600">{errors.role.message}</p>
              )}
            </div>

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

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                required
                error={errors.password?.message}
                hint="Must contain uppercase letter and number"
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

              <Input
                label="Confirm password"
                type="password"
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
                error={errors.confirmPassword?.message}
                className="h-11"
                {...register("confirmPassword")}
              />

              {/* Hidden role field */}
              <input type="hidden" {...register("role")} />

              <Button type="submit" className="w-full" loading={isSubmitting} size="xl">
                Create Account
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>

              <p className="text-xs text-gray-400 text-center leading-relaxed">
                By creating an account, you agree to our{" "}
                <span className="text-gray-500 underline underline-offset-2 cursor-pointer">Terms of Service</span>
                {" "}and{" "}
                <span className="text-gray-500 underline underline-offset-2 cursor-pointer">Privacy Policy</span>.
              </p>
            </form>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
