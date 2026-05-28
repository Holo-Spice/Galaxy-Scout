"use client";

import { useTheme } from "@/components/ThemeProvider";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LocationHero } from "@/components/ui/LocationHero";
import { StatCardGrid } from "@/components/ui/StatCardGrid";
import { TagList } from "@/components/ui/TagList";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  getLocation,
  updateLocation,
  getImages,
  type Location as ApiLocation,
} from "@/lib/api-client";
import { useState, useEffect, useCallback } from "react";

interface DisplayLocation {
  id: string;
  name: string;
  tags: string[];
  coverImage: string;
  coordinates: string;
  elevation: string;
  bortle: number;
  viirs: string | number;
  status: string;
  bestHour: string;
  score: number;
  distance: string;
  cloudCover: number;
  precipitation: number;
  moonPhase: string;
  latitude: number;
  longitude: number;
  is_favorite: boolean;
  personal_rating: number | null;
}

function mapToDisplay(apiLoc: ApiLocation, coverImageUrl?: string): DisplayLocation {
  const formatCoord = (val: number, pos: string, neg: string) =>
    `${Math.abs(val).toFixed(1)}° ${val >= 0 ? pos : neg}`;
  return {
    id: apiLoc.id,
    name: apiLoc.name,
    tags: [],
    coverImage: coverImageUrl || "/images/landscape-milkyway-1.jpg",
    coordinates:
      apiLoc.latitude != null && apiLoc.longitude != null
        ? `${formatCoord(apiLoc.latitude, "N", "S")}, ${formatCoord(apiLoc.longitude, "E", "W")}`
        : "--",
    elevation: apiLoc.elevation_m != null ? `${apiLoc.elevation_m.toLocaleString()}m` : "--",
    bortle: 0,
    viirs: "--",
    status: apiLoc.is_favorite ? "recommended" : "pending",
    bestHour: "--",
    score: 0,
    distance: "--",
    cloudCover: 0,
    precipitation: 0,
    moonPhase: "--",
    latitude: apiLoc.latitude,
    longitude: apiLoc.longitude,
    is_favorite: apiLoc.is_favorite,
    personal_rating: apiLoc.personal_rating,
  };
}

function useLocationDetail(id: string) {
  const [location, setLocation] = useState<DisplayLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [apiLoc, images] = await Promise.all([
        getLocation(id),
        getImages(id).catch(() => []),
      ]);
      const coverImage = images.find((img) => img.is_cover && img.url)?.url;
      setLocation(mapToDisplay(apiLoc, coverImage));
    } catch (e: any) {
      setError(e?.message || "加载失败");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const refetch = useCallback(() => fetchLocation(), [fetchLocation]);

  const toggleFavorite = useCallback(async () => {
    if (!location) return;
    const updated = await updateLocation(location.id, { is_favorite: !location.is_favorite });
    setLocation((prev) => (prev ? { ...prev, is_favorite: updated.is_favorite } : prev));
  }, [location]);

  return { location, loading, error, refetch, toggleFavorite };
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="aspect-video bg-surface-2 rounded-xl" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-surface-2 rounded-lg" />
        ))}
      </div>
      <div className="h-40 bg-surface-2 rounded-xl" />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <p className="text-ink-muted text-[14px]">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-accent text-white text-[13px] font-medium rounded-lg hover:opacity-90 transition-opacity"
      >
        重试
      </button>
    </div>
  );
}

function GalaxyLocationDetail({ location }: { location: DisplayLocation }) {

  return (
    <div className="space-y-6">
      <LocationHero
        location={location}
        aspectRatio="21/9"
        showCoordinates
        priority
      />

      <StatCardGrid
        stats={[
          {
            label: "Bortle",
            value: `B${location.bortle}`,
            colorClass:
              location.bortle <= 2
                ? "text-success"
                : location.bortle <= 4
                  ? "text-warning"
                  : "text-danger",
          },
          { label: "VIIRS", value: location.viirs },
          { label: "海拔", value: location.elevation },
          { label: "距离", value: location.distance },
        ]}
      />

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-surface-1 rounded-xl border border-hairline p-5">
          <h3 className="text-[14px] font-semibold text-ink mb-3">拍摄条件</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[13px] text-ink-muted">最佳时段</span>
              <span className="text-[13px] font-mono text-ink">
                {location.bestHour}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-ink-muted">云量</span>
              <span className="text-[13px] font-mono text-ink">
                {location.cloudCover}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-ink-muted">降水概率</span>
              <span className="text-[13px] font-mono text-ink">
                {location.precipitation}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-ink-muted">月相</span>
              <span className="text-[13px] font-mono text-ink">
                {location.moonPhase}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface-1 rounded-xl border border-hairline p-5">
          <h3 className="text-[14px] font-semibold text-ink mb-3">标签</h3>
          <TagList tags={location.tags} />
        </div>
      </div>
    </div>
  );
}

function SpaceXLocationDetail({ location, onToggleFavorite }: { location: DisplayLocation; onToggleFavorite: () => void }) {

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
            <button
              onClick={onToggleFavorite}
              className="px-10 py-4 bg-white text-black text-[12px] font-bold tracking-[1.5px] uppercase hover:bg-white/90 transition-colors"
            >
              {location.is_favorite ? "取消收藏" : "收藏地点"}
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
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-white/30 mb-3">
              Bortle 等级
            </p>
            <span
              className={`text-[56px] font-bold ${
                location.bortle <= 2
                  ? "text-white"
                  : location.bortle <= 4
                    ? "text-warning"
                    : "text-danger"
              }`}
            >
              B{location.bortle}
            </span>
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-white/30 mb-3">
              VIIRS 辐亮度
            </p>
            <span className="text-[56px] font-bold text-white">
              {location.viirs}
            </span>
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-white/30 mb-3">
              海拔高度
            </p>
            <span className="text-[56px] font-bold text-white">
              {location.elevation}
            </span>
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-white/30 mb-3">
              直线距离
            </p>
            <span className="text-[56px] font-bold text-white">
              {location.distance}
            </span>
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
          <p className="text-[10px] font-medium tracking-[2px] uppercase text-white/40 mb-4">
            综合评分
          </p>
          <span className="text-[96px] font-bold text-white">
            {location.score}
          </span>
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
              <p className="text-[10px] font-medium tracking-[2px] uppercase text-white/30 mb-3">
                最佳时段
              </p>
              <span className="text-[32px] font-bold text-white">
                {location.bestHour}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-medium tracking-[2px] uppercase text-white/30 mb-3">
                月相
              </p>
              <span className="text-[32px] font-bold text-white">
                {location.moonPhase}
              </span>
            </div>
          </div>
          <div className="space-y-10">
            <div>
              <p className="text-[10px] font-medium tracking-[2px] uppercase text-white/30 mb-3">
                云量
              </p>
              <span className="text-[32px] font-bold text-white">
                {location.cloudCover}%
              </span>
            </div>
            <div>
              <p className="text-[10px] font-medium tracking-[2px] uppercase text-white/30 mb-3">
                降水概率
              </p>
              <span className="text-[32px] font-bold text-white">
                {location.precipitation}%
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function VercelLocationDetail({ location }: { location: DisplayLocation }) {

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/"
        className="text-[13px] text-ink-subtle hover:text-ink transition-colors mb-6 inline-block"
      >
        ← 返回列表
      </Link>

      <LocationHero
        location={location}
        aspectRatio="video"
        priority
        className="rounded-lg mb-8 border border-[rgba(0,0,0,0.08)]"
      >
        <StatusBadge status={location.status} />
      </LocationHero>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[40px] font-bold leading-[1.1] tracking-[-1.5px] text-ink">
            {location.name}
          </h1>
          <p className="text-[14px] text-ink-subtle font-mono mt-2">
            {location.coordinates}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[48px] font-bold text-ink tracking-[-0.04em]">
            {location.score}
          </span>
          <span className="block text-[12px] text-ink-subtle">综合评分</span>
        </div>
      </div>

      <StatCardGrid
        stats={[
          {
            label: "Bortle",
            value: `B${location.bortle}`,
            colorClass:
              location.bortle <= 2
                ? "text-accent"
                : location.bortle <= 4
                  ? "text-warning"
                  : "text-danger",
          },
          { label: "VIIRS", value: location.viirs },
          { label: "海拔", value: location.elevation },
          { label: "距离", value: location.distance },
        ]}
        className="mb-8"
      />

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] p-5">
          <h3 className="text-[14px] font-semibold text-ink mb-4">
            拍摄条件
          </h3>
          <div className="space-y-3">
            {[
              { label: "最佳时段", value: location.bestHour },
              { label: "云量", value: `${location.cloudCover}%` },
              { label: "降水概率", value: `${location.precipitation}%` },
              { label: "月相", value: location.moonPhase },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between py-2 border-b border-[rgba(0,0,0,0.06)] last:border-0"
              >
                <span className="text-[13px] text-ink-subtle">{item.label}</span>
                <span className="text-[13px] font-medium text-ink">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] p-5">
          <h3 className="text-[14px] font-semibold text-ink mb-4">
            标签
          </h3>
          <TagList tags={location.tags} />
        </div>
      </div>
    </div>
  );
}

function SupabaseLocationDetail({ location }: { location: DisplayLocation }) {

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/"
          className="text-[12px] font-mono text-ink-subtle hover:text-emerald-400 transition-colors"
        >
          ← locations
        </Link>
        <span className="text-ink-subtle">/</span>
        <span className="text-[12px] font-mono text-emerald-400">
          {location.id}
        </span>
      </div>

      <LocationHero location={location} aspectRatio="21/9" priority>
        <div className="flex items-end justify-between">
          <div>
            <StatusBadge status={location.status} />
            <h1 className="text-[28px] font-bold text-ink mt-2">
              {location.name}
            </h1>
          </div>
          <span className="text-[36px] font-bold text-emerald-400">
            {location.score}
          </span>
        </div>
      </LocationHero>

      <div className="bg-surface-1 rounded-lg border border-hairline overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-hairline bg-surface-2">
          <span className="w-3 h-3 rounded-full bg-danger" />
          <span className="w-3 h-3 rounded-full bg-warning" />
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="ml-4 text-[12px] font-mono text-ink-subtle tracking-wider">
            location.query.ts
          </span>
        </div>
        <div className="p-4 font-mono text-[13px]">
          <div className="text-ink-subtle mb-2">// 查询地点详情</div>
          <div className="text-emerald-400 mb-1">const</div>
          <div className="pl-4 mb-2">
            <span className="text-ink">location</span>
            <span className="text-ink-subtle"> = </span>
            <span className="text-emerald-400">await</span>
            <span className="text-ink"> db.</span>
            <span className="text-emerald-400">find</span>
            <span className="text-ink">(</span>
            <span className="text-warning">&quot;{location.id}&quot;</span>
            <span className="text-ink">)</span>
          </div>
        </div>
      </div>

      <StatCardGrid
        stats={[
          {
            label: "BORTLE",
            value: location.bortle,
            colorClass:
              location.bortle <= 2
                ? "text-emerald-400"
                : location.bortle <= 4
                  ? "text-warning"
                  : "text-danger",
          },
          { label: "VIIRS", value: location.viirs },
          { label: "ELEVATION", value: location.elevation },
          { label: "DISTANCE", value: location.distance },
        ]}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-1 rounded-lg border border-hairline p-4">
          <h3 className="text-[12px] font-mono text-ink-subtle tracking-wider mb-3">
            CONDITIONS
          </h3>
          <div className="space-y-2">
            {[
              { label: "BEST_HOUR", value: location.bestHour },
              { label: "CLOUD_COVER", value: `${location.cloudCover}%` },
              { label: "PRECIPITATION", value: `${location.precipitation}%` },
              { label: "MOON_PHASE", value: location.moonPhase },
            ].map((item) => (
              <div key={item.label} className="flex justify-between">
                <span className="text-[11px] font-mono text-ink-subtle">
                  {item.label}
                </span>
                <span className="text-[12px] font-mono text-ink">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-1 rounded-lg border border-hairline p-4">
          <h3 className="text-[12px] font-mono text-ink-subtle tracking-wider mb-3">
            TAGS
          </h3>
          <TagList tags={location.tags} />
        </div>
      </div>
    </div>
  );
}

export function LocationDetailContent({ id }: { id: string }) {
  const { current } = useTheme();
  const { location, loading, error, refetch, toggleFavorite } = useLocationDetail(id);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!location) return notFound();

  switch (current) {
    case "spacex":
      return <SpaceXLocationDetail location={location} onToggleFavorite={toggleFavorite} />;
    case "vercel":
      return <VercelLocationDetail location={location} />;
    case "supabase":
      return <SupabaseLocationDetail location={location} />;
    default:
      return <GalaxyLocationDetail location={location} />;
  }
}
