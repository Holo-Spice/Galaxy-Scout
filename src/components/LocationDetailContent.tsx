"use client";

import { useTheme } from "@/components/ThemeProvider";
import { locations } from "@/lib/mock-data";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

function GalaxyLocationDetail({ id }: { id: string }) {
  const location = locations.find((l) => l.id === id);
  if (!location) return notFound();

  return (
    <div className="space-y-6">
      <div className="relative aspect-[21/9] rounded-xl overflow-hidden">
        <Image
          src={location.coverImage}
          alt={location.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-surface-1/30 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                location.status === "recommended"
                  ? "bg-success-muted text-success"
                  : location.status === "watch"
                    ? "bg-warning-muted text-warning"
                    : "bg-danger-muted text-danger"
              }`}
            >
              {location.status === "recommended"
                ? "推荐"
                : location.status === "watch"
                  ? "观望"
                  : "不推荐"}
            </span>
          </div>
          <h1 className="text-[32px] font-bold text-ink">{location.name}</h1>
          <p className="text-[14px] text-ink-muted font-mono mt-1">{location.coordinates}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-surface-1 rounded-xl border border-hairline p-4">
          <span className="text-[11px] text-ink-subtle block mb-1">Bortle</span>
          <span className={`text-[24px] font-bold font-mono ${location.bortle <= 2 ? "text-success" : location.bortle <= 4 ? "text-warning" : "text-danger"}`}>
            B{location.bortle}
          </span>
        </div>
        <div className="bg-surface-1 rounded-xl border border-hairline p-4">
          <span className="text-[11px] text-ink-subtle block mb-1">VIIRS</span>
          <span className="text-[24px] font-bold font-mono text-ink">{location.viirs}</span>
        </div>
        <div className="bg-surface-1 rounded-xl border border-hairline p-4">
          <span className="text-[11px] text-ink-subtle block mb-1">海拔</span>
          <span className="text-[24px] font-bold font-mono text-ink">{location.elevation}</span>
        </div>
        <div className="bg-surface-1 rounded-xl border border-hairline p-4">
          <span className="text-[11px] text-ink-subtle block mb-1">距离</span>
          <span className="text-[24px] font-bold font-mono text-ink">{location.distance}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-surface-1 rounded-xl border border-hairline p-5">
          <h3 className="text-[14px] font-semibold text-ink mb-3">拍摄条件</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[13px] text-ink-muted">最佳时段</span>
              <span className="text-[13px] font-mono text-ink">{location.bestHour}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-ink-muted">云量</span>
              <span className="text-[13px] font-mono text-ink">{location.cloudCover}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-ink-muted">降水概率</span>
              <span className="text-[13px] font-mono text-ink">{location.precipitation}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-ink-muted">月相</span>
              <span className="text-[13px] font-mono text-ink">{location.moonPhase}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-1 rounded-xl border border-hairline p-5">
          <h3 className="text-[14px] font-semibold text-ink mb-3">标签</h3>
          <div className="flex flex-wrap gap-2">
            {location.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-surface-2 text-[12px] text-ink-muted">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SpaceXLocationDetail({ id }: { id: string }) {
  const location = locations.find((l) => l.id === id);
  if (!location) return notFound();

  return (
    <div className="space-y-0 -m-6">
      <section className="relative h-[90vh] flex items-center">
        <Image
          src={location.coverImage}
          alt={location.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10 px-16 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-[1px] bg-white/30" />
            <p className="text-[11px] font-medium tracking-[2px] uppercase text-white/50">
              {location.coordinates} · {location.elevation}
            </p>
          </div>
          <h1 className="text-[72px] font-bold leading-[1.0] tracking-[1.5px] uppercase text-white mb-8">
            {location.name}
          </h1>
          <div className="flex gap-4">
            <button className="px-10 py-4 bg-white text-black text-[12px] font-bold tracking-[1.5px] uppercase hover:bg-white/90 transition-colors">
              收藏地点
            </button>
            <button className="px-10 py-4 border border-white/20 text-[12px] font-bold tracking-[1.5px] uppercase text-white hover:bg-white/10 transition-colors">
              加入对比
            </button>
          </div>
        </div>
      </section>

      <section className="py-24 px-16">
        <div className="flex items-center gap-4 mb-16">
          <div className="w-8 h-[1px] bg-white/20" />
          <h2 className="text-[11px] font-medium tracking-[2px] uppercase text-white/40">
            核心数据
          </h2>
        </div>
        <div className="grid grid-cols-4 gap-16">
          <div>
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-white/30 mb-3">Bortle 等级</p>
            <span className={`text-[56px] font-bold ${location.bortle <= 2 ? "text-white" : location.bortle <= 4 ? "text-[#f0a030]" : "text-[#ef4444]"}`}>
              B{location.bortle}
            </span>
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-white/30 mb-3">VIIRS 辐亮度</p>
            <span className="text-[56px] font-bold text-white">{location.viirs}</span>
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-white/30 mb-3">海拔高度</p>
            <span className="text-[56px] font-bold text-white">{location.elevation}</span>
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-white/30 mb-3">直线距离</p>
            <span className="text-[56px] font-bold text-white">{location.distance}</span>
          </div>
        </div>
      </section>

      <section className="relative h-[60vh] flex items-center justify-center">
        <Image
          src={location.coverImage}
          alt={location.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center">
          <p className="text-[10px] font-medium tracking-[2px] uppercase text-white/40 mb-4">综合评分</p>
          <span className="text-[96px] font-bold text-white">{location.score}</span>
        </div>
      </section>

      <section className="py-24 px-16">
        <div className="flex items-center gap-4 mb-16">
          <div className="w-8 h-[1px] bg-white/20" />
          <h2 className="text-[11px] font-medium tracking-[2px] uppercase text-white/40">
            拍摄条件
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-20">
          <div className="space-y-10">
            <div>
              <p className="text-[10px] font-medium tracking-[2px] uppercase text-white/30 mb-3">最佳时段</p>
              <span className="text-[32px] font-bold text-white">{location.bestHour}</span>
            </div>
            <div>
              <p className="text-[10px] font-medium tracking-[2px] uppercase text-white/30 mb-3">月相</p>
              <span className="text-[32px] font-bold text-white">{location.moonPhase}</span>
            </div>
          </div>
          <div className="space-y-10">
            <div>
              <p className="text-[10px] font-medium tracking-[2px] uppercase text-white/30 mb-3">云量</p>
              <span className="text-[32px] font-bold text-white">{location.cloudCover}%</span>
            </div>
            <div>
              <p className="text-[10px] font-medium tracking-[2px] uppercase text-white/30 mb-3">降水概率</p>
              <span className="text-[32px] font-bold text-white">{location.precipitation}%</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function VercelLocationDetail({ id }: { id: string }) {
  const location = locations.find((l) => l.id === id);
  if (!location) return notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/" className="text-[13px] text-[#888] hover:text-[#171717] transition-colors mb-6 inline-block">
        ← 返回列表
      </Link>

      <div className="relative aspect-[2/1] rounded-lg overflow-hidden mb-8 border border-[rgba(0,0,0,0.08)]">
        <Image
          src={location.coverImage}
          alt={location.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-[12px] font-medium ${
              location.status === "recommended"
                ? "bg-[#0070f3] text-white"
                : location.status === "watch"
                  ? "bg-[#f5a623] text-white"
                  : "bg-[#ee0000] text-white"
            }`}
          >
            {location.status === "recommended"
              ? "推荐"
              : location.status === "watch"
                ? "观望"
                : "不推荐"}
          </span>
        </div>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[40px] font-bold leading-[1.1] tracking-[-1.5px] text-[#171717]">
            {location.name}
          </h1>
          <p className="text-[14px] text-[#888] font-mono mt-2">{location.coordinates}</p>
        </div>
        <div className="text-right">
          <span className="text-[48px] font-bold text-[#171717] tracking-[-0.04em]">{location.score}</span>
          <span className="block text-[12px] text-[#888]">综合评分</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Bortle", value: `B${location.bortle}`, color: location.bortle <= 2 ? "#0070f3" : location.bortle <= 4 ? "#f5a623" : "#ee0000" },
          { label: "VIIRS", value: location.viirs.toString() },
          { label: "海拔", value: location.elevation },
          { label: "距离", value: location.distance },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] p-4">
            <span className="text-[11px] text-[#888] block mb-1">{item.label}</span>
            <span className="text-[20px] font-semibold text-[#171717]" style={{ color: item.color }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] p-5">
          <h3 className="text-[14px] font-semibold text-[#171717] mb-4">拍摄条件</h3>
          <div className="space-y-3">
            {[
              { label: "最佳时段", value: location.bestHour },
              { label: "云量", value: `${location.cloudCover}%` },
              { label: "降水概率", value: `${location.precipitation}%` },
              { label: "月相", value: location.moonPhase },
            ].map((item) => (
              <div key={item.label} className="flex justify-between py-2 border-b border-[rgba(0,0,0,0.06)] last:border-0">
                <span className="text-[13px] text-[#888]">{item.label}</span>
                <span className="text-[13px] font-medium text-[#171717]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] p-5">
          <h3 className="text-[14px] font-semibold text-[#171717] mb-4">标签</h3>
          <div className="flex flex-wrap gap-2">
            {location.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-[#f5f5f5] text-[12px] text-[#666]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SupabaseLocationDetail({ id }: { id: string }) {
  const location = locations.find((l) => l.id === id);
  if (!location) return notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/" className="text-[12px] font-mono text-[#505050] hover:text-emerald-400 transition-colors">
          ← locations
        </Link>
        <span className="text-[#505050]">/</span>
        <span className="text-[12px] font-mono text-emerald-400">{location.id}</span>
      </div>

      <div className="relative aspect-[21/9] rounded-lg overflow-hidden border border-[#2e2e2e]">
        <Image
          src={location.coverImage}
          alt={location.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-medium tracking-wider ${
                location.status === "recommended"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : location.status === "watch"
                    ? "bg-[#f0a030]/10 text-[#f0a030]"
                    : "bg-[#ef4444]/10 text-[#ef4444]"
              }`}
            >
              {location.status === "recommended"
                ? "RECOMMENDED"
                : location.status === "watch"
                  ? "WATCH"
                  : "NOT_RECOMMENDED"}
            </span>
            <h1 className="text-[28px] font-bold text-[#ebebeb] mt-2">{location.name}</h1>
          </div>
          <span className="text-[36px] font-bold text-emerald-400">{location.score}</span>
        </div>
      </div>

      <div className="bg-[#171717] rounded-lg border border-[#2e2e2e] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2e2e2e] bg-[#1c1c1c]">
          <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
          <span className="w-3 h-3 rounded-full bg-[#f5a623]" />
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="ml-4 text-[12px] font-mono text-[#505050] tracking-wider">
            location.query.ts
          </span>
        </div>
        <div className="p-4 font-mono text-[13px]">
          <div className="text-[#505050] mb-2">// 查询地点详情</div>
          <div className="text-emerald-400 mb-1">const</div>
          <div className="pl-4 mb-2">
            <span className="text-[#ebebeb]">location</span>
            <span className="text-[#505050]"> = </span>
            <span className="text-emerald-400">await</span>
            <span className="text-[#ebebeb]"> db.</span>
            <span className="text-emerald-400">find</span>
            <span className="text-[#ebebeb]">(</span>
            <span className="text-[#f0a030]">&quot;{location.id}&quot;</span>
            <span className="text-[#ebebeb]">)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "BORTLE", value: location.bortle.toString(), color: location.bortle <= 2 ? "text-emerald-400" : location.bortle <= 4 ? "text-[#f0a030]" : "text-[#ef4444]" },
          { label: "VIIRS", value: location.viirs.toString() },
          { label: "ELEVATION", value: location.elevation },
          { label: "DISTANCE", value: location.distance },
        ].map((item) => (
          <div key={item.label} className="bg-[#171717] rounded-lg border border-[#2e2e2e] p-4">
            <span className="text-[10px] text-[#505050] block mb-1 tracking-wider">{item.label}</span>
            <span className={`text-[20px] font-bold font-mono ${item.color || "text-[#ebebeb]"}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#171717] rounded-lg border border-[#2e2e2e] p-4">
          <h3 className="text-[12px] font-mono text-[#505050] tracking-wider mb-3">CONDITIONS</h3>
          <div className="space-y-2">
            {[
              { label: "BEST_HOUR", value: location.bestHour },
              { label: "CLOUD_COVER", value: `${location.cloudCover}%` },
              { label: "PRECIPITATION", value: `${location.precipitation}%` },
              { label: "MOON_PHASE", value: location.moonPhase },
            ].map((item) => (
              <div key={item.label} className="flex justify-between">
                <span className="text-[11px] font-mono text-[#505050]">{item.label}</span>
                <span className="text-[12px] font-mono text-[#ebebeb]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#171717] rounded-lg border border-[#2e2e2e] p-4">
          <h3 className="text-[12px] font-mono text-[#505050] tracking-wider mb-3">TAGS</h3>
          <div className="flex flex-wrap gap-2">
            {location.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded bg-[#222] text-[11px] text-[#707070] font-mono">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LocationDetailContent({ id }: { id: string }) {
  const { current } = useTheme();

  switch (current) {
    case "spacex":
      return <SpaceXLocationDetail id={id} />;
    case "vercel":
      return <VercelLocationDetail id={id} />;
    case "supabase":
      return <SupabaseLocationDetail id={id} />;
    default:
      return <GalaxyLocationDetail id={id} />;
  }
}
