"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { LocationCard } from "@/components/LocationCard";
import { staggerContainer, staggerItem } from "@/lib/animation";

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

interface CardLocation {
  id: string;
  name: string;
  coverImage: string;
  tags: string[];
  coordinates: string;
  elevation: string;
  bortle: number;
  status: "recommended" | "watch" | "not_recommended" | "unknown";
  score: number;
  distance: string;
  cloudCover: number;
}

function toCardLocation(loc: ApiLocation): CardLocation {
  return {
    id: loc.id,
    name: loc.name,
    coverImage: "",
    tags: loc.region ? [loc.region] : [],
    coordinates: `${loc.latitude.toFixed(2)}°, ${loc.longitude.toFixed(2)}°`,
    elevation: loc.elevation_m != null ? `${Math.round(loc.elevation_m)}m` : "—",
    bortle: 0,
    status: "unknown",
    score: loc.personal_rating ?? 0,
    distance: "—",
    cloudCover: 0,
  };
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<CardLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((json) => {
        if (json.error) throw new Error(json.error.message);
        setLocations((json.data as ApiLocation[]).map(toCardLocation));
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-surface-0 px-6 py-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-[24px] font-semibold leading-[1.3] tracking-[-0.3px] text-ink mb-6"
      >
        观测地点
      </motion.h1>

      {loading && (
        <p className="text-ink-subtle text-sm">正在加载地点数据...</p>
      )}
      {error && (
        <p className="text-danger text-sm">加载失败：{error}</p>
      )}
      {!loading && !error && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {locations.map((location) => (
            <motion.div key={location.id} variants={staggerItem}>
              <Link href={`/locations/${location.id}`}>
                <LocationCard location={location} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </main>
  );
}
