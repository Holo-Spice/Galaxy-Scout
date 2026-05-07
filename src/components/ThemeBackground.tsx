"use client";

import { useTheme } from "./ThemeProvider";
import Image from "next/image";

export function ThemeBackground() {
  const { current } = useTheme();

  if (current === "spacex") {
    return (
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/space-hero.jpg"
          alt="Deep space"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      </div>
    );
  }

  if (current === "vercel") {
    return (
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-white" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.2) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>
    );
  }

  if (current === "supabase") {
    return (
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#0a0a0a]" />
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500 rounded-full filter blur-[200px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500 rounded-full filter blur-[160px]" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(62, 207, 142, 0.08) 39px, rgba(62, 207, 142, 0.08) 40px)`,
          }}
        />
      </div>
    );
  }

  return null;
}
