"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Briefcase, Eye, EyeOff, Building2, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get("role") as "CLIENT" | "FREELANCER") || "CLIENT";
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"CLIENT" | "FREELANCER">(defaultRole);

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
  }

  async function onSubmit(data: RegisterInput) {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error?.message || "Registration failed");
        return;
      }

      // Auto sign in after registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.success("Account created! Please sign in.");
        router.push("/login");
        return;
      }

      toast.success("Account created successfully!");
      router.push("/dashboard/profile");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-800 mb-4">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-1 text-sm text-gray-500">Join thousands on FreelanceHub</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {/* Role selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              I want to...
            </label>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account type">
              <button
                type="button"
                role="radio"
                aria-checked={selectedRole === "CLIENT"}
                onClick={() => handleRoleSelect("CLIENT")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2",
                  selectedRole === "CLIENT"
                    ? "border-accent-600 bg-accent-50 text-accent-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                <Building2 className="h-5 w-5" aria-hidden="true" />
                Hire Freelancers
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={selectedRole === "FREELANCER"}
                onClick={() => handleRoleSelect("FREELANCER")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2",
                  selectedRole === "FREELANCER"
                    ? "border-accent-600 bg-accent-50 text-accent-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                <Laptop className="h-5 w-5" aria-hidden="true" />
                Find Work
              </button>
            </div>
            {errors.role && (
              <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              error={errors.email?.message}
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
              {...register("confirmPassword")}
            />

            {/* Hidden role field */}
            <input type="hidden" {...register("role")} />

            <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
              Create Account
            </Button>

            <p className="text-xs text-gray-500 text-center">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent-600 hover:text-accent-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
