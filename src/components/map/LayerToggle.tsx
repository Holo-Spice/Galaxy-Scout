"use client";

export interface Layer {
  id: string;
  label: string;
  active: boolean;
}

export function LayerToggle({
  layers,
  showLayerPanel,
  onToggleLayer,
  onTogglePanel,
}: {
  layers: Layer[];
  showLayerPanel: boolean;
  onToggleLayer: (id: string) => void;
  onTogglePanel: () => void;
}) {
  return (
    <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
      <div className="relative">
        <button
          onClick={onTogglePanel}
          className={`flex items-center justify-center w-10 h-10 rounded bg-surface-1/95 backdrop-blur-sm border transition-colors duration-150 ${
            showLayerPanel
              ? "border-accent text-accent"
              : "border-hairline text-ink-muted hover:text-ink hover:border-hairline-strong"
          }`}
          aria-label="图层"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 2L2 6l7 4 7-4-7-4z" />
            <path d="M2 10l7 4 7-4" />
            <path d="M2 14l7 4 7-4" />
          </svg>
        </button>

        {showLayerPanel && (
          <div className="absolute bottom-0 left-12 w-48 bg-surface-1/95 backdrop-blur-sm border border-hairline rounded shadow-lg overflow-hidden">
            <div className="px-3 py-2 border-b border-hairline">
              <span className="text-[11px] font-medium text-ink-subtle">图层控制</span>
            </div>
            {layers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onToggleLayer(layer.id)}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-surface-2 transition-colors duration-150"
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors duration-150 ${
                    layer.active
                      ? "bg-accent border-accent"
                      : "border-hairline-strong bg-transparent"
                  }`}
                >
                  {layer.active && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                      <path d="M2 5l2.5 2.5L8 3" />
                    </svg>
                  )}
                </div>
                <span className={`text-[13px] ${layer.active ? "text-ink" : "text-ink-muted"}`}>
                  {layer.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-10 flex justify-center">
        <div className="w-5 border-t border-hairline" />
      </div>

      <button
        className="flex items-center justify-center w-10 h-10 rounded bg-surface-1/95 backdrop-blur-sm border border-hairline text-ink-muted hover:text-ink hover:border-hairline-strong transition-colors duration-150"
        aria-label="放大"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M8 3v10M3 8h10" />
        </svg>
      </button>
      <button
        className="flex items-center justify-center w-10 h-10 rounded bg-surface-1/95 backdrop-blur-sm border border-hairline text-ink-muted hover:text-ink hover:border-hairline-strong transition-colors duration-150"
        aria-label="缩小"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M3 8h10" />
        </svg>
      </button>

      <button
        className="flex items-center justify-center w-10 h-10 rounded bg-surface-1/95 backdrop-blur-sm border border-hairline text-ink-muted hover:text-ink hover:border-hairline-strong transition-colors duration-150"
        aria-label="定位"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="8" cy="8" r="3" />
          <path d="M8 1v3M8 12v3M1 8h3M12 8h3" />
        </svg>
      </button>
    </div>
  );
}
