"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, DollarSign, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createApplicationSchema, type CreateApplicationInput } from "@/lib/validations/application";
import { formatCurrency } from "@/lib/utils";
import { track, EVENTS } from "@/lib/analytics";
import type { Job, ClientProfile, Skill, User } from "@prisma/client";
import type { Session } from "next-auth";

type JobWithRelations = Job & {
  clientProfile: ClientProfile & {
    user: Pick<User, "id" | "email" | "avatar">;
  };
  skills: Skill[];
  _count: { applications: number };
};

interface ApplyFormProps {
  job: JobWithRelations;
  session: Session;
}

export function ApplyForm({ job, session }: ApplyFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<CreateApplicationInput>({
    resolver: zodResolver(createApplicationSchema) as any,
    defaultValues: {
      jobId: job.id,
      bidAmount: job.budgetMin || undefined,
    },
  });

  const proposalText = watch("proposalText") || "";

  async function onSubmit(data: CreateApplicationInput) {
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to submit application");

      toast.success("Application submitted successfully!");
      track(EVENTS.APPLICATION_SUBMITTED, { job_id: data.jobId, bid_amount: data.bidAmount });
      router.push("/dashboard/applications");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit application");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={`/jobs/${job.id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Job
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Submit a Proposal</h1>
        <p className="mt-1 text-gray-500">For: {job.title}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" {...register("jobId")} />

            <Card>
              <CardHeader>
                <CardTitle>Your Proposal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <Textarea
                  label="Cover Letter"
                  placeholder="Introduce yourself, explain why you're the best fit, and describe your approach to this project. Be specific about your relevant experience and skills."
                  rows={8}
                  required
                  error={errors.proposalText?.message}
                  hint={`${proposalText.length}/5000 — Min. 50 characters`}
                  {...register("proposalText")}
                />

                <Input
                  label="Your Bid Amount (USD)"
                  type="number"
                  placeholder="Enter your total bid"
                  min={1}
                  required
                  error={errors.bidAmount?.message}
                  hint={
                    job.budgetMin && job.budgetMax
                      ? `Client budget: ${formatCurrency(job.budgetMin)} – ${formatCurrency(job.budgetMax)}`
                      : "Enter your total project cost"
                  }
                  leftIcon={<DollarSign className="h-4 w-4" />}
                  {...register("bidAmount", { valueAsNumber: true })}
                />
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Link href={`/jobs/${job.id}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={isSubmitting} size="lg">
                <Send className="h-4 w-4" />
                Submit Proposal
              </Button>
            </div>
          </form>
        </div>

        {/* Job summary sidebar */}
        <div>
          <Card className="sticky top-[5rem]">
            <CardHeader>
              <CardTitle className="text-base">Job Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">{job.title}</p>
                <p className="text-xs text-gray-500">
                  {job.clientProfile.companyName || job.clientProfile.user.email.split("@")[0]}
                </p>
              </div>

              {(job.budgetMin || job.budgetMax) && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Budget</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {job.budgetMin && job.budgetMax
                      ? `${formatCurrency(job.budgetMin)} – ${formatCurrency(job.budgetMax)}`
                      : job.budgetMin
                      ? `From ${formatCurrency(job.budgetMin)}`
                      : `Up to ${formatCurrency(job.budgetMax!)}`}
                  </p>
                </div>
              )}

              {job.timeline && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Timeline</p>
                  <p className="text-sm text-gray-900">{job.timeline}</p>
                </div>
              )}

              {job.skills.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.map((skill) => (
                      <Badge key={skill.id} variant="secondary" className="text-xs">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {job._count.applications} proposal{job._count.applications !== 1 ? "s" : ""} submitted
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
