export type ThemeName = "galaxy" | "spacex" | "vercel" | "supabase";

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  description: string;
  colors: {
    canvas: string;
    surface1: string;
    surface2: string;
    surface3: string;
    surface4: string;
    ink: string;
    inkMuted: string;
    inkSubtle: string;
    inkTertiary: string;
    hairline: string;
    hairlineStrong: string;
    hairlineTertiary: string;
    accent: string;
    accentHover: string;
    accentFocus: string;
    accentMuted: string;
    accentStrong: string;
    warning: string;
    warningMuted: string;
    success: string;
    successMuted: string;
    danger: string;
    dangerMuted: string;
  };
  fonts: {
    sans: string;
    mono: string;
  };
  style: {
    borderRadius: string;
    cardShadow: string;
    buttonStyle: "solid" | "ghost" | "pill";
    uppercaseHeaders: boolean;
    letterSpacing: string;
  };
}

export const themes: Record<ThemeName, ThemeConfig> = {
  galaxy: {
    name: "galaxy",
    label: "深空",
    description: "观测站控制台风格",
    colors: {
      canvas: "#0a0b0f",
      surface1: "#12131a",
      surface2: "#181924",
      surface3: "#1e2030",
      surface4: "#252740",
      ink: "#e8eaf0",
      inkMuted: "#a0a4b8",
      inkSubtle: "#6b7084",
      inkTertiary: "#4a4e60",
      hairline: "#1e2030",
      hairlineStrong: "#2a2d42",
      hairlineTertiary: "#363a52",
      accent: "#6e78ff",
      accentHover: "#8a92ff",
      accentFocus: "#5a64e8",
      accentMuted: "rgba(110, 120, 255, 0.12)",
      accentStrong: "rgba(110, 120, 255, 0.25)",
      warning: "#f0a030",
      warningMuted: "rgba(240, 160, 48, 0.15)",
      success: "#34d399",
      successMuted: "rgba(52, 211, 153, 0.15)",
      danger: "#ef4444",
      dangerMuted: "rgba(239, 68, 68, 0.15)",
    },
    fonts: {
      sans: "'Inter', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    style: {
      borderRadius: "12px",
      cardShadow: "none",
      buttonStyle: "solid",
      uppercaseHeaders: false,
      letterSpacing: "normal",
    },
  },
  spacex: {
    name: "spacex",
    label: "星舰",
    description: "电影级全屏摄影风格",
    colors: {
      canvas: "#000000",
      surface1: "rgba(255, 255, 255, 0.03)",
      surface2: "rgba(255, 255, 255, 0.06)",
      surface3: "rgba(255, 255, 255, 0.09)",
      surface4: "rgba(255, 255, 255, 0.12)",
      ink: "#f0f0fa",
      inkMuted: "rgba(240, 240, 250, 0.7)",
      inkSubtle: "rgba(240, 240, 250, 0.5)",
      inkTertiary: "rgba(240, 240, 250, 0.3)",
      hairline: "rgba(240, 240, 250, 0.1)",
      hairlineStrong: "rgba(240, 240, 250, 0.2)",
      hairlineTertiary: "rgba(240, 240, 250, 0.35)",
      accent: "#f0f0fa",
      accentHover: "#ffffff",
      accentFocus: "rgba(240, 240, 250, 0.8)",
      accentMuted: "rgba(240, 240, 250, 0.1)",
      accentStrong: "rgba(240, 240, 250, 0.2)",
      warning: "#f0a030",
      warningMuted: "rgba(240, 160, 48, 0.15)",
      success: "#34d399",
      successMuted: "rgba(52, 211, 153, 0.15)",
      danger: "#ef4444",
      dangerMuted: "rgba(239, 68, 68, 0.15)",
    },
    fonts: {
      sans: "'D-DIN', 'Arial', sans-serif",
      mono: "'D-DIN', monospace",
    },
    style: {
      borderRadius: "0px",
      cardShadow: "none",
      buttonStyle: "ghost",
      uppercaseHeaders: true,
      letterSpacing: "0.96px",
    },
  },
  vercel: {
    name: "vercel",
    label: "极简",
    description: "纯净开发者风格",
    colors: {
      canvas: "#ffffff",
      surface1: "#fafafa",
      surface2: "#f5f5f5",
      surface3: "#eaeaea",
      surface4: "#dfdfdf",
      ink: "#171717",
      inkMuted: "#666666",
      inkSubtle: "#888888",
      inkTertiary: "#aaaaaa",
      hairline: "rgba(0, 0, 0, 0.08)",
      hairlineStrong: "rgba(0, 0, 0, 0.15)",
      hairlineTertiary: "rgba(0, 0, 0, 0.25)",
      accent: "#0070f3",
      accentHover: "#0060df",
      accentFocus: "#0050bf",
      accentMuted: "rgba(0, 112, 243, 0.1)",
      accentStrong: "rgba(0, 112, 243, 0.2)",
      warning: "#f5a623",
      warningMuted: "rgba(245, 166, 35, 0.1)",
      success: "#0070f3",
      successMuted: "rgba(0, 112, 243, 0.1)",
      danger: "#ee0000",
      dangerMuted: "rgba(238, 0, 0, 0.1)",
    },
    fonts: {
      sans: "'Geist', 'Inter', sans-serif",
      mono: "'Geist Mono', 'JetBrains Mono', monospace",
    },
    style: {
      borderRadius: "6px",
      cardShadow: "0px 0px 0px 1px rgba(0,0,0,0.08)",
      buttonStyle: "solid",
      uppercaseHeaders: false,
      letterSpacing: "-0.02em",
    },
  },
  supabase: {
    name: "supabase",
    label: "终端",
    description: "代码编辑器风格",
    colors: {
      canvas: "#0f0f0f",
      surface1: "#171717",
      surface2: "#1c1c1c",
      surface3: "#222222",
      surface4: "#282828",
      ink: "#ebebeb",
      inkMuted: "#a0a0a0",
      inkSubtle: "#707070",
      inkTertiary: "#505050",
      hairline: "#2e2e2e",
      hairlineStrong: "#363636",
      hairlineTertiary: "#393939",
      accent: "#3ecf8e",
      accentHover: "#00c573",
      accentFocus: "#00b368",
      accentMuted: "rgba(62, 207, 142, 0.15)",
      accentStrong: "rgba(62, 207, 142, 0.3)",
      warning: "#f0a030",
      warningMuted: "rgba(240, 160, 48, 0.15)",
      success: "#3ecf8e",
      successMuted: "rgba(62, 207, 142, 0.15)",
      danger: "#ef4444",
      dangerMuted: "rgba(239, 68, 68, 0.15)",
    },
    fonts: {
      sans: "'Circular', 'Inter', sans-serif",
      mono: "'Source Code Pro', 'JetBrains Mono', monospace",
    },
    style: {
      borderRadius: "6px",
      cardShadow: "none",
      buttonStyle: "pill",
      uppercaseHeaders: false,
      letterSpacing: "normal",
    },
  },
};

export function getThemeCSS(theme: ThemeConfig): string {
  return `
    --color-canvas: ${theme.colors.canvas};
    --color-surface-1: ${theme.colors.surface1};
    --color-surface-2: ${theme.colors.surface2};
    --color-surface-3: ${theme.colors.surface3};
    --color-surface-4: ${theme.colors.surface4};
    --color-ink: ${theme.colors.ink};
    --color-ink-muted: ${theme.colors.inkMuted};
    --color-ink-subtle: ${theme.colors.inkSubtle};
    --color-ink-tertiary: ${theme.colors.inkTertiary};
    --color-hairline: ${theme.colors.hairline};
    --color-hairline-strong: ${theme.colors.hairlineStrong};
    --color-hairline-tertiary: ${theme.colors.hairlineTertiary};
    --color-accent: ${theme.colors.accent};
    --color-accent-hover: ${theme.colors.accentHover};
    --color-accent-focus: ${theme.colors.accentFocus};
    --color-accent-muted: ${theme.colors.accentMuted};
    --color-accent-strong: ${theme.colors.accentStrong};
    --color-warning: ${theme.colors.warning};
    --color-warning-muted: ${theme.colors.warningMuted};
    --color-success: ${theme.colors.success};
    --color-success-muted: ${theme.colors.successMuted};
    --color-danger: ${theme.colors.danger};
    --color-danger-muted: ${theme.colors.dangerMuted};
    --font-sans: ${theme.fonts.sans};
    --font-mono: ${theme.fonts.mono};
    --border-radius: ${theme.style.borderRadius};
    --card-shadow: ${theme.style.cardShadow};
    --letter-spacing: ${theme.style.letterSpacing};
  `;
}
