import Link from "next/link";
import { DollarSign, Clock, Users, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency, formatRelativeTime, truncate } from "@/lib/utils";
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
    <Link href={`/jobs/${job.id}`} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2">
      <Card className="h-full hover:shadow-md hover:border-brand-300 transition-all duration-200 cursor-pointer">
        <CardContent className="p-5">
          {/* Client info */}
          <div className="flex items-center gap-2.5 mb-4">
            <Avatar
              src={job.clientProfile.user.avatar}
              alt={job.clientProfile.companyName || job.clientProfile.user.email}
              email={job.clientProfile.user.email}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 truncate">
                {job.clientProfile.companyName || job.clientProfile.user.email.split("@")[0]}
              </p>
              {job.clientProfile.industry && (
                <p className="text-xs text-gray-400 truncate">{job.clientProfile.industry}</p>
              )}
            </div>
            <Badge variant="secondary" className="shrink-0 text-xs">
              {job.category}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-2 leading-snug hover:text-brand-800 transition-colors">
            {job.title}
          </h3>

          {/* Description preview */}
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
            {truncate(job.description, 120)}
          </p>

          {/* Skills */}
          {job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {job.skills.slice(0, 4).map((skill) => (
                <Badge key={skill.id} variant="secondary" className="text-xs">
                  {skill.name}
                </Badge>
              ))}
              {job.skills.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{job.skills.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            {(job.budgetMin || job.budgetMax) && (
              <span className="flex items-center gap-1 font-medium text-gray-700">
                <DollarSign className="h-3.5 w-3.5 text-green-600" />
                {job.budgetMin && job.budgetMax
                  ? `${formatCurrency(job.budgetMin)} – ${formatCurrency(job.budgetMax)}`
                  : job.budgetMin
                  ? `From ${formatCurrency(job.budgetMin)}`
                  : `Up to ${formatCurrency(job.budgetMax!)}`}
              </span>
            )}
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
            <span className="ml-auto text-gray-400">{formatRelativeTime(job.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
