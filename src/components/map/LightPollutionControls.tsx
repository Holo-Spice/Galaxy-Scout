"use client";

import { useState, useCallback } from "react";

interface LightPollutionControlsProps {
  visible: boolean;
  opacity: number;
  onToggleVisibility: () => void;
  onOpacityChange: (opacity: number) => void;
}

const LEGEND_ITEMS = [
  { class: 1, color: "#00008B", label: "极暗 (暗蓝)" },
  { class: 2, color: "#0000CD", label: "暗 (蓝)" },
  { class: 3, color: "#008000", label: "中等 (绿)" },
  { class: 4, color: "#FF8C00", label: "较亮 (橙)" },
  { class: 5, color: "#FF0000", label: "明亮 (红)" },
] as const;

export function LightPollutionControls({
  visible,
  opacity,
  onToggleVisibility,
  onOpacityChange,
}: LightPollutionControlsProps) {
  const [expanded, setExpanded] = useState(false);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onOpacityChange(Number(e.target.value) / 100);
    },
    [onOpacityChange]
  );

  return (
    <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2">
      {expanded && (
        <div className="w-52 bg-surface-1/95 backdrop-blur-sm border border-hairline rounded shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-hairline">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-ink-subtle">
                光污染图层
              </span>
              <button
                onClick={onToggleVisibility}
                className={`px-2 py-0.5 text-[11px] rounded transition-colors duration-150 ${
                  visible
                    ? "bg-accent-muted text-accent"
                    : "bg-surface-2 text-ink-muted hover:text-ink"
                }`}
              >
                {visible ? "已显示" : "已隐藏"}
              </button>
            </div>
          </div>

          <div className="px-3 py-3 border-b border-hairline">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-ink-muted">不透明度</span>
              <span className="text-[12px] font-mono text-ink-subtle">
                {Math.round(opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(opacity * 100)}
              onChange={handleSliderChange}
              className="w-full h-1 bg-hairline-strong rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:cursor-pointer"
              aria-label="图层不透明度"
            />
          </div>

          <div className="px-3 py-3">
            <span className="text-[11px] text-ink-subtle block mb-2">
              光污染等级
            </span>
            <div className="flex flex-col gap-1.5">
              {LEGEND_ITEMS.map((item) => (
                <div key={item.class} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[12px] text-ink-muted">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setExpanded((prev) => !prev)}
        className={`flex items-center justify-center w-10 h-10 rounded bg-surface-1/95 backdrop-blur-sm border transition-colors duration-150 ${
          expanded
            ? "border-accent text-accent"
            : visible
              ? "border-hairline-strong text-ink-muted hover:text-ink hover:border-hairline-strong"
              : "border-hairline text-ink-tertiary hover:text-ink-muted hover:border-hairline-strong"
        }`}
        aria-label="光污染控制"
        aria-expanded={expanded}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="9" r="4" />
          <path d="M9 1v2M9 15v2M1 9h2M15 9h2" />
          <path d="M3.34 3.34l1.42 1.42M13.24 13.24l1.42 1.42M3.34 14.66l1.42-1.42M13.24 4.76l1.42-1.42" />
        </svg>
      </button>
    </div>
  );
}
