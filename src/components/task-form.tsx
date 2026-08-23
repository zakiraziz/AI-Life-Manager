"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { Task, Priority, TaskStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import toast from "react-hot-toast";

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-priority-low" },
  { value: "medium", label: "Medium", color: "bg-priority-medium" },
  { value: "high", label: "High", color: "bg-priority-high" },
  { value: "urgent", label: "Urgent", color: "bg-priority-urgent" },
];

interface TaskFormProps {
  task?: Task | null;
  onClose: () => void;
}

export function TaskForm({ task, onClose }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState<Priority>(task?.priority || "medium");
  const [status, setStatus] = useState<TaskStatus>(task?.status || "todo");
  const [dueDate, setDueDate] = useState<string>(
    task?.due_date ? format(new Date(task.due_date), "yyyy-MM-dd") : ""
  );

  const titleRef = useRef<HTMLInputElement>(null);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Listen for Ctrl+Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [title, description, priority, dueDate, status]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      status,
    };

    try {
      if (task) {
        await updateTask.mutateAsync({ id: task.id, ...payload });
      } else {
        await createTask.mutateAsync(payload);
      }
      toast.success(task ? "Task updated" : "Task created");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {task ? "Edit Task" : "New Task"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="input-base text-lg font-medium"
            required
          />

          {/* Description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)..."
            className="input-base min-h-[80px] resize-none"
            rows={3}
          />

          {/* Priority + Status */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Priority
              </label>
              <div className="flex gap-1.5">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      priority === opt.value
                        ? "ring-2 ring-primary ring-offset-2"
                        : "hover:bg-accent"
                    )}
                  >
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full inline-block mr-1",
                        opt.color
                      )}
                    />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="input-base"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Due Date
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input-base pl-10"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTask.isPending || updateTask.isPending}
            >
              {createTask.isPending || updateTask.isPending
                ? "Saving..."
                : task
                ? "Update Task"
                : "Create Task"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Pro tip: Press <kbd className="px-1.5 py-0.5 bg-muted rounded">Ctrl</kbd> +
            <kbd className="px-1.5 py-0.5 bg-muted rounded">Enter</kbd> to save
          </p>
        </form>
      </motion.div>
    </motion.div>
  );
}