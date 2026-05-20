"use client";

import clsx from "clsx";
import { STATUS_CONFIG, type LocationStatus } from "@/lib/constants";

interface StatusBadgeProps {
  status: LocationStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg =
    STATUS_CONFIG[status as LocationStatus] ?? STATUS_CONFIG.unknown;
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide",
        cfg.bg,
        cfg.color
      )}
    >
      {cfg.label}
    </span>
  );
}
