import { locations } from "@/lib/mock-data";
import { CompareTable } from "@/components/CompareTable";

export default function ComparePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-[28px] font-semibold text-ink tracking-tight leading-tight">
          多地点对比
        </h1>
        <p className="text-[13px] text-ink-muted">
          {locations.length} 个候选地点 · 最佳值以{" "}
          <span className="text-accent font-medium">蓝色</span> 高亮标记
        </p>
      </header>

      <CompareTable locations={locations} />
    </div>
  );
}
