"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Camera, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { clientProfileSchema, type ClientProfileInput } from "@/lib/validations/profile";
import { calculateProfileCompletion } from "@/lib/utils";
import type { ClientProfile, User } from "@prisma/client";
import type { Session } from "next-auth";

type ProfileWithUser = ClientProfile & {
  user: Pick<User, "id" | "email" | "avatar" | "createdAt">;
};

interface ClientProfileFormProps {
  profile: ProfileWithUser | null;
  session: Session;
}

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Education", "Retail",
  "Manufacturing", "Media & Entertainment", "Real Estate",
  "Consulting", "Non-profit", "Other",
];

export function ClientProfileForm({ profile, session }: ClientProfileFormProps) {
  const [avatarUrl, setAvatarUrl] = useState(profile?.user.avatar || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ClientProfileInput>({
    resolver: zodResolver(clientProfileSchema),
    defaultValues: {
      companyName: profile?.companyName || "",
      companyDescription: profile?.companyDescription || "",
      website: profile?.website || "",
      industry: profile?.industry || "",
    },
  });

  const watchedValues = watch();
  const completion = calculateProfileCompletion({
    companyName: watchedValues.companyName,
    companyDescription: watchedValues.companyDescription,
    website: watchedValues.website,
    industry: watchedValues.industry,
  });

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message);

      setAvatarUrl(json.data.url);
      toast.success("Avatar updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function onSubmit(data: ClientProfileInput) {
    try {
      const res = await fetch("/api/profiles/client", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message);

      toast.success("Profile saved successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
        <p className="mt-1 text-gray-500">
          Help freelancers know who they are working with
        </p>
      </div>

      {/* Profile Completion */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Profile Completion</span>
            <span className="text-sm font-semibold text-brand-800">{completion}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${completion}%`,
                backgroundColor: completion >= 75 ? "#16a34a" : completion >= 50 ? "#d97706" : "#6366f1",
              }}
            />
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar */}
        <Card>
          <CardHeader>
            <CardTitle>Company Logo</CardTitle>
            <CardDescription>Upload your company logo or profile photo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar
                  src={avatarUrl}
                  alt={profile?.companyName || session.user?.email || "Company"}
                  email={session.user?.email || ""}
                  size="xl"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand-800 text-white shadow-md hover:bg-brand-800 transition-colors"
                >
                  {uploadingAvatar ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {session.user?.email}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  JPG, PNG, WebP up to 5MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input
              label="Company Name"
              placeholder="Acme Corp"
              required
              error={errors.companyName?.message}
              {...register("companyName")}
            />

            <Textarea
              label="Company Description"
              placeholder="Tell freelancers about your company, what you do, and what makes you a great client..."
              rows={4}
              error={errors.companyDescription?.message}
              {...register("companyDescription")}
            />

            <Input
              label="Website"
              type="url"
              placeholder="https://yourcompany.com"
              error={errors.website?.message}
              {...register("website")}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Industry</label>
              <select
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20"
                {...register("industry")}
              >
                <option value="">Select an industry...</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
              {errors.industry && (
                <p className="text-xs text-red-600">{errors.industry.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
