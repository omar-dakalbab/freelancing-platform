import Link from "next/link";
import { DollarSign, Clock, Users, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency, truncate } from "@/lib/utils";
import { TimeAgo } from "@/components/ui/time-ago";
import type { Job, ClientProfile, Skill, User } from "@prisma/client";

type JobWithRelations = Job & {
  clientProfile: ClientProfile & {
    user: Pick<User, "id" | "email" | "avatar">;
  };
  skills: Skill[];
  _count: { applications: number };
};

interface JobCardProps {
  job: JobWithRelations;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
    >
      <div className="relative h-full rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 hover:border-gray-300/80">
        {/* Top row: avatar + category + arrow */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={job.clientProfile.user.avatar}
              alt={job.clientProfile.companyName || job.clientProfile.user.email}
              email={job.clientProfile.user.email}
              size="md"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-700 truncate">
                {job.clientProfile.companyName || job.clientProfile.user.email.split("@")[0]}
              </p>
              {job.clientProfile.industry && (
                <p className="text-xs text-gray-400 truncate">{job.clientProfile.industry}</p>
              )}
            </div>
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-all duration-300 group-hover:bg-brand-800 group-hover:text-white">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-brand-800 transition-colors line-clamp-2">
          {job.title}
        </h3>

        {/* Description preview */}
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
          {truncate(job.description, 120)}
        </p>

        {/* Skills */}
        {job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {job.skills.slice(0, 3).map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200/60"
              >
                {skill.name}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="inline-flex items-center rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-400 ring-1 ring-gray-200/60">
                +{job.skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 pt-4">
          {/* Budget highlight */}
          {(job.budgetMin || job.budgetMax) && (
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
                <DollarSign className="h-4 w-4" />
                {job.budgetMin && job.budgetMax
                  ? `${formatCurrency(job.budgetMin)} – ${formatCurrency(job.budgetMax)}`
                  : job.budgetMin
                  ? `From ${formatCurrency(job.budgetMin)}`
                  : `Up to ${formatCurrency(job.budgetMax!)}`}
              </span>
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {job.timeline && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {job.timeline}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {job._count.applications} proposal{job._count.applications !== 1 ? "s" : ""}
            </span>
            <TimeAgo date={job.createdAt} className="ml-auto" />
          </div>
        </div>
      </div>
    </Link>
  );
}
