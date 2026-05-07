import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { ThemeBackground } from "@/components/ThemeBackground";
import { StarfieldWrapper } from "@/components/StarfieldWrapper";

export const metadata = {
  title: "Galaxy Scout",
  description: "Decision tool for astrophotographers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased" style={{ background: "var(--color-canvas)", color: "var(--color-ink)", fontFamily: "var(--font-sans)" }}>
        <ThemeProvider>
          <StarfieldWrapper />
          <ThemeBackground />
          <div className="relative z-10 flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-6 overflow-auto">{children}</main>
          </div>
          <ThemeSwitcher />
        </ThemeProvider>
      </body>
    </html>
  );
}
