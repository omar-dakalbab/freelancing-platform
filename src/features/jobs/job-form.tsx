"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { track, EVENTS } from "@/lib/analytics";
import Link from "next/link";
import { ArrowLeft, Briefcase, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SkillSelector } from "@/components/ui/skill-selector";
import { createJobSchema, JOB_CATEGORIES, JOB_TIMELINES, type CreateJobInput } from "@/lib/validations/job";
import type { Job, Skill } from "@prisma/client";

type JobWithSkills = Job & { skills: Skill[] };

interface JobFormProps {
  mode: "create" | "edit";
  job?: JobWithSkills;
}

export function JobForm({ mode, job }: JobFormProps) {
  const router = useRouter();
  const [skills, setSkills] = useState<string[]>(job?.skills.map((s) => s.name) || []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema) as any,
    defaultValues: {
      title: job?.title || "",
      description: job?.description || "",
      category: (job?.category as (typeof JOB_CATEGORIES)[number]) || undefined,
      skills: job?.skills.map((s) => s.name) || [],
      budgetMin: job?.budgetMin ?? undefined,
      budgetMax: job?.budgetMax ?? undefined,
      timeline: (job?.timeline as (typeof JOB_TIMELINES)[number]) || undefined,
      status: (job?.status as "DRAFT" | "OPEN") || "OPEN",
    },
  });

  const description = watch("description") || "";

  function handleSkillChange(newSkills: string[]) {
    setSkills(newSkills);
    setValue("skills", newSkills, { shouldDirty: true });
  }

  async function onSubmit(data: CreateJobInput) {
    try {
      const url = mode === "create" ? "/api/jobs" : `/api/jobs/${job?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, skills }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to save job");

      toast.success(mode === "create" ? "Job posted successfully!" : "Job updated successfully!");
      track(mode === "create" ? (data.status === "DRAFT" ? EVENTS.JOB_SAVED_DRAFT : EVENTS.JOB_PUBLISHED) : EVENTS.JOB_EDITED, {
        job_id: json.data.id,
        category: data.category,
        has_budget: !!(data.budgetMin || data.budgetMax),
        skills_count: skills.length,
      });
      router.push(mode === "create" ? `/jobs/${json.data.id}` : `/dashboard/my-jobs/${json.data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save job");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/dashboard/my-jobs"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Jobs
      </Link>

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
          <Briefcase className="h-5 w-5 text-brand-800" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === "create" ? "Post a New Job" : "Edit Job"}
          </h1>
          <p className="text-sm text-gray-500">
            {mode === "create"
              ? "Describe what you need and find the right talent"
              : "Update your job posting"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Provide clear details to attract qualified freelancers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input
              label="Job Title"
              placeholder="e.g. Build a responsive e-commerce website"
              required
              error={errors.title?.message}
              hint="Be specific and descriptive"
              {...register("title")}
            />

            <Textarea
              label="Job Description"
              placeholder="Describe the project in detail. Include:&#10;• What you need built/done&#10;• Requirements and specifications&#10;• What success looks like&#10;• Any preferred technologies or approaches"
              rows={8}
              required
              error={errors.description?.message}
              hint={`${description.length}/10,000 — Min. 50 characters`}
              {...register("description")}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20"
                {...register("category")}
              >
                <option value="">Select a category...</option>
                {JOB_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div className="relative">
              <SkillSelector
                value={skills}
                onChange={handleSkillChange}
                error={errors.skills?.message}
                label="Required Skills"
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget & Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Budget & Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Minimum Budget ($)"
                type="number"
                placeholder="500"
                min={1}
                error={errors.budgetMin?.message}
                {...register("budgetMin", { valueAsNumber: true })}
              />
              <Input
                label="Maximum Budget ($)"
                type="number"
                placeholder="2000"
                min={1}
                error={errors.budgetMax?.message}
                {...register("budgetMax", { valueAsNumber: true })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Timeline</label>
              <select
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20"
                {...register("timeline")}
              >
                <option value="">Select timeline...</option>
                {JOB_TIMELINES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Publishing */}
        <Card>
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="OPEN"
                  className="text-brand-800"
                  {...register("status")}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Publish Now</p>
                  <p className="text-xs text-gray-500">Job will be visible to freelancers immediately</p>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="DRAFT"
                  className="text-brand-800"
                  {...register("status")}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Save as Draft</p>
                  <p className="text-xs text-gray-500">Finish later before publishing</p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Link href="/dashboard/my-jobs">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" loading={isSubmitting} size="lg">
            <Save className="h-4 w-4" />
            {mode === "create" ? "Post Job" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
