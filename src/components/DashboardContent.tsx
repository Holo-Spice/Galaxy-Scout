"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "./ThemeProvider";
import { getLocations, type Location } from "@/lib/api-client";
import Image from "next/image";
import Link from "next/link";
import { LocationHero } from "@/components/ui/LocationHero";
import { StatCardGrid } from "@/components/ui/StatCardGrid";
import { TagList } from "@/components/ui/TagList";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { staggerContainer, staggerItem, useReducedMotion } from "@/lib/animation";
import { TiltCard } from "@/components/ui/TiltCard";

function GalaxyDashboard({ locations }: { locations: Location[] }) {
  const reducedMotion = useReducedMotion();
  const containerVariants = reducedMotion ? {} : staggerContainer;
  const itemVariants = reducedMotion ? {} : staggerItem;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-[36px] font-bold leading-[1.15] tracking-[-1.5px] text-ink">
          今日候选
        </h1>
        <p className="text-[15px] font-normal leading-[1.55] text-ink-muted">
          基于天气、光害与月相的综合评估
        </p>
      </header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {locations.map((loc) => (
          <motion.div key={loc.id} variants={itemVariants}>
            <Link href={`/locations/${loc.id}`}>
              <TiltCard className="group bg-surface-1 rounded-xl border border-hairline hover:border-hairline-strong transition-all duration-200 overflow-hidden">
              <LocationHero
                location={loc}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />

              <div className="p-4 space-y-3">
                <TagList tags={loc.tags} />

                <StatCardGrid
                  compact
                  columns={2}
                  stats={[
                    { label: "坐标", value: loc.coordinates },
                    { label: "海拔", value: loc.elevation },
                    {
                      label: "Bortle",
                      value: `B${loc.bortle}`,
                      colorClass:
                        loc.bortle <= 2
                          ? "text-success"
                          : loc.bortle <= 4
                            ? "text-warning"
                            : "text-danger",
                    },
                    { label: "距离", value: loc.distance },
                  ]}
                />

                <div className="pt-2 border-t border-hairline">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-ink-subtle">
                      综合评分
                    </span>
                    <AnimatedNumber
                      value={loc.score}
                      className="text-[18px] font-bold font-mono text-accent"
                    />
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        loc.score >= 85
                          ? "bg-success"
                          : loc.score >= 60
                            ? "bg-warning"
                            : "bg-danger"
                      }`}
                      style={{ width: `${loc.score}%` }}
                    />
                  </div>
                </div>
              </div>
            </TiltCard>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function SpaceXDashboard({ locations }: { locations: Location[] }) {
  return (
    <div className="space-y-0">
      <section className="relative h-[85vh] -mx-6 -mt-6 flex items-center">
        <Image
          src="/images/landscape-milkyway-1.jpg"
          alt="Milky Way"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10 px-16 max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-[1px] bg-white/30" />
            <p className="text-[11px] font-medium tracking-[2px] uppercase text-white/50">
              2024 年 12 月 · 新月窗口
            </p>
          </div>
          <h1 className="text-[64px] font-bold leading-[1.0] tracking-[1.5px] uppercase text-white mb-8">
            今日<br />候选地点
          </h1>
          <p className="text-[15px] leading-[1.7] text-white/50 mb-12 max-w-md">
            基于实时天气数据、光污染遥感与天文窗口计算，为您筛选最佳银河拍摄地点
          </p>
          <div className="flex gap-4">
            <button className="px-10 py-4 bg-white text-black text-[12px] font-bold tracking-[1.5px] uppercase hover:bg-white/90 transition-colors">
              开始规划
            </button>
            <button className="px-10 py-4 border border-white/20 text-[12px] font-bold tracking-[1.5px] uppercase text-white hover:bg-white/10 transition-colors">
              了解更多
            </button>
          </div>
        </div>
      </section>

      <section className="py-24 px-16">
        <div className="flex items-center gap-4 mb-16">
          <div className="w-8 h-[1px] bg-white/20" />
          <h2 className="text-[11px] font-medium tracking-[2px] uppercase text-white/40">
            推荐观测地点
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          {locations.slice(0, 4).map((loc, i) => (
            <Link key={loc.id} href={`/locations/${loc.id}`} className="group">
              <div className="relative aspect-[16/10] mb-8 overflow-hidden">
                <Image
                  src={loc.coverImage}
                  alt={loc.name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/landscape-milkyway-2.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] font-medium tracking-[2px] uppercase text-white/50">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-[28px] font-bold tracking-[0.5px] uppercase text-white mb-2">
                    {loc.name}
                  </h3>
                  <p className="text-[12px] text-white/40 tracking-[1px] uppercase">
                    {loc.coordinates} · {loc.elevation}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[36px] font-bold text-white">
                    {loc.score}
                  </span>
                  <span className="block text-[10px] tracking-[2px] uppercase text-white/30 mt-1">
                    综合评分
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative h-[60vh] -mx-6 flex items-center justify-center">
        <Image
          src="/images/landscape-milkyway-4.jpg"
          alt="Milky Way"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex gap-32">
          <div className="text-center">
            <span className="text-[56px] font-bold text-white">
              {locations.length}
            </span>
            <span className="block text-[10px] tracking-[2px] uppercase text-white/40 mt-3">
              候选地点
            </span>
          </div>
          <div className="w-[1px] h-20 bg-white/10" />
          <div className="text-center">
            <span className="text-[56px] font-bold text-white">24h</span>
            <span className="block text-[10px] tracking-[2px] uppercase text-white/40 mt-3">
              逐时预报
            </span>
          </div>
          <div className="w-[1px] h-20 bg-white/10" />
          <div className="text-center">
            <span className="text-[56px] font-bold text-white">3</span>
            <span className="block text-[10px] tracking-[2px] uppercase text-white/40 mt-3">
              数据源
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

function VercelDashboard({ locations }: { locations: Location[] }) {
  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-12">
        <h1 className="text-[56px] font-bold leading-[1.05] tracking-[-2.4px] text-ink">
          今日候选
        </h1>
        <p className="text-[16px] leading-[1.6] text-ink-muted mt-3 max-w-xl">
          基于天气、光害与月相的综合评估，为您推荐最佳银河拍摄地点
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {locations.map((loc) => (
          <Link
            key={loc.id}
            href={`/locations/${loc.id}`}
            className="group block bg-white rounded-lg border border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.15)] transition-all hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_8px_30px_rgba(0,0,0,0.04)]"
          >
            <LocationHero
              location={loc}
              aspectRatio="video"
              className="rounded-t-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/mountain-stars.jpg";
              }}
            />

            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[13px] text-ink-subtle font-mono">
                    {loc.coordinates}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[28px] font-bold text-ink tracking-[-0.04em]">
                    {loc.score}
                  </span>
                  <span className="block text-[11px] text-ink-subtle">分</span>
                </div>
              </div>

              <TagList tags={loc.tags} />

              <StatCardGrid
                compact
                columns={4}
                stats={[
                  { label: "Bortle", value: `B${loc.bortle}` },
                  { label: "海拔", value: loc.elevation },
                  { label: "距离", value: loc.distance },
                  { label: "云量", value: `${loc.cloudCover}%` },
                ]}
                className="pt-4 border-t border-[rgba(0,0,0,0.06)]"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SupabaseDashboard({ locations }: { locations: Location[] }) {
  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-medium tracking-wider uppercase">
            Live
          </span>
          <span className="text-[11px] text-ink-subtle font-mono tracking-wider">
            LAST UPDATED: 2 MINUTES AGO
          </span>
        </div>
        <h1 className="text-[48px] font-bold leading-[1.0] text-ink">
          今日候选地点
        </h1>
        <p className="text-[15px] text-ink-muted mt-3 max-w-2xl">
          基于实时天气数据、VIIRS 光污染遥感与天文窗口计算，综合评估各候选地点的银河拍摄条件
        </p>
      </header>

      <div className="bg-surface-1 rounded-lg border border-hairline overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-hairline bg-surface-2">
          <span className="w-3 h-3 rounded-full bg-danger" />
          <span className="w-3 h-3 rounded-full bg-warning" />
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="ml-4 text-[12px] font-mono text-ink-subtle tracking-wider">
            locations.query.ts
          </span>
        </div>

        <div className="p-4 font-mono text-[13px]">
          <div className="text-ink-subtle mb-3">// 查询最佳观测地点</div>
          <div className="text-emerald-400 mb-1">const</div>
          <div className="pl-4 mb-4">
            <span className="text-ink">locations</span>
            <span className="text-ink-subtle"> = </span>
            <span className="text-emerald-400">await</span>
            <span className="text-ink"> db.</span>
            <span className="text-emerald-400">query</span>
            <span className="text-ink">(</span>
            <span className="text-warning">&quot;locations&quot;</span>
            <span className="text-ink">)</span>
          </div>
          <div className="text-ink-subtle mb-2">
            // 返回 {locations.length} 条结果
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {locations.map((loc, i) => (
          <Link
            key={loc.id}
            href={`/locations/${loc.id}`}
            className="group block bg-surface-1 rounded-lg border border-hairline hover:border-emerald-500/30 transition-all overflow-hidden"
          >
            <div className="flex">
              <div className="relative w-48 shrink-0">
                <Image
                  src={loc.coverImage}
                  alt={loc.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/desert-night.jpg";
                  }}
                />
              </div>

              <div className="flex-1 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono text-ink-subtle">
                        [{i}]
                      </span>
                      <StatusBadge status={loc.status} />
                    </div>
                    <h3 className="text-[16px] font-semibold text-ink">
                      {loc.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[24px] font-bold text-emerald-400">
                      {loc.score}
                    </span>
                    <span className="block text-[10px] text-ink-subtle tracking-wider">
                      SCORE
                    </span>
                  </div>
                </div>

                <TagList tags={loc.tags} className="mb-3" />

                <StatCardGrid
                  compact
                  columns={5}
                  stats={[
                    {
                      label: "BORTLE",
                      value: loc.bortle,
                      colorClass:
                        loc.bortle <= 2
                          ? "text-emerald-400"
                          : loc.bortle <= 4
                            ? "text-warning"
                            : "text-danger",
                    },
                    { label: "VIIRS", value: loc.viirs },
                    { label: "ELEV", value: loc.elevation },
                    { label: "DIST", value: loc.distance },
                    { label: "CLOUD", value: `${loc.cloudCover}%` },
                  ]}
                  className="pt-3 border-t border-hairline"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function DashboardContent() {
  const { current } = useTheme();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLocations()
      .then(setLocations)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-[14px] text-ink-muted">加载地点数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-[14px] text-danger">加载失败: {error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              getLocations()
                .then(setLocations)
                .catch((e) => setError(e.message))
                .finally(() => setLoading(false));
            }}
            className="px-4 py-2 bg-accent text-white rounded-lg text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  switch (current) {
    case "spacex":
      return <SpaceXDashboard locations={locations as any} />;
    case "vercel":
      return <VercelDashboard locations={locations as any} />;
    case "supabase":
      return <SupabaseDashboard locations={locations as any} />;
    default:
      return <GalaxyDashboard locations={locations as any} />;
  }
}
