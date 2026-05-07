"use client";

import { useTheme } from "./ThemeProvider";
import { themes, type ThemeName } from "@/lib/themes";

const THEME_ORDER: ThemeName[] = ["galaxy", "spacex", "vercel", "supabase"];

export function ThemeSwitcher() {
  const { current, setTheme, starfield, toggleStarfield } = useTheme();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
      <button
        onClick={toggleStarfield}
        title={starfield ? "关闭星空背景" : "开启星空背景"}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
          transition-all duration-200 border
          ${
            starfield
              ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)] border-[var(--color-accent)]"
              : "bg-[var(--color-surface-1)] text-[var(--color-ink-muted)] border-[var(--color-hairline)] hover:border-[var(--color-hairline-strong)] hover:text-[var(--color-ink)]"
          }
        `}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        <span className="hidden sm:inline">星空</span>
      </button>

      <div className="w-px h-6 bg-[var(--color-hairline)]" />

      {THEME_ORDER.map((name) => {
        const t = themes[name];
        const isActive = current === name;
        return (
          <button
            key={name}
            onClick={() => setTheme(name)}
            title={`${t.label} - ${t.description}`}
            className={`
              relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
              transition-all duration-200 border
              ${
                isActive
                  ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)] border-[var(--color-accent)]"
                  : "bg-[var(--color-surface-1)] text-[var(--color-ink-muted)] border-[var(--color-hairline)] hover:border-[var(--color-hairline-strong)] hover:text-[var(--color-ink)]"
              }
            `}
          >
            <span
              className="w-3 h-3 rounded-full border border-[var(--color-hairline)]"
              style={{ backgroundColor: t.colors.accent }}
            />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
