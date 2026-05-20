import { type locations } from "@/lib/mock-data";
import { STATUS_CONFIG, type LocationStatus } from "@/lib/constants";

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
  const status = STATUS_CONFIG[location.status as LocationStatus];

  return (
    <article className="group bg-surface-1 rounded-xl border border-hairline hover:border-hairline-strong transition-colors duration-150 overflow-hidden data-[theme=spacex]:border-0 data-[theme=spacex]:bg-transparent data-[theme=spacex]:hover:bg-white/[0.02] data-[theme=vercel]:shadow-[0_0_0_1px_var(--color-hairline)] data-[theme=vercel]:border-0 data-[theme=vercel]:hover:shadow-[0_0_0_1px_var(--color-hairline-strong)] data-[theme=supabase]:border-emerald-500/20 data-[theme=supabase]:hover:border-emerald-500/40">
      <div className="relative aspect-video bg-surface-2 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-surface-1/80 to-transparent z-10" />
        <div className="absolute inset-0 flex items-center justify-center text-ink-tertiary">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="opacity-20"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </div>

        {status && (
          <div
            className={`absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full ${status.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            <span
              className={`text-[11px] font-medium leading-[1.4] tracking-[0.05px] ${status.color}`}
            >
              {status.label}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <h3 className="text-[18px] font-semibold leading-[1.3] tracking-[-0.3px] text-ink">
            {location.name}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {location.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex px-2.5 py-1 rounded-md bg-surface-2 text-[11px] font-medium leading-[1.4] tracking-[0.05px] text-ink-muted"
              >
                {tag}
              </span>
            ))}
          </div>
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
    </article>
  );
}
