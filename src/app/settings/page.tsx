"use client";

import { useState } from "react";

const DATA_SOURCES = [
  { id: "weather", label: "天气数据", provider: "Open-Meteo", active: true },
  { id: "astronomy", label: "天文数据", provider: "Stellarium Web", active: true },
  { id: "light-pollution", label: "光污染", provider: "VIIRS / World Atlas", active: true },
  { id: "routing", label: "路线规划", provider: "OSRM", active: true },
  { id: "geocoding", label: "地理编码", provider: "Nominatim", active: false },
] as const;

const WEIGHTS = [
  { id: "sky", label: "天空质量", value: 40 },
  { id: "cloud", label: "云量", value: 25 },
  { id: "moon", label: "月相干扰", value: 20 },
  { id: "distance", label: "距离", value: 15 },
] as const;

function SegmentedToggle({
  options,
  value,
  onChange,
}: {
  options: readonly { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex bg-surface-2 rounded p-1 border border-hairline">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`
            px-4 py-2 rounded text-[13px] font-medium transition-all duration-150
            ${
              value === opt.value
                ? "bg-accent text-white shadow-sm"
                : "text-ink-muted hover:text-ink hover:bg-surface-3"
            }
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium
        ${
          active
            ? "bg-success-muted text-success"
            : "bg-surface-3 text-ink-subtle"
        }
      `}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${active ? "bg-success" : "bg-ink-subtle"}`}
      />
      {active ? "在线" : "离线"}
    </span>
  );
}

function WeightRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-24 shrink-0 text-[13px] font-medium text-ink-muted">
        {label}
      </span>
      <div className="flex-1 relative">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="
            w-full h-1.5 bg-surface-3 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3.5
            [&::-webkit-slider-thumb]:h-3.5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-accent
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-surface-1
            [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_var(--color-accent-muted,rgba(110,120,255,0.12))]
            [&::-webkit-slider-thumb]:transition-shadow
            [&::-webkit-slider-thumb]:duration-150
            [&::-webkit-slider-thumb]:hover:shadow-[0_0_0_4px_var(--color-accent-muted,rgba(110,120,255,0.12))]
            [&::-moz-range-thumb]:w-3.5
            [&::-moz-range-thumb]:h-3.5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-accent
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-surface-1
          "
        />
      </div>
      <span className="w-10 text-right font-mono text-[13px] text-ink tabular-nums">
        {value}%
      </span>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface-1 border border-hairline rounded overflow-hidden">
      <div className="px-5 py-4 border-b border-hairline">
        <h2 className="text-[16px] font-semibold text-ink tracking-tight leading-tight">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-[13px] text-ink-muted leading-snug">
            {description}
          </p>
        )}
      </div>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const [units, setUnits] = useState("metric");
  const [origin, setOrigin] = useState("");
  const [weights, setWeights] = useState<number[]>(WEIGHTS.map((w) => w.value));

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-[28px] font-semibold text-ink tracking-tight leading-tight">
          设置
        </h1>
        <p className="text-[13px] text-ink-muted">
          出发点、单位、评分权重与数据源状态
        </p>
      </header>

      <Section
        title="出发点"
        description="用于计算到达各观测地点的距离与时间"
      >
        <div className="space-y-3">
          <label className="block">
            <span className="sr-only">出发地址或坐标</span>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="输入地址或坐标，如 39.9042, 116.4074"
              className="
                w-full bg-surface-2 border border-hairline rounded
                px-3.5 py-2.5 text-[15px] text-ink
                placeholder:text-ink-tertiary
                focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent-muted
                transition-colors duration-150
              "
            />
          </label>
          <p className="text-[11px] text-ink-subtle leading-relaxed">
            支持地名（如「北京市朝阳区」）或十进制坐标（纬度, 经度）
          </p>
        </div>
      </Section>

      <Section title="单位" description="切换距离、温度等度量单位">
        <SegmentedToggle
          options={[
            { label: "公制", value: "metric" },
            { label: "英制", value: "imperial" },
          ]}
          value={units}
          onChange={setUnits}
        />
        <div className="mt-3 flex items-center gap-4 text-[13px] text-ink-subtle">
          <span>
            距离: <span className="text-ink font-mono">{units === "metric" ? "km" : "mi"}</span>
          </span>
          <span className="w-px h-3 bg-hairline" />
          <span>
            温度: <span className="text-ink font-mono">{units === "metric" ? "°C" : "°F"}</span>
          </span>
          <span className="w-px h-3 bg-hairline" />
          <span>
            风速: <span className="text-ink font-mono">{units === "metric" ? "km/h" : "mph"}</span>
          </span>
        </div>
      </Section>

      <Section
        title="评分权重"
        description="调整各因素在综合评分中的占比"
      >
        <div className="space-y-4">
          {WEIGHTS.map((w, i) => (
            <WeightRow
              key={w.id}
              label={w.label}
              value={weights[i]}
              onChange={(v) => {
                const next = [...weights];
                next[i] = v;
                setWeights(next);
              }}
            />
          ))}
          <div className="pt-2 border-t border-hairline flex items-center justify-between">
            <span className="text-[11px] text-ink-subtle">权重总和</span>
            <span
              className={`font-mono text-[13px] tabular-nums ${
                weights.reduce((a, b) => a + b, 0) === 100
                  ? "text-success"
                  : "text-warning"
              }`}
            >
              {weights.reduce((a, b) => a + b, 0)}%
            </span>
          </div>
        </div>
      </Section>

      <Section
        title="数据源状态"
        description="当前连接的外部数据服务"
      >
        <ul className="space-y-0 divide-y divide-hairline">
          {DATA_SOURCES.map((src) => (
            <li
              key={src.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] font-medium text-ink">
                  {src.label}
                </span>
                <span className="text-[11px] text-ink-subtle font-mono">
                  {src.provider}
                </span>
              </div>
              <StatusBadge active={src.active} />
            </li>
          ))}
        </ul>
      </Section>

      <p className="text-[11px] text-ink-tertiary text-center pb-4">
        设置仅保存在本地浏览器中 · 无需登录
      </p>
    </div>
  );
}
