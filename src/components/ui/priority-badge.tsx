import { Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
  showDot?: boolean;
}

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-priority-low" },
  medium: { label: "Medium", color: "bg-priority-medium" },
  high: { label: "High", color: "bg-priority-high" },
  urgent: { label: "Urgent", color: "bg-priority-urgent" },
};

export function PriorityBadge({ priority, className, showDot = true }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.color,
        "text-white",
        className
      )}
    >
      {showDot && <span className="w-1.5 h-1.5 rounded-full bg-white/30" />}
      {config.label}
    </span>
  );
}
