"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { themes, getThemeCSS, type ThemeName, type ThemeConfig } from "@/lib/themes";

interface ThemeContextValue {
  current: ThemeName;
  theme: ThemeConfig;
  setTheme: (name: ThemeName) => void;
  starfield: boolean;
  toggleStarfield: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<ThemeName>("galaxy");
  const [starfield, setStarfield] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as ThemeName | null;
    if (savedTheme && themes[savedTheme]) setCurrent(savedTheme);
    const savedStarfield = localStorage.getItem("starfield");
    if (savedStarfield !== null) setStarfield(savedStarfield === "true");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const css = getThemeCSS(themes[current]);
    root.setAttribute("style", css);
    root.setAttribute("data-theme", current);
    localStorage.setItem("theme", current);
  }, [current]);

  useEffect(() => {
    localStorage.setItem("starfield", String(starfield));
  }, [starfield]);

  return (
    <ThemeContext.Provider
      value={{
        current,
        theme: themes[current],
        setTheme: setCurrent,
        starfield,
        toggleStarfield: () => setStarfield((prev) => !prev),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
