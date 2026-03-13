"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Camera, Save, Plus, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { SkillSelector } from "@/components/ui/skill-selector";
import { freelancerProfileSchema, type FreelancerProfileInput } from "@/lib/validations/profile";
import { calculateProfileCompletion } from "@/lib/utils";
import type { FreelancerProfile, PortfolioItem, Skill, User } from "@prisma/client";
import type { Session } from "next-auth";
import { track, EVENTS } from "@/lib/analytics";

type ProfileWithRelations = FreelancerProfile & {
  user: Pick<User, "id" | "email" | "avatar" | "createdAt">;
  skills: Skill[];
  portfolioItems: PortfolioItem[];
};

interface FreelancerProfileFormProps {
  profile: ProfileWithRelations | null;
  session: Session;
}

interface PortfolioForm {
  title: string;
  description: string;
  url: string;
}

export function FreelancerProfileForm({ profile, session }: FreelancerProfileFormProps) {
  const [avatarUrl, setAvatarUrl] = useState(profile?.user.avatar || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [skills, setSkills] = useState<string[]>(profile?.skills.map((s) => s.name) || []);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(profile?.portfolioItems || []);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState<PortfolioForm>({ title: "", description: "", url: "" });
  const [savingPortfolio, setSavingPortfolio] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FreelancerProfileInput>({
    resolver: zodResolver(freelancerProfileSchema) as any,
    defaultValues: {
      title: profile?.title || "",
      bio: profile?.bio || "",
      hourlyRate: profile?.hourlyRate || undefined,
      skills: profile?.skills.map((s) => s.name) || [],
      whatsappNumber: profile?.whatsappNumber || "",
      phoneNumber: profile?.phoneNumber || "",
    },
  });

  const watchedValues = watch();
  const completion = calculateProfileCompletion({
    title: watchedValues.title,
    bio: watchedValues.bio,
    hourlyRate: watchedValues.hourlyRate,
    skills: skills.length > 0 ? skills : null,
  });

  function handleSkillChange(newSkills: string[]) {
    setSkills(newSkills);
    setValue("skills", newSkills, { shouldDirty: true });
  }

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
      track(EVENTS.AVATAR_UPLOADED);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function onSubmit(data: FreelancerProfileInput) {
    try {
      const res = await fetch("/api/profiles/freelancer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, skills }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message);

      toast.success("Profile saved successfully!");
      track(EVENTS.PROFILE_UPDATED, { profile_type: "freelancer", completion });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    }
  }

  async function addPortfolioItem() {
    if (!portfolioForm.title.trim()) {
      toast.error("Portfolio title is required");
      return;
    }

    setSavingPortfolio(true);
    try {
      const res = await fetch("/api/profiles/freelancer/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(portfolioForm),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message);

      setPortfolioItems([json.data, ...portfolioItems]);
      setPortfolioForm({ title: "", description: "", url: "" });
      setShowPortfolioForm(false);
      toast.success("Portfolio item added!");
      track(EVENTS.PORTFOLIO_ITEM_ADDED);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add portfolio item");
    } finally {
      setSavingPortfolio(false);
    }
  }

  async function deletePortfolioItem(id: string) {
    try {
      const res = await fetch(`/api/profiles/freelancer/portfolio/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setPortfolioItems(portfolioItems.filter((p) => p.id !== id));
      toast.success("Portfolio item removed");
      track(EVENTS.PORTFOLIO_ITEM_DELETED);
    } catch {
      toast.error("Failed to delete portfolio item");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Freelancer Profile</h1>
        <p className="mt-1 text-gray-500">
          Showcase your skills and attract the best clients
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
            <CardTitle>Profile Photo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar
                  src={avatarUrl}
                  alt={profile?.title || session.user?.email || "Freelancer"}
                  email={session.user?.email || ""}
                  size="xl"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand-800 text-white shadow-md hover:bg-brand-800"
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
                <p className="text-sm font-medium text-gray-700">{session.user?.email}</p>
                <p className="text-xs text-gray-500 mt-0.5">JPG, PNG, WebP up to 5MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input
              label="Professional Title"
              placeholder="e.g. Full-Stack Developer, UI/UX Designer"
              required
              error={errors.title?.message}
              {...register("title")}
            />

            <Textarea
              label="Professional Bio"
              placeholder="Describe your expertise, experience, and what you can do for clients..."
              rows={5}
              required
              error={errors.bio?.message}
              hint={`${watchedValues.bio?.length || 0}/2000 characters`}
              {...register("bio")}
            />

            <Input
              label="Hourly Rate (USD)"
              type="number"
              placeholder="50"
              min={1}
              required
              error={errors.hourlyRate?.message}
              hint="Your rate in US dollars per hour"
              {...register("hourlyRate", { valueAsNumber: true })}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 555 000 0000"
              error={errors.phoneNumber?.message}
              {...register("phoneNumber")}
            />

            <Input
              label="WhatsApp Number"
              type="tel"
              placeholder="+1 555 000 0000"
              error={errors.whatsappNumber?.message}
              hint="Include country code (e.g. +1, +44)"
              {...register("whatsappNumber")}
            />

            <div className="relative">
              <SkillSelector
                value={skills}
                onChange={handleSkillChange}
                error={errors.skills?.message}
                label="Skills"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting} disabled={!isDirty && skills === (profile?.skills.map((s) => s.name) || [])}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>

      {/* Portfolio Section (separate from main form) */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Portfolio</CardTitle>
            <CardDescription>Show off your best work</CardDescription>
          </div>
          {!showPortfolioForm && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowPortfolioForm(true)}
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {showPortfolioForm && (
            <div className="mb-5 p-4 rounded-xl border border-brand-300 bg-brand-50 space-y-4">
              <h4 className="text-sm font-medium text-gray-900">New Portfolio Item</h4>
              <Input
                label="Title"
                placeholder="Project title"
                required
                value={portfolioForm.title}
                onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
              />
              <Textarea
                label="Description"
                placeholder="What did you build? What was your role?"
                rows={2}
                value={portfolioForm.description}
                onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
              />
              <Input
                label="URL"
                type="url"
                placeholder="https://..."
                value={portfolioForm.url}
                onChange={(e) => setPortfolioForm({ ...portfolioForm, url: e.target.value })}
              />
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={addPortfolioItem} loading={savingPortfolio}>
                  Add to Portfolio
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowPortfolioForm(false);
                    setPortfolioForm({ title: "", description: "", url: "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {portfolioItems.length === 0 && !showPortfolioForm ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">No portfolio items yet</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {portfolioItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.title}</p>
                      {item.description && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs text-brand-800 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Project
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => deletePortfolioItem(item.id)}
                      className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
