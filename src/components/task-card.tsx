"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Calendar, Clock, CheckCircle2, Circle, Trash2, Edit2, GripVertical } from "lucide-react";
import { Task, Priority } from "@/lib/types";
import { isPastDue } from "@/lib/utils";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { cn } from "@/lib/utils";
import { Confetti } from "@/components/confetti";
import toast from "react-hot-toast";
import {
  useUpdateTask,
} from "@/hooks/use-tasks";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  isDragging?: boolean;
}

const priorityBorder: Record<Priority, string> = {
  low: "border-l-green-400",
  medium: "border-l-amber-400",
  high: "border-l-red-400",
  urgent: "border-l-purple-400",
};

export function TaskCard({ task, onEdit, onDelete, isDragging }: TaskCardProps) {
  const [confettiKey, setConfettiKey] = useState(0);
  const updateTask = useUpdateTask();

  const handleToggleComplete = async () => {
    if (task.status === "done") {
      await updateTask.mutateAsync({ id: task.id, status: "todo" });
    } else {
      await updateTask.mutateAsync({
        id: task.id,
        status: "done",
        completed_at: new Date().toISOString(),
      });
      setConfettiKey((k) => k + 1);
      toast.success(`"${task.title}" completed! 🎉`, {
        duration: 3000,
        icon: "✅",
      });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task);
  };

  return (
    <>
      <Confetti trigger={confettiKey > 0} />
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2 }}
        className={cn(
          "group relative bg-card rounded-xl border border-border p-4 cursor-pointer transition-all",
          "hover:shadow-md hover:border-border",
          isDragging && "opacity-50 scale-95",
          priorityBorder[task.priority],
          "border-l-4",
          task.status !== "done" &&
            task.due_date &&
            isPastDue(task.due_date) &&
            "ring-2 ring-destructive/30",
        )}
        onClick={() => {}}
      >
        <div className="flex items-start gap-3">
          {/* Drag handle + Status toggle */}
          <div className="flex flex-col items-center gap-1 pt-0.5">
            <GripVertical className="w-4 h-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
            <button
              onClick={handleToggleComplete}
              className="w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-all hover:scale-110"
            >
              {task.status === "done" ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-500/20" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p
                  className={cn(
                    "font-medium text-sm",
                    task.status === "done" && "line-through opacity-60"
                  )}
                >
                  {task.title}
                </p>
                {task.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 ml-2">
                <PriorityBadge priority={task.priority} />
                <button
                  onClick={handleEdit}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-accent transition-colors"
                  title="Edit task"
                >
                  <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button
                  onClick={handleDelete}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-accent hover:text-destructive transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Meta info */}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {task.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span
                    className={cn(
                      "inline-flex items-center gap-1",
                      task.status === "done"
                        ? "line-through opacity-60"
                        : isPastDue(task.due_date)
                        ? "text-destructive font-medium"
                        : format(new Date(task.due_date), "MMM d") ===
                            format(new Date(), "MMM d") && "text-primary font-medium",
                    )}
                  >
                    {format(new Date(task.due_date), "MMM d")}
                    {task.status !== "done" && isPastDue(task.due_date) && (
                      <span className="text-red-500">⚠️</span>
                    )}
                  </span>
                </div>
              )}
              {task.created_at && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Created {format(new Date(task.created_at), "MMM d")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
