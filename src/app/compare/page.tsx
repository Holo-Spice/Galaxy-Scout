"use client";

import { useEffect, useState } from "react";
import { getCompare, getLocations } from "@/lib/api-client";
import type { CompareResult, HourlyCompareData } from "@/domains/compare/types";
import { CompareTable } from "@/components/CompareTable";

interface TableLocation {
  id: string;
  name: string;
  tags: string[];
  coverImage: string;
  coordinates: string;
  elevation: string;
  bortle: number;
  viirs: number;
  status: string;
  bestHour: string;
  score: number;
  distance: string;
  cloudCover: number;
  precipitation: number;
  moonPhase: string;
}

function bestHourData(hourly: HourlyCompareData[]): HourlyCompareData | null {
  if (hourly.length === 0) return null;
  return hourly.reduce((best, h) => (h.totalScore > best.totalScore ? h : best));
}

function toTableLocation(
  item: CompareResult["items"][number],
  locationName: string,
  region: string | null,
  elevationM: number | null,
  latitude: number,
  longitude: number,
): TableLocation {
  const { summary, hourly } = item;
  const best = bestHourData(hourly);

  return {
    id: item.locationId,
    name: locationName,
    tags: region ? [region] : [],
    coverImage: "",
    coordinates: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
    elevation: elevationM != null ? `${Math.round(elevationM)}m` : "—",
    bortle: 0,
    viirs: 0,
    status: summary.recommendation,
    bestHour: summary.bestHourLocal,
    score: summary.totalScore,
    distance:
      summary.distanceKm != null
        ? `${Math.round(summary.distanceKm)} km`
        : "—",
    cloudCover: best?.cloudCoverPct ?? 0,
    precipitation: best?.precipitationMm ?? 0,
    moonPhase: "—",
  };
}

export default function ComparePage() {
  const [locations, setLocations] = useState<TableLocation[]>([]);
  const [meta, setMeta] = useState<CompareResult["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date();
    const dateLocal = today.toISOString().slice(0, 10);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    getLocations()
      .then((allLocations) => {
        if (allLocations.length === 0) {
          setLocations([]);
          setLoading(false);
          return;
        }

        const locationMap = new Map(allLocations.map((l) => [l.id, l]));

        return getCompare({
          locationIds: allLocations.map((l) => l.id),
          dateLocal,
          startHourLocal: 20,
          endHourLocal: 2,
          timezone,
        }).then((result) => {
          const tableLocations = result.items
            .filter((item) => locationMap.has(item.locationId))
            .map((item) => {
              const loc = locationMap.get(item.locationId)!;
              return toTableLocation(
                item,
                loc.name,
                loc.region,
                loc.elevation_m,
                loc.latitude,
                loc.longitude,
              );
            });
          setLocations(tableLocations);
          setMeta(result.meta);
        });
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const staleNames = locations
    .filter((l) => meta?.staleLocationIds.includes(l.id))
    .map((l) => l.name);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-[28px] font-semibold text-ink tracking-tight leading-tight">
          多地点对比
        </h1>
        <p className="text-[13px] text-ink-muted">
          {loading ? "加载中..." : `${locations.length} 个候选地点`} · 最佳值以{" "}
          <span className="text-accent font-medium">蓝色</span> 高亮标记
        </p>
        {!loading && meta && (
          <p className="text-[11px] text-ink-subtle">
            天气数据来源：{meta.weatherSource} · 更新于{" "}
            {new Date(meta.generatedAt).toLocaleString("zh-CN", {
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
        {!loading && staleNames.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-warning-muted border border-warning/20 px-3 py-2 mt-2">
            <span className="text-warning text-sm leading-none mt-0.5">⚠</span>
            <p className="text-[12px] text-warning leading-snug">
              以下地点天气数据已过期，结果可能不准确：{staleNames.join("、")}
            </p>
          </div>
        )}
      </header>

      {loading && (
        <div className="flex items-center justify-center h-48 text-ink-subtle text-sm">
          正在加载地点数据...
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center h-48 text-danger text-sm">
          加载失败：{error}
        </div>
      )}
      {!loading && !error && <CompareTable locations={locations} />}
    </div>
  );
}
