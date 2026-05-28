"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { type locations } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TagList } from "@/components/ui/TagList";

type Location = (typeof locations)[number];

interface LocationCardProps {
  location: Location;
}

function ScoreBar({ score }: { score: number }) {
  const width = `${score}%`;
  const color =
    score >= 85
      ? "bg-success"
      : score >= 60
        ? "bg-warning"
        : "bg-danger";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-surface-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width }}
        />
      </div>
      <span className="font-mono text-[13px] text-ink tabular-nums">
        {score}
      </span>
    </div>
  );
}

function MetricItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium leading-[1.4] tracking-[0.05px] text-ink-subtle">
        {label}
      </span>
      <span
        className={`text-[13px] font-normal leading-[1.5] text-ink ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function LocationCard({ location }: LocationCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group card-base data-[theme=spacex]:card-spacex data-[theme=vercel]:card-vercel data-[theme=supabase]:card-supabase"
    >
      <div className="relative aspect-video bg-surface-2 overflow-hidden">
        <Image
          src={location.coverImage}
          alt={location.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-all duration-1000 group-hover:scale-105 ${
            imageLoaded ? "blur-0 scale-100" : "blur-md scale-110"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-1/80 to-transparent z-10" />

        <div className="absolute top-3 right-3 z-20">
          <StatusBadge status={location.status} />
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <h3 className="text-[18px] font-semibold leading-[1.3] tracking-[-0.3px] text-ink">
            {location.name}
          </h3>
          <TagList tags={location.tags} />
        </div>

        <div className="flex items-center gap-4 text-[13px] font-mono text-ink-subtle">
          <span>{location.coordinates}</span>
          <span className="text-ink-tertiary">·</span>
          <span>{location.elevation}</span>
        </div>

        <div className="h-px bg-hairline" />

        <div className="grid grid-cols-3 gap-3">
          <MetricItem label="Bortle" value={`B${location.bortle}`} />
          <MetricItem
            label="云量"
            value={`${location.cloudCover}%`}
            mono
          />
          <MetricItem label="距离" value={location.distance} mono />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium leading-[1.4] tracking-[0.05px] text-ink-subtle">
            综合评分
          </span>
          <ScoreBar score={location.score} />
        </div>
      </div>
    </motion.article>
  );
}
