"use client";

const DETAIL = {
  name: "天荒坪",
  coords: "30.4856° N, 119.5936° E",
  elevation: "1,087 m",
  bortle: "2",
  viirs: "0.42 mW/cm²·sr",
  sqm: "21.8 mag/arcsec²",
  status: "recommended" as const,
};

const statusMap = {
  recommended: { label: "推荐", color: "text-success", bg: "bg-success-muted", dot: "bg-success" },
  watch: { label: "观望", color: "text-warning", bg: "bg-warning-muted", dot: "bg-warning" },
  not_recommended: { label: "不推荐", color: "text-danger", bg: "bg-danger-muted", dot: "bg-danger" },
} as const;

function StatusBadge({ status }: { status: keyof typeof statusMap }) {
  const s = statusMap[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${s.color} ${s.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function LocationPanel({ onClose }: { onClose: () => void }) {
  const rows = [
    { label: "坐标", value: DETAIL.coords, mono: true },
    { label: "海拔", value: DETAIL.elevation, mono: true },
    { label: "Bortle 等级", value: DETAIL.bortle, mono: true },
    { label: "VIIRS 辐亮度", value: DETAIL.viirs, mono: true },
    { label: "SQM 测量", value: DETAIL.sqm, mono: true },
  ];

  return (
    <aside className="flex flex-col bg-surface-1 border-l border-hairline w-[320px] shrink-0 overflow-y-auto">
      <div className="flex items-center justify-between px-5 py-4 border-b border-hairline">
        <div className="flex items-center gap-3">
          <h2 className="text-[18px] font-semibold text-ink tracking-[-0.3px]">
            {DETAIL.name}
          </h2>
          <StatusBadge status={DETAIL.status} />
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded text-ink-subtle hover:text-ink hover:bg-surface-2 transition-colors duration-150"
          aria-label="关闭详情面板"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>

      <div className="px-5 py-4 space-y-4">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-ink-subtle tracking-[0.05px]">
              {r.label}
            </span>
            <span className={`text-[13px] text-ink ${r.mono ? "font-mono" : ""}`}>
              {r.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mx-5 border-t border-hairline" />

      <div className="px-5 py-4 space-y-2">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-accent text-white text-[14px] font-medium hover:bg-accent-hover active:bg-accent-focus active:scale-[0.98] transition-all duration-150">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M8 1v14M1 8h14" />
          </svg>
          添加到候选
        </button>
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded border border-hairline text-ink text-[14px] font-medium hover:bg-surface-2 hover:border-hairline-strong transition-all duration-150">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M8 2C5.24 2 3 4.24 3 7c0 3.75 5 7 5 7s5-3.25 5-7c0-2.76-2.24-5-5-5z" />
            <circle cx="8" cy="7" r="1.5" />
          </svg>
          导航前往
        </button>
      </div>

      <div className="mt-auto px-5 py-3 border-t border-hairline">
        <p className="text-[11px] text-ink-subtle">
          数据来源: VIIRS 2025-04 · SQM 实测 2025-03
        </p>
      </div>
    </aside>
  );
}
