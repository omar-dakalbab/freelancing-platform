import { Shield, Award, TrendingUp, Sparkles, type LucideIcon } from "lucide-react";

export type BadgeTier = "platinum" | "gold" | "silver" | "bronze" | null;

export interface FreelancerBadge {
  tier: BadgeTier;
  label: string;
  description: string;
  icon: LucideIcon;
  color: {
    bg: string;
    text: string;
    border: string;
    iconBg: string;
    gradient: string;
  };
  criteria: string[];
}

export interface BadgeInput {
  completedContracts: number;
  totalEarnings: number;
  avgRating: number;
  reviewCount: number;
  profileComplete: boolean;
  skillsCount: number;
}

const BADGE_DEFINITIONS: Record<NonNullable<BadgeTier>, Omit<FreelancerBadge, "tier">> = {
  platinum: {
    label: "Platinum Pro",
    description: "Elite talent with exceptional track record and top-tier results.",
    icon: Shield,
    color: {
      bg: "bg-violet-50",
      text: "text-violet-700",
      border: "border-violet-200",
      iconBg: "bg-violet-100",
      gradient: "from-violet-600 to-purple-600",
    },
    criteria: [
      "15+ completed contracts",
      "$10,000+ total earnings",
      "4.8+ average rating",
      "10+ client reviews",
    ],
  },
  gold: {
    label: "Gold Expert",
    description: "Proven professional with stellar feedback on major projects.",
    icon: Award,
    color: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      iconBg: "bg-amber-100",
      gradient: "from-amber-500 to-orange-500",
    },
    criteria: [
      "8+ completed contracts",
      "$5,000+ total earnings",
      "4.5+ average rating",
      "5+ client reviews",
    ],
  },
  silver: {
    label: "Silver Achiever",
    description: "Reliable freelancer with consistent quality and strong client satisfaction.",
    icon: TrendingUp,
    color: {
      bg: "bg-sky-50",
      text: "text-sky-700",
      border: "border-sky-200",
      iconBg: "bg-sky-100",
      gradient: "from-sky-500 to-blue-500",
    },
    criteria: [
      "3+ completed contracts",
      "$1,000+ total earnings",
      "4.0+ average rating",
      "2+ client reviews",
    ],
  },
  bronze: {
    label: "Rising Star",
    description: "Promising newcomer showing early success and strong potential.",
    icon: Sparkles,
    color: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      iconBg: "bg-emerald-100",
      gradient: "from-emerald-500 to-teal-500",
    },
    criteria: [
      "1+ completed contract",
      "Complete profile",
      "3+ skills listed",
    ],
  },
};

export function computeBadgeTier(input: BadgeInput): BadgeTier {
  const { completedContracts, totalEarnings, avgRating, reviewCount, profileComplete, skillsCount } = input;

  // Platinum Pro
  if (
    completedContracts >= 15 &&
    totalEarnings >= 10000 &&
    avgRating >= 4.8 &&
    reviewCount >= 10
  ) {
    return "platinum";
  }

  // Gold Expert
  if (
    completedContracts >= 8 &&
    totalEarnings >= 5000 &&
    avgRating >= 4.5 &&
    reviewCount >= 5
  ) {
    return "gold";
  }

  // Silver Achiever
  if (
    completedContracts >= 3 &&
    totalEarnings >= 1000 &&
    avgRating >= 4.0 &&
    reviewCount >= 2
  ) {
    return "silver";
  }

  // Rising Star
  if (
    completedContracts >= 1 &&
    profileComplete &&
    skillsCount >= 3
  ) {
    return "bronze";
  }

  return null;
}

export function getBadgeInfo(tier: NonNullable<BadgeTier>): FreelancerBadge {
  return {
    tier,
    ...BADGE_DEFINITIONS[tier],
  };
}

export function getFreelancerBadge(input: BadgeInput): FreelancerBadge | null {
  const tier = computeBadgeTier(input);
  if (!tier) return null;
  return getBadgeInfo(tier);
}

export { BADGE_DEFINITIONS };
