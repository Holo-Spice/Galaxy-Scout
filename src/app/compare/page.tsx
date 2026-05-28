"use client";

import { useEffect, useState } from "react";
import { CompareTable } from "@/components/CompareTable";

interface ApiLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  elevation_m: number | null;
  region: string | null;
  is_favorite: boolean;
  personal_rating: number | null;
}

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

function toTableLocation(loc: ApiLocation): TableLocation {
  return {
    id: loc.id,
    name: loc.name,
    tags: loc.region ? [loc.region] : [],
    coverImage: "",
    coordinates: `${loc.latitude.toFixed(2)}°, ${loc.longitude.toFixed(2)}°`,
    elevation: loc.elevation_m != null ? `${Math.round(loc.elevation_m)}m` : "—",
    bortle: 0,
    viirs: 0,
    status: "unknown",
    bestHour: "N/A",
    score: loc.personal_rating ?? 0,
    distance: "—",
    cloudCover: 0,
    precipitation: 0,
    moonPhase: "—",
  };
}

export default function ComparePage() {
  const [locations, setLocations] = useState<TableLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((json) => {
        if (json.error) throw new Error(json.error.message);
        setLocations((json.data as ApiLocation[]).map(toTableLocation));
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

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
