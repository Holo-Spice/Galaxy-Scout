"use client";

import { useTheme } from "./ThemeProvider";
import { locations } from "@/lib/mock-data";
import Image from "next/image";
import Link from "next/link";

function GalaxyDashboard() {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {locations.map((loc) => (
          <Link key={loc.id} href={`/locations/${loc.id}`}>
            <article className="group bg-surface-1 rounded-xl border border-hairline hover:border-hairline-strong transition-all duration-200 overflow-hidden">
              <div className="relative aspect-video bg-surface-2 overflow-hidden">
                <Image
                  src={loc.coverImage}
                  alt={loc.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-1/90 via-surface-1/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        loc.status === "recommended"
                          ? "bg-success-muted text-success"
                          : loc.status === "watch"
                            ? "bg-warning-muted text-warning"
                            : "bg-danger-muted text-danger"
                      }`}
                    >
                      {loc.status === "recommended"
                        ? "推荐"
                        : loc.status === "watch"
                          ? "观望"
                          : "不推荐"}
                    </span>
                  </div>
                  <h3 className="text-[16px] font-semibold text-ink">{loc.name}</h3>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {loc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-surface-2 text-[11px] text-ink-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-ink-subtle block">坐标</span>
                    <span className="text-[12px] font-mono text-ink-muted">{loc.coordinates}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-subtle block">海拔</span>
                    <span className="text-[12px] font-mono text-ink-muted">{loc.elevation}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-subtle block">Bortle</span>
                    <span className={`text-[12px] font-mono ${loc.bortle <= 2 ? "text-success" : loc.bortle <= 4 ? "text-warning" : "text-danger"}`}>
                      B{loc.bortle}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-subtle block">距离</span>
                    <span className="text-[12px] font-mono text-ink-muted">{loc.distance}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-hairline">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-ink-subtle">综合评分</span>
                    <span className="text-[18px] font-bold font-mono text-accent">{loc.score}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        loc.score >= 85 ? "bg-success" : loc.score >= 60 ? "bg-warning" : "bg-danger"
                      }`}
                      style={{ width: `${loc.score}%` }}
                    />
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SpaceXDashboard() {
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
                  <span className="text-[36px] font-bold text-white">{loc.score}</span>
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
            <span className="text-[56px] font-bold text-white">{locations.length}</span>
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

function VercelDashboard() {
  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-12">
        <h1 className="text-[56px] font-bold leading-[1.05] tracking-[-2.4px] text-[#171717]">
          今日候选
        </h1>
        <p className="text-[16px] leading-[1.6] text-[#666] mt-3 max-w-xl">
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
            <div className="relative aspect-[2/1] overflow-hidden rounded-t-lg">
              <Image
                src={loc.coverImage}
                alt={loc.name}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/mountain-stars.jpg";
                }}
              />
              <div className="absolute top-3 right-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${
                    loc.status === "recommended"
                      ? "bg-[#0070f3] text-white"
                      : loc.status === "watch"
                        ? "bg-[#f5a623] text-white"
                        : "bg-[#ee0000] text-white"
                  }`}
                >
                  {loc.status === "recommended"
                    ? "推荐"
                    : loc.status === "watch"
                      ? "观望"
                      : "不推荐"}
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-[18px] font-semibold text-[#171717] tracking-[-0.02em]">
                    {loc.name}
                  </h3>
                  <p className="text-[13px] text-[#888] mt-1 font-mono">{loc.coordinates}</p>
                </div>
                <div className="text-right">
                  <span className="text-[28px] font-bold text-[#171717] tracking-[-0.04em]">
                    {loc.score}
                  </span>
                  <span className="block text-[11px] text-[#888]">分</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {loc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-[#f5f5f5] text-[11px] text-[#666]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-3 pt-4 border-t border-[rgba(0,0,0,0.06)]">
                <div>
                  <span className="text-[10px] text-[#888] block mb-0.5">Bortle</span>
                  <span className="text-[13px] font-medium text-[#171717]">B{loc.bortle}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#888] block mb-0.5">海拔</span>
                  <span className="text-[13px] font-medium text-[#171717]">{loc.elevation}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#888] block mb-0.5">距离</span>
                  <span className="text-[13px] font-medium text-[#171717]">{loc.distance}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#888] block mb-0.5">云量</span>
                  <span className="text-[13px] font-medium text-[#171717]">{loc.cloudCover}%</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SupabaseDashboard() {
  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-medium tracking-wider uppercase">
            Live
          </span>
          <span className="text-[11px] text-[#505050] font-mono tracking-wider">
            LAST UPDATED: 2 MINUTES AGO
          </span>
        </div>
        <h1 className="text-[48px] font-bold leading-[1.0] text-[#ebebeb]">
          今日候选地点
        </h1>
        <p className="text-[15px] text-[#707070] mt-3 max-w-2xl">
          基于实时天气数据、VIIRS 光污染遥感与天文窗口计算，综合评估各候选地点的银河拍摄条件
        </p>
      </header>

      <div className="bg-[#171717] rounded-lg border border-[#2e2e2e] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2e2e2e] bg-[#1c1c1c]">
          <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
          <span className="w-3 h-3 rounded-full bg-[#f5a623]" />
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="ml-4 text-[12px] font-mono text-[#505050] tracking-wider">
            locations.query.ts
          </span>
        </div>

        <div className="p-4 font-mono text-[13px]">
          <div className="text-[#505050] mb-3">// 查询最佳观测地点</div>
          <div className="text-emerald-400 mb-1">const</div>
          <div className="pl-4 mb-4">
            <span className="text-[#ebebeb]">locations</span>
            <span className="text-[#505050]"> = </span>
            <span className="text-emerald-400">await</span>
            <span className="text-[#ebebeb]"> db.</span>
            <span className="text-emerald-400">query</span>
            <span className="text-[#ebebeb]">(</span>
            <span className="text-[#f0a030]">&quot;locations&quot;</span>
            <span className="text-[#ebebeb]">)</span>
          </div>
          <div className="text-[#505050] mb-2">// 返回 {locations.length} 条结果</div>
        </div>
      </div>

      <div className="space-y-4">
        {locations.map((loc, i) => (
          <Link
            key={loc.id}
            href={`/locations/${loc.id}`}
            className="group block bg-[#171717] rounded-lg border border-[#2e2e2e] hover:border-emerald-500/30 transition-all overflow-hidden"
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
                      <span className="text-[11px] font-mono text-[#505050]">[{i}]</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          loc.status === "recommended"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : loc.status === "watch"
                              ? "bg-[#f0a030]/10 text-[#f0a030]"
                              : "bg-[#ef4444]/10 text-[#ef4444]"
                        }`}
                      >
                        {loc.status === "recommended"
                          ? "RECOMMENDED"
                          : loc.status === "watch"
                            ? "WATCH"
                            : "NOT_RECOMMENDED"}
                      </span>
                    </div>
                    <h3 className="text-[16px] font-semibold text-[#ebebeb]">{loc.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[24px] font-bold text-emerald-400">{loc.score}</span>
                    <span className="block text-[10px] text-[#505050] tracking-wider">SCORE</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {loc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-[#222] text-[11px] text-[#707070] font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-5 gap-3 pt-3 border-t border-[#2e2e2e]">
                  <div>
                    <span className="text-[10px] text-[#505050] block mb-0.5 tracking-wider">BORTLE</span>
                    <span className={`text-[13px] font-mono ${loc.bortle <= 2 ? "text-emerald-400" : loc.bortle <= 4 ? "text-[#f0a030]" : "text-[#ef4444]"}`}>
                      {loc.bortle}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#505050] block mb-0.5 tracking-wider">VIIRS</span>
                    <span className="text-[13px] font-mono text-[#ebebeb]">{loc.viirs}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#505050] block mb-0.5 tracking-wider">ELEV</span>
                    <span className="text-[13px] font-mono text-[#ebebeb]">{loc.elevation}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#505050] block mb-0.5 tracking-wider">DIST</span>
                    <span className="text-[13px] font-mono text-[#ebebeb]">{loc.distance}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#505050] block mb-0.5 tracking-wider">CLOUD</span>
                    <span className="text-[13px] font-mono text-[#ebebeb]">{loc.cloudCover}%</span>
                  </div>
                </div>
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

  switch (current) {
    case "spacex":
      return <SpaceXDashboard />;
    case "vercel":
      return <VercelDashboard />;
    case "supabase":
      return <SupabaseDashboard />;
    default:
      return <GalaxyDashboard />;
  }
}
