"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "仪表盘", icon: "◉" },
  { href: "/locations", label: "观测地点", icon: "△" },
  { href: "/map", label: "地图", icon: "◎" },
  { href: "/compare", label: "对比", icon: "□" },
  { href: "/settings", label: "设置", icon: "⚙" },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar-base data-[theme=spacex]:sidebar-spacex data-[theme=vercel]:sidebar-vercel data-[theme=supabase]:sidebar-supabase">
      <div className="px-5 py-5">
        <span className="text-[15px] font-semibold text-ink tracking-tight">
          Galaxy Scout
        </span>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`
                nav-link-base
                data-[theme=spacex]:nav-link-spacex
                ${
                  isActive
                    ? "bg-accent-muted text-accent data-[theme=spacex]:bg-white/10 data-[theme=supabase]:bg-emerald-500/20 data-[theme=supabase]:text-emerald-400"
                    : "text-ink-muted hover:bg-surface-2 hover:text-ink"
                }
              `}
            >
              <span className="text-[16px] leading-none">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-hairline">
        <p className="text-[11px] font-medium text-ink-subtle font-mono">
          v0.1.0
        </p>
      </div>
    </aside>
  );
}
