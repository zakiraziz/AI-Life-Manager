"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Habit } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCreateHabit, useUpdateHabit } from "@/hooks/use-habits";
import toast from "react-hot-toast";

const habitColors = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f97316", "#eab308",
  "#22c55e", "#14b8a3", "#3b82f6", "#f43f5e", "#a78bfa",
];

interface HabitFormProps {
  habit?: Habit | null;
  onClose: () => void;
}

export function HabitForm({ habit, onClose }: HabitFormProps) {
  const [name, setName] = useState(habit?.name || "");
  const [description, setDescription] = useState(habit?.description || "");
  const [color, setColor] = useState(habit?.color || "#6366f1");
  const titleRef = useRef<HTMLInputElement>(null);

  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) {
      toast.error("Habit name is required");
      return;
    }

    try {
      if (habit) {
        await updateHabit.mutateAsync({ id: habit.id, name, description, color });
        toast.success("Habit updated");
      } else {
        await createHabit.mutateAsync({ name, description, color });
        toast.success("Habit created");
      }
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
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {habit ? "Edit Habit" : "New Habit"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={titleRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Habit name..."
            className="input-base text-lg font-medium"
            required
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)..."
            className="input-base min-h-[60px] resize-none"
            rows={2}
          />

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {habitColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    color === c && "ring-2 ring-primary ring-offset-2"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createHabit.isPending || updateHabit.isPending}
            >
              {createHabit.isPending || updateHabit.isPending
                ? "Saving..."
                : habit
                ? "Update Habit"
                : "Create Habit"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}