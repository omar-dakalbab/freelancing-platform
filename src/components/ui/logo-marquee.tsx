"use client";

import { cn } from "@/lib/utils";

const trustedCompanies = [
  { name: "Stripe", bg: "bg-violet-100", text: "text-violet-400" },
  { name: "Vercel", bg: "bg-gray-900", text: "text-gray-500" },
  { name: "Notion", bg: "bg-gray-100", text: "text-gray-500" },
  { name: "Linear", bg: "bg-indigo-100", text: "text-indigo-400" },
  { name: "Figma", bg: "bg-rose-100", text: "text-rose-400" },
  { name: "Shopify", bg: "bg-emerald-100", text: "text-emerald-500" },
  { name: "Webflow", bg: "bg-blue-100", text: "text-blue-400" },
  { name: "Framer", bg: "bg-purple-100", text: "text-purple-400" },
  { name: "Supabase", bg: "bg-emerald-100", text: "text-emerald-400" },
  { name: "Railway", bg: "bg-pink-100", text: "text-pink-400" },
];

export function LogoMarquee({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div className="flex animate-marquee gap-12 items-center">
        {[...trustedCompanies, ...trustedCompanies].map((company, i) => (
          <div
            key={`${company.name}-${i}`}
            className="flex shrink-0 items-center gap-2.5 select-none"
          >
            <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold", company.bg, company.text)}>
              {company.name[0]}
            </div>
            <span className={cn("text-sm font-semibold tracking-wide whitespace-nowrap", company.text)}>
              {company.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
