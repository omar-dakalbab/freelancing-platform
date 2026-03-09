"use client";

import { useState, useEffect } from "react";
import { formatRelativeTime, formatDate } from "@/lib/utils";

interface TimeAgoProps {
  date: Date | string;
  className?: string;
}

export function TimeAgo({ date, className }: TimeAgoProps) {
  const [display, setDisplay] = useState(() => formatDate(date));

  useEffect(() => {
    setDisplay(formatRelativeTime(date));
  }, [date]);

  return (
    <span className={className} suppressHydrationWarning>
      {display}
    </span>
  );
}
