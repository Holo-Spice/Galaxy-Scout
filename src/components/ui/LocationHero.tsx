"use client";

import Image from "next/image";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { LocationStatus } from "@/lib/constants";

interface LocationHeroLocation {
  name: string;
  coverImage: string;
  status: string;
  coordinates?: string;
}

interface LocationHeroProps {
  location: LocationHeroLocation;
  aspectRatio?: "video" | "21/9";
  showCoordinates?: boolean;
  priority?: boolean;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  className?: string;
  /** Custom content for the bottom overlay. Replaces default badge+name+coordinates. */
  children?: React.ReactNode;
}

export function LocationHero({
  location,
  aspectRatio,
  showCoordinates = false,
  priority = false,
  onError,
  className,
  children,
}: LocationHeroProps) {
  const isDetail = aspectRatio === "21/9";

  const aspectClass = isDetail ? "aspect-[21/9]" : "aspect-video";

  const gradientClass = isDetail
    ? "bg-gradient-to-t from-surface-1 via-surface-1/30 to-transparent"
    : "bg-gradient-to-t from-surface-1/90 via-surface-1/20 to-transparent";

  const paddingClass = isDetail
    ? "bottom-6 left-6 right-6"
    : "bottom-3 left-3 right-3";

  return (
    <div
      className={`relative ${aspectClass} bg-surface-2 overflow-hidden ${isDetail ? "rounded-xl" : ""} ${className ?? ""}`}
    >
      <Image
        src={location.coverImage}
        alt={location.name}
        fill
        className={`object-cover${!isDetail ? " transition-transform duration-500 group-hover:scale-105" : ""}`}
        priority={priority}
        onError={onError}
      />
      <div className={`absolute inset-0 ${gradientClass}`} />
      <div className={`absolute ${paddingClass}`}>
        {children ?? (
          <>
            <StatusBadge status={location.status as LocationStatus} />
            {isDetail ? (
              <>
                <h1 className="text-[32px] font-bold text-ink mt-1">
                  {location.name}
                </h1>
                {showCoordinates && location.coordinates && (
                  <p className="text-[14px] text-ink-muted font-mono mt-1">
                    {location.coordinates}
                  </p>
                )}
              </>
            ) : (
              <h3 className="text-[16px] font-semibold text-ink mt-1">
                {location.name}
              </h3>
            )}
          </>
        )}
      </div>
    </div>
  );
}
