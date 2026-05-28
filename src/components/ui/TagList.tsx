"use client";

interface TagListProps {
  tags?: string[] | null;
  className?: string;
}

export function TagList({ tags, className }: TagListProps) {
  if (!tags || !Array.isArray(tags)) return null;
  
  return (
    <div className={`flex flex-wrap gap-1.5 ${className ?? ""}`}>
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-2 py-0.5 rounded-full bg-surface-2 text-[11px] text-ink-muted"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
